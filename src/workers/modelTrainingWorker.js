import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

let _context = null;
let _model = null;

const TRAINING = {
    epochs: 25,
    batchSize: 64,
    topSamples: 50,
    middleSamples: 30,
    bottomSamples: 50,
};

const USER_GENRE_TO_MOVIE_GENRE = {
    acao: 'Action',
    aventura: 'Adventure',
    animacao: 'Animation',
    biografia: 'Biography',
    comedia: 'Comedy',
    crime: 'Crime',
    documentario: 'Documentary',
    drama: 'Drama',
    esporte: 'Sport',
    fantasia: 'Fantasy',
    'ficcao cientifica': 'Sci-Fi',
    musical: 'Musical',
    romance: 'Romance',
    suspense: 'Thriller',
    terror: 'Horror',
    historia: 'History',
    misterio: 'Mystery',
    guerra: 'War',
    familia: 'Family',
};

const HOBBY_GENRE_HINTS = {
    cinema: ['Drama', 'Romance', 'Crime'],
    tecnologia: ['Sci-Fi', 'Documentary', 'Thriller'],
    'jogar videogame': ['Action', 'Adventure', 'Sci-Fi', 'Fantasy'],
    corrida: ['Sport', 'Action'],
    esportes: ['Sport', 'Action'],
    academia: ['Sport', 'Action'],
    'assistir series': ['Drama', 'Crime', 'Thriller'],
    'ler livros': ['Drama', 'Mystery', 'Biography'],
    podcasts: ['Documentary', 'Mystery'],
    musica: ['Musical', 'Drama'],
    dancar: ['Musical', 'Romance'],
    arte: ['Animation', 'Biography', 'Drama'],
    fotografia: ['Documentary', 'Drama'],
    cozinhar: ['Documentary', 'Drama'],
    viajar: ['Adventure', 'Documentary'],
    yoga: ['Documentary', 'Drama'],
};

const normalizeToken = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalize = (value, min, max) => (value - min) / ((max - min) || 1);
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function parseList(value) {
    if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean);
    }

    if (!value || typeof value !== 'string') return [];

    const content = value.trim().replace(/^\[/, '').replace(/\]$/, '');
    if (!content) return [];

    return content
        .split(',')
        .map(item => item.replace(/['"]/g, '').trim())
        .filter(Boolean);
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getMovieField(movie, ...possibleKeys) {
    for (const key of possibleKeys) {
        if (movie?.[key] !== undefined && movie?.[key] !== null) {
            return movie[key];
        }
    }

    return undefined;
}

function getPreferredYearNormByAge(age) {
    if (age <= 17) return 0.9;
    if (age <= 25) return 0.8;
    if (age <= 40) return 0.68;
    if (age <= 55) return 0.56;
    return 0.45;
}

function mapUserGenre(genre) {
    const key = normalizeToken(genre);
    return USER_GENRE_TO_MOVIE_GENRE[key] || genre;
}

function normalizeMovie(rawMovie, index) {
    const genres = parseList(getMovieField(rawMovie, 'Genre', 'generos'));
    const genreTokens = genres.map(genre => normalizeToken(genre)).filter(Boolean);
    const description = parseList(getMovieField(rawMovie, 'Description', 'descricao')).join(' ');

    return {
        id: toNumber(getMovieField(rawMovie, 'Unnamed: 0', 'id'), index) + 1,
        name: getMovieField(rawMovie, 'Movie Name', 'nome_filme') || `Filme ${index + 1}`,
        year: toNumber(getMovieField(rawMovie, 'Year of Release', 'ano_lancamento'), 0),
        runtime: toNumber(getMovieField(rawMovie, 'Run Time in minutes', 'duracao_minutos'), 0),
        rating: toNumber(getMovieField(rawMovie, 'Movie Rating', 'avaliacao'), 0),
        votes: toNumber(getMovieField(rawMovie, 'Votes', 'votos'), 0),
        metaScore: toNumber(getMovieField(rawMovie, 'MetaScore', 'metascore'), 0),
        gross: toNumber(getMovieField(rawMovie, 'Gross', 'bilheteria'), 0),
        genres,
        genreTokens,
        certification: getMovieField(rawMovie, 'Certification', 'classificacao_indicativa') || 'N/A',
        description: description || 'Sem descrição disponível.',
    };
}

function normalizeUser(rawUser) {
    const favoriteGenres = (rawUser.favorite_genres || []).map(mapUserGenre);
    const favoriteGenreTokens = favoriteGenres
        .map(genre => normalizeToken(genre))
        .filter(Boolean);
    const hobbyTokens = (rawUser.hobbies || [])
        .map(hobby => normalizeToken(hobby))
        .filter(Boolean);

    return {
        ...rawUser,
        favoriteGenres,
        favoriteGenreTokens,
        hobbyTokens,
    };
}

function collectMinMax(values) {
    const valid = values.filter(value => Number.isFinite(value));
    if (!valid.length) return { min: 0, max: 1 };

    return {
        min: Math.min(...valid),
        max: Math.max(...valid),
    };
}

function oneHot(tokens, indexMap, length) {
    const vector = new Array(length).fill(0);
    const uniqueTokens = new Set(tokens);

    uniqueTokens.forEach(token => {
        const index = indexMap[token];
        if (Number.isInteger(index)) {
            vector[index] = 1;
        }
    });

    return vector;
}

function dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
        sum += a[i] * b[i];
    }
    return sum;
}

function certificationPenalty(age, certification) {
    const normalizedCert = normalizeToken(certification);
    if (age < 16 && (normalizedCert === 'r' || normalizedCert === 'nc-17')) {
        return -0.12;
    }

    if (age < 13 && normalizedCert === 'pg-13') {
        return -0.06;
    }

    return 0;
}

function sampleEvenly(items, count) {
    if (items.length <= count) return items;

    const step = items.length / count;
    const sampled = [];
    for (let i = 0; i < count; i += 1) {
        sampled.push(items[Math.floor(i * step)]);
    }
    return sampled;
}

function createUserState(user, context) {
    const age = toNumber(user.age, context.ageStats.min);
    const ageNorm = normalize(age, context.ageStats.min, context.ageStats.max);

    const normalizedGender = normalizeToken(user.gender);
    const genderVector = [
        normalizedGender === 'mulher' ? 1 : 0,
        normalizedGender === 'homem' ? 1 : 0,
        !['mulher', 'homem'].includes(normalizedGender) ? 1 : 0,
    ];

    const favoriteGenreVector = oneHot(
        user.favoriteGenreTokens,
        context.genreIndex,
        context.genreDimensions
    );
    const favoriteGenreCount = favoriteGenreVector.reduce((acc, value) => acc + value, 0);

    const hobbyGenres = user.hobbyTokens.flatMap(hobbyToken => {
        return HOBBY_GENRE_HINTS[hobbyToken] || [];
    });
    const hobbyGenreTokens = hobbyGenres.map(genre => normalizeToken(genre));
    const hobbyGenreVector = oneHot(
        hobbyGenreTokens,
        context.genreIndex,
        context.genreDimensions
    );
    const hobbyGenreCount = hobbyGenreVector.reduce((acc, value) => acc + value, 0);

    return {
        user,
        age,
        ageNorm,
        favoriteGenreVector,
        favoriteGenreCount,
        hobbyGenreVector,
        hobbyGenreCount,
        vector: [
            ageNorm,
            ...genderVector,
            ...favoriteGenreVector,
            ...hobbyGenreVector,
        ],
    };
}

function buildContext(rawMovies, rawUsers) {
    const movies = rawMovies
        .map((movie, index) => normalizeMovie(movie, index))
        .filter(movie => movie.genreTokens.length > 0 && movie.rating > 0);

    const users = rawUsers.map(normalizeUser);

    const genreSet = new Set();
    movies.forEach(movie => movie.genreTokens.forEach(token => genreSet.add(token)));
    users.forEach(user => user.favoriteGenreTokens.forEach(token => genreSet.add(token)));

    const genres = [...genreSet];
    const genreIndex = Object.fromEntries(genres.map((genre, index) => [genre, index]));
    const genreDimensions = genres.length;

    const ageStats = collectMinMax(users.map(user => toNumber(user.age, 0)));
    const yearStats = collectMinMax(movies.map(movie => movie.year));
    const runtimeStats = collectMinMax(movies.map(movie => movie.runtime));
    const ratingStats = collectMinMax(movies.map(movie => movie.rating));
    const metaStats = collectMinMax(movies.map(movie => movie.metaScore));
    const votesStats = collectMinMax(movies.map(movie => Math.log1p(movie.votes)));
    const grossStats = collectMinMax(movies.map(movie => Math.log1p(movie.gross)));

    const movieStates = movies.map(movie => {
        const yearNorm = normalize(movie.year, yearStats.min, yearStats.max);
        const runtimeNorm = normalize(movie.runtime, runtimeStats.min, runtimeStats.max);
        const ratingNorm = normalize(movie.rating, ratingStats.min, ratingStats.max);
        const metaNorm = normalize(movie.metaScore, metaStats.min, metaStats.max);
        const votesNorm = normalize(Math.log1p(movie.votes), votesStats.min, votesStats.max);
        const grossNorm = normalize(Math.log1p(movie.gross), grossStats.min, grossStats.max);
        const genreVector = oneHot(movie.genreTokens, genreIndex, genreDimensions);

        const qualityScore = (
            (0.45 * ratingNorm) +
            (0.25 * metaNorm) +
            (0.2 * votesNorm) +
            (0.1 * grossNorm)
        );

        return {
            movie,
            yearNorm,
            qualityScore,
            genreVector,
            vector: [
                yearNorm,
                runtimeNorm,
                ratingNorm,
                votesNorm,
                metaNorm,
                grossNorm,
                ...genreVector,
            ],
        };
    });

    const userStates = users.map(user => createUserState(user, {
        ageStats,
        genreIndex,
        genreDimensions,
    }));

    const userFeatureSize = userStates[0]?.vector.length || (1 + 3 + (genreDimensions * 2));
    const movieFeatureSize = movieStates[0]?.vector.length || (6 + genreDimensions);
    const interactionFeatureSize = 4;

    return {
        users,
        movies,
        userStates,
        movieStates,
        ageStats,
        genreIndex,
        genreDimensions,
        inputDimension: userFeatureSize + movieFeatureSize + interactionFeatureSize,
    };
}

function computeAffinity(userState, movieState) {
    const genreOverlap = dot(userState.favoriteGenreVector, movieState.genreVector) /
        (userState.favoriteGenreCount || 1);

    const hobbyOverlap = dot(userState.hobbyGenreVector, movieState.genreVector) /
        (userState.hobbyGenreCount || 1);

    const preferredYear = getPreferredYearNormByAge(userState.age);
    const recencyAffinity = 1 - Math.abs(movieState.yearNorm - preferredYear);

    const baseScore = (
        (0.58 * genreOverlap) +
        (0.14 * hobbyOverlap) +
        (0.2 * movieState.qualityScore) +
        (0.08 * recencyAffinity)
    );

    const adjustedScore = baseScore + certificationPenalty(
        userState.age,
        movieState.movie.certification
    );

    return clamp(adjustedScore);
}

function buildPairVector(userState, movieState) {
    const genreOverlap = dot(userState.favoriteGenreVector, movieState.genreVector) /
        (userState.favoriteGenreCount || 1);
    const hobbyOverlap = dot(userState.hobbyGenreVector, movieState.genreVector) /
        (userState.hobbyGenreCount || 1);
    const preferredYear = getPreferredYearNormByAge(userState.age);
    const recencyAffinity = 1 - Math.abs(movieState.yearNorm - preferredYear);

    return [
        ...userState.vector,
        ...movieState.vector,
        genreOverlap,
        hobbyOverlap,
        recencyAffinity,
        movieState.qualityScore,
    ];
}

function createTrainingData(context) {
    const inputs = [];
    const labels = [];

    context.userStates.forEach(userState => {
        const scoredMovies = context.movieStates.map((movieState, movieIndex) => ({
            movieIndex,
            score: computeAffinity(userState, movieState),
        }));

        scoredMovies.sort((a, b) => b.score - a.score);

        const topMovies = scoredMovies.slice(0, TRAINING.topSamples);
        const bottomMovies = scoredMovies.slice(-TRAINING.bottomSamples);
        const middlePool = scoredMovies.slice(
            TRAINING.topSamples,
            Math.max(TRAINING.topSamples, scoredMovies.length - TRAINING.bottomSamples)
        );
        const middleMovies = sampleEvenly(middlePool, TRAINING.middleSamples);

        const selectedMovies = [...topMovies, ...middleMovies, ...bottomMovies];

        selectedMovies.forEach(({ movieIndex, score }) => {
            const movieState = context.movieStates[movieIndex];
            inputs.push(buildPairVector(userState, movieState));
            labels.push(score);
        });
    });

    return {
        xs: tf.tensor2d(inputs, [inputs.length, context.inputDimension]),
        ys: tf.tensor2d(labels, [labels.length, 1]),
    };
}

function buildModel(inputDimension) {
    const model = tf.sequential();

    model.add(tf.layers.dense({
        inputShape: [inputDimension],
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
    }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
    }));
    model.add(tf.layers.dropout({ rate: 0.15 }));

    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
    }));

    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
    }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
    });

    return model;
}

async function trainModel({ users, movieDataPath = '/data/movie.json' }) {
    postMessage({
        type: workerEvents.progressUpdate,
        progress: {
            progress: 1,
            status: 'Carregando base de filmes...',
        }
    });

    const selectedMovieDataPath =
        typeof movieDataPath === 'string' && movieDataPath
            ? movieDataPath
            : '/data/movie.json';
    const rawMovies = await (await fetch(selectedMovieDataPath)).json();
    const context = buildContext(rawMovies, users);
    _context = context;

    const trainData = createTrainingData(context);

    if (_model) {
        _model.dispose();
    }

    _model = buildModel(context.inputDimension);

    await _model.fit(trainData.xs, trainData.ys, {
        epochs: TRAINING.epochs,
        batchSize: TRAINING.batchSize,
        shuffle: true,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                const progress = Math.round(((epoch + 1) / TRAINING.epochs) * 100);
                const mae = logs.mae ?? logs.meanAbsoluteError ?? 0;

                postMessage({
                    type: workerEvents.trainingLog,
                    epoch,
                    loss: logs.loss,
                    mae,
                    valLoss: logs.val_loss ?? null,
                    valMae: logs.val_mae ?? null,
                });

                postMessage({
                    type: workerEvents.progressUpdate,
                    progress: {
                        progress,
                        status: `Treinando época ${epoch + 1}/${TRAINING.epochs} (loss ${logs.loss.toFixed(4)})`,
                    }
                });
            }
        }
    });

    trainData.xs.dispose();
    trainData.ys.dispose();

    postMessage({
        type: workerEvents.progressUpdate,
        progress: {
            progress: 100,
            status: 'Treinamento concluído',
        }
    });
    postMessage({ type: workerEvents.trainingComplete });
}

function buildUserStateForInference(user) {
    const normalizedUser = normalizeUser(user);
    const index = _context.users.findIndex(item => item.id === normalizedUser.id);

    if (index >= 0) {
        return _context.userStates[index];
    }

    return createUserState(normalizedUser, _context);
}

function recommend({ user }) {
    if (!_model || !_context) return;

    const userState = buildUserStateForInference(user);
    const inputs = _context.movieStates.map(movieState => buildPairVector(userState, movieState));

    const inputTensor = tf.tensor2d(inputs, [inputs.length, _context.inputDimension]);
    const predictionTensor = _model.predict(inputTensor);
    const scores = Array.from(predictionTensor.dataSync());

    predictionTensor.dispose();
    inputTensor.dispose();

    const recommendations = _context.movieStates
        .map((movieState, index) => ({
            ...movieState.movie,
            score: scores[index],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations,
    });
}

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = event => {
    const { action, ...data } = event.data;
    if (handlers[action]) {
        handlers[action](data);
    }
};
