const LANGUAGES = {
    EN: 'en',
    PT_BR: 'pt-br',
};

const DEFAULT_LANGUAGE = LANGUAGES.EN;

const translations = {
    [LANGUAGES.EN]: {
        'meta.title': 'Recomendação de filme',
        'header.title': 'Recomendação de filme',
        'header.subtitle': 'Choose a user and get 5 personalized recommendations.',
        'profile.title': 'User Profile',
        'form.user': 'User',
        'form.selectPlaceholder': '-- Select --',
        'form.age': 'Age',
        'form.gender': 'Gender',
        'form.favoriteGenres': 'Favorite genres',
        'form.hobbies': 'Hobbies',
        'form.description': 'Description',
        'training.title': 'Model Training',
        'training.button.idle': 'Train Model',
        'training.button.running': 'Training...',
        'training.progressAriaLabel': 'Training progress',
        'training.status.waitingInitial': 'Waiting for initial training...',
        'training.status.preparingData': 'Preparing data for training...',
        'training.status.loadingMovieBase': 'Loading movie dataset...',
        'training.status.epoch': 'Training epoch {epoch}/{total} (loss {loss})',
        'training.status.starting': 'Starting training...',
        'training.status.inProgress': 'Training in progress...',
        'training.status.completed': 'Training completed.',
        'training.status.completedSwitchUser': 'Training finished. Change the user to refresh recommendations.',
        'recommendations.title': 'Top 5 Recommendations',
        'recommendations.emptyBeforeTrain': 'Train the model and select a user to see recommendations.',
        'recommendations.noneForProfile': 'No movies recommended for this profile.',
        'recommendations.forUser': 'Recommendations for {name}',
        'recommendations.baseline': 'Baseline ranking (before personalization)',
        'dataset.label': 'Data: EN',
        'movie.label.year': 'Year:',
        'movie.label.runtime': 'Runtime:',
        'movie.label.imdb': 'IMDb Rating:',
        'movie.label.votes': 'Votes:',
        'movie.label.score': 'ML Score:',
        'misc.noGenre': 'No genre',
        'misc.noDescription': 'No description available.',
        'misc.noData': 'No data',
        'misc.na': 'N/A',
        'button.switchToPtBr': 'Trocar para pt-br',
        'button.switchToEn': 'Switch to EN',
    },
    [LANGUAGES.PT_BR]: {
        'meta.title': 'Recomendador de Filmes',
        'header.title': 'Recomendador de Filmes',
        'header.subtitle': 'Escolha um usuário e receba 5 recomendações personalizadas.',
        'profile.title': 'Perfil do Usuário',
        'form.user': 'Usuário',
        'form.selectPlaceholder': '-- Selecione --',
        'form.age': 'Idade',
        'form.gender': 'Gênero',
        'form.favoriteGenres': 'Gêneros favoritos',
        'form.hobbies': 'Hobbies',
        'form.description': 'Descrição',
        'training.title': 'Treinamento do Modelo',
        'training.button.idle': 'Treinar Modelo',
        'training.button.running': 'Treinando...',
        'training.progressAriaLabel': 'Progresso do treinamento',
        'training.status.waitingInitial': 'Aguardando treinamento inicial...',
        'training.status.preparingData': 'Preparando dados para treinamento...',
        'training.status.loadingMovieBase': 'Carregando base de filmes...',
        'training.status.epoch': 'Treinando época {epoch}/{total} (loss {loss})',
        'training.status.starting': 'Iniciando treinamento...',
        'training.status.inProgress': 'Treinamento em andamento...',
        'training.status.completed': 'Treinamento concluído.',
        'training.status.completedSwitchUser': 'Treinamento finalizado. Troque o usuário para atualizar as recomendações.',
        'recommendations.title': 'Top 5 Recomendações',
        'recommendations.emptyBeforeTrain': 'Treine o modelo e selecione um usuário para ver recomendações.',
        'recommendations.noneForProfile': 'Nenhum filme recomendado para este perfil.',
        'recommendations.forUser': 'Recomendações para {name}',
        'recommendations.baseline': 'Ranking base (antes da personalização)',
        'dataset.label': 'Dados: EN',
        'movie.label.year': 'Ano:',
        'movie.label.runtime': 'Duração:',
        'movie.label.imdb': 'Nota IMDb:',
        'movie.label.votes': 'Votos:',
        'movie.label.score': 'Score ML:',
        'misc.noGenre': 'Sem gênero',
        'misc.noDescription': 'Sem descrição disponível.',
        'misc.noData': 'Sem dados',
        'misc.na': 'N/A',
        'button.switchToPtBr': 'Trocar para pt-br',
        'button.switchToEn': 'Switch to EN',
    },
};

const userValueTranslations = {
    [LANGUAGES.EN]: {
        mulher: 'woman',
        homem: 'man',
        'Animação': 'Animation',
        Aventura: 'Adventure',
        'Ação': 'Action',
        Biografia: 'Biography',
        'Comédia': 'Comedy',
        Crime: 'Crime',
        Documentário: 'Documentary',
        Drama: 'Drama',
        Esporte: 'Sport',
        Fantasia: 'Fantasy',
        'Ficção Científica': 'Science Fiction',
        Histórico: 'Historical',
        Musical: 'Musical',
        Romance: 'Romance',
        Suspense: 'Thriller',
        Terror: 'Horror',
        academia: 'gym',
        arte: 'art',
        'assistir séries': 'watch series',
        'board games': 'board games',
        caminhadas: 'hiking',
        cinema: 'cinema',
        corrida: 'running',
        cozinhar: 'cooking',
        'culinária internacional': 'international cuisine',
        'dançar': 'dancing',
        esportes: 'sports',
        fotografia: 'photography',
        'jogar videogame': 'playing video games',
        'ler livros': 'reading books',
        'música': 'music',
        podcasts: 'podcasts',
        'programação': 'programming',
        tecnologia: 'technology',
        viajar: 'traveling',
        yoga: 'yoga',
        'Gosta de conteúdos inspiradores e motivacionais.': 'Likes inspiring and motivational content.',
        'Pessoa curiosa que gosta de explorar novas histórias e experiências culturais.': 'Curious person who likes to explore new stories and cultural experiences.',
        'Gosta de produções modernas com boa fotografia e trilha sonora.': 'Likes modern productions with good cinematography and soundtrack.',
        'Valoriza roteiros inteligentes e reviravoltas inesperadas.': 'Values smart scripts and unexpected twists.',
        'Prefere filmes emocionantes e cheios de ação.': 'Prefers exciting and action-packed movies.',
        'Aprecia narrativas profundas e reflexivas.': 'Appreciates deep and reflective narratives.',
        'Busca entretenimento leve para relaxar após o trabalho.': 'Looks for light entertainment to relax after work.',
        'Interessa-se por histórias baseadas em fatos reais.': 'Interested in stories based on real events.',
        'Costuma assistir filmes em família nos fins de semana.': 'Usually watches movies with family on weekends.',
        'Prefere filmes envolventes com personagens bem desenvolvidos.': 'Prefers immersive movies with well-developed characters.',
    },
    [LANGUAGES.PT_BR]: {},
};

let currentLanguage = DEFAULT_LANGUAGE;
const languageSubscribers = new Set();

function interpolate(value, params = {}) {
    return String(value).replace(/\{(\w+)\}/g, (_, key) => {
        const paramValue = params[key];
        return paramValue === undefined || paramValue === null ? '' : String(paramValue);
    });
}

function getTranslationTable(language) {
    return translations[language] || translations[DEFAULT_LANGUAGE];
}

function notifySubscribers() {
    languageSubscribers.forEach(callback => callback(currentLanguage));
}

export const I18n = {
    languages: LANGUAGES,

    getLanguage() {
        return currentLanguage;
    },

    getLocale() {
        return currentLanguage === LANGUAGES.PT_BR ? 'pt-BR' : 'en-US';
    },

    getDocumentLanguage() {
        return currentLanguage === LANGUAGES.PT_BR ? 'pt-BR' : 'en';
    },

    setLanguage(language) {
        if (!translations[language] || currentLanguage === language) {
            return;
        }

        currentLanguage = language;
        notifySubscribers();
    },

    toggleLanguage() {
        const nextLanguage = currentLanguage === LANGUAGES.EN
            ? LANGUAGES.PT_BR
            : LANGUAGES.EN;
        this.setLanguage(nextLanguage);
    },

    t(key, params = {}) {
        const currentTable = getTranslationTable(currentLanguage);
        const fallbackTable = getTranslationTable(DEFAULT_LANGUAGE);
        const value = currentTable[key] ?? fallbackTable[key] ?? key;
        return interpolate(value, params);
    },

    translateUserValue(value) {
        if (value === undefined || value === null) return '';

        const byLanguage = userValueTranslations[currentLanguage] || {};
        return byLanguage[value] ?? value;
    },

    getToggleButtonLabel() {
        return currentLanguage === LANGUAGES.EN
            ? this.t('button.switchToPtBr')
            : this.t('button.switchToEn');
    },

    onChange(callback) {
        if (typeof callback !== 'function') return () => {};

        languageSubscribers.add(callback);
        return () => {
            languageSubscribers.delete(callback);
        };
    },
};
