import { View } from './View.js';
import { I18n } from '../i18n/i18n.js';

export class ProductView extends View {
    #movieListSection = document.querySelector('#movieListSection');
    #movieList = document.querySelector('#movieList');
    #recommendationForUser = document.querySelector('#recommendationForUser');
    #movieTemplate;
    #templatePromise;
    #lastMovies = [];
    #lastContext = null;
    #hasRendered = false;

    constructor() {
        super();
        this.#templatePromise = this.init();
        I18n.onChange(() => {
            if (!this.#hasRendered) return;
            this.render(this.#lastMovies, this.#lastContext);
        });
    }

    async init() {
        this.#movieTemplate = await this.loadTemplate('./src/view/templates/product-card.html');
    }

    async render(movies = [], context = null) {
        await this.#templatePromise;
        if (!this.#movieTemplate) return;
        this.#hasRendered = true;

        this.#lastMovies = movies;
        this.#lastContext = context;

        if (!movies.length) {
            this.#movieList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">${I18n.t('recommendations.noneForProfile')}</div>
                </div>
            `;
            this.#recommendationForUser.textContent = '';
            return;
        }

        const html = movies.map(movie => {
            return this.replaceTemplate(this.#movieTemplate, {
                name: movie.name,
                genres: (movie.genres || []).join(', ') || I18n.t('misc.noGenre'),
                year: movie.year || I18n.t('misc.na'),
                runtime: movie.runtime || I18n.t('misc.na'),
                rating: Number(movie.rating || 0).toFixed(1),
                votes: this.#formatNumber(movie.votes || 0),
                score: Number(movie.score || 0).toFixed(4),
                certification: movie.certification || I18n.t('misc.na'),
                description: movie.description || I18n.t('misc.noDescription'),
                labelYear: I18n.t('movie.label.year'),
                labelRuntime: I18n.t('movie.label.runtime'),
                labelImdb: I18n.t('movie.label.imdb'),
                labelVotes: I18n.t('movie.label.votes'),
                labelScore: I18n.t('movie.label.score'),
            });
        }).join('');

        this.#movieList.innerHTML = html;
        this.#recommendationForUser.textContent = this.#resolveContextLabel(context);
    }

    setMovieListVisibility(isVisible = true) {
        const section = this.#movieListSection || this.#movieList;
        if (!section) return;

        section.classList.toggle('d-none', !isVisible);

        if (!isVisible) {
            this.#recommendationForUser.textContent = '';
        }
    }

    #formatNumber(value) {
        return new Intl.NumberFormat(I18n.getLocale()).format(Number(value) || 0);
    }

    #resolveContextLabel(context) {
        if (!context) return '';

        if (typeof context === 'string') {
            return context;
        }

        if (context.type === 'baseline') {
            return I18n.t('recommendations.baseline');
        }

        if (context.type === 'user' && context.userName) {
            return I18n.t('recommendations.forUser', { name: context.userName });
        }

        return '';
    }
}
