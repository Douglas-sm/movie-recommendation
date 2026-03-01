export class ProductController {
    #productView;
    #events;
    #productService;
    #isTraining = false;
    #hasSelectedUser = false;

    constructor({
        productView,
        events,
        productService
    }) {
        this.#productView = productView;
        this.#productService = productService;
        this.#events = events;
        this.init();
    }

    static init(deps) {
        return new ProductController(deps);
    }

    async init() {
        this.setupEventListeners();
        this.#syncMovieListVisibility();
        await this.renderBaseline();
    }

    async renderBaseline() {
        const movies = await this.#productService.getProducts();
        const baseline = [...movies]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map(movie => ({
                ...movie,
                score: movie.rating / 10
            }));

        this.#productView.render(baseline, { type: 'baseline' });
    }

    setupEventListeners() {
        this.#events.onTrainModel(() => {
            this.#isTraining = true;
            this.#syncMovieListVisibility();
        });

        this.#events.onTrainingComplete(() => {
            this.#isTraining = false;
            this.#syncMovieListVisibility();
        });

        this.#events.onUserSelected((user) => {
            this.#hasSelectedUser = Boolean(user?.id);
            this.#syncMovieListVisibility();
        });

        this.#events.onRecommendationsReady(({ user, recommendations }) => {
            this.#productView.render(recommendations.slice(0, 5), {
                type: 'user',
                userName: user?.name || '',
            });
        });
    }

    #syncMovieListVisibility() {
        this.#productView.setMovieListVisibility(this.#hasSelectedUser && !this.#isTraining);
    }
}
