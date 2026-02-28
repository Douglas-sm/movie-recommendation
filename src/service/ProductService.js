export class ProductService {
    #moviesCache = null;
    #dataSourcePath = './data/movie.json';

    setDataSource(path) {
        if (!path || this.#dataSourcePath === path) {
            return;
        }

        this.#dataSourcePath = path;
        this.#moviesCache = null;
    }

    async getProducts() {
        if (this.#moviesCache) {
            return this.#moviesCache;
        }

        const response = await fetch(this.#dataSourcePath);
        const rawMovies = await response.json();

        this.#moviesCache = rawMovies
            .map((movie, index) => this.#normalizeMovie(movie, index))
            .filter(movie => movie.name && movie.genres.length > 0);

        return this.#moviesCache;
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id === Number(id));
    }

    async getProductsByIds(ids) {
        const products = await this.getProducts();
        return products.filter(product => ids.includes(product.id));
    }

    #normalizeMovie(movie, index) {
        const genres = this.#parseList(this.#readMovieField(movie, 'Genre', 'generos'));
        const directors = this.#parseList(this.#readMovieField(movie, 'Director', 'diretor'));
        const stars = this.#parseList(this.#readMovieField(movie, 'Stars', 'elenco'));
        const description = this.#parseList(this.#readMovieField(movie, 'Description', 'descricao')).join(' ');

        return {
            id: this.#toNumber(this.#readMovieField(movie, 'Unnamed: 0', 'id'), index) + 1,
            name: this.#readMovieField(movie, 'Movie Name', 'nome_filme') || `Movie ${index + 1}`,
            genres,
            year: this.#toNumber(this.#readMovieField(movie, 'Year of Release', 'ano_lancamento'), 0),
            runtime: this.#toNumber(this.#readMovieField(movie, 'Run Time in minutes', 'duracao_minutos'), 0),
            rating: this.#toNumber(this.#readMovieField(movie, 'Movie Rating', 'avaliacao'), 0),
            votes: this.#toNumber(this.#readMovieField(movie, 'Votes', 'votos'), 0),
            metaScore: this.#toNumber(this.#readMovieField(movie, 'MetaScore', 'metascore'), 0),
            gross: this.#toNumber(this.#readMovieField(movie, 'Gross', 'bilheteria'), 0),
            certification: this.#readMovieField(movie, 'Certification', 'classificacao_indicativa') || 'N/A',
            directors,
            stars,
            description: description || '',
            category: genres[0] || 'N/A',
        };
    }

    #readMovieField(movie, ...possibleKeys) {
        for (const key of possibleKeys) {
            if (movie?.[key] !== undefined && movie?.[key] !== null) {
                return movie[key];
            }
        }

        return undefined;
    }

    #parseList(value) {
        if (Array.isArray(value)) {
            return value.map(item => String(item).trim()).filter(Boolean);
        }

        if (!value || typeof value !== 'string') {
            return [];
        }

        const content = value
            .trim()
            .replace(/^\[/, '')
            .replace(/\]$/, '');

        if (!content) return [];

        return content
            .split(',')
            .map(item => item.replace(/['"]/g, '').trim())
            .filter(Boolean);
    }

    #toNumber(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
}
