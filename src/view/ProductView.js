import { View } from './View.js';

export class ProductView extends View {
    #movieList = document.querySelector('#movieList');
    #recommendationForUser = document.querySelector('#recommendationForUser');
    #movieTemplate;
    #templatePromise;

    constructor() {
        super();
        this.#templatePromise = this.init();
    }

    async init() {
        this.#movieTemplate = await this.loadTemplate('./src/view/templates/product-card.html');
    }

    async render(movies = [], userName = '') {
        await this.#templatePromise;
        if (!this.#movieTemplate) return;

        if (!movies.length) {
            this.#movieList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">Nenhum filme recomendado para este perfil.</div>
                </div>
            `;
            this.#recommendationForUser.textContent = '';
            return;
        }

        const html = movies.map(movie => {
            return this.replaceTemplate(this.#movieTemplate, {
                name: movie.name,
                genres: (movie.genres || []).join(', ') || 'Sem gênero',
                year: movie.year || 'N/A',
                runtime: movie.runtime || 'N/A',
                rating: Number(movie.rating || 0).toFixed(1),
                votes: this.#formatNumber(movie.votes || 0),
                score: Number(movie.score || 0).toFixed(4),
                certification: movie.certification || 'N/A',
                description: movie.description || 'Sem descrição disponível.',
            });
        }).join('');

        this.#movieList.innerHTML = html;
        this.#recommendationForUser.textContent = userName
            ? `Recomendações para ${userName}`
            : '';
    }

    #formatNumber(value) {
        return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
    }
}
