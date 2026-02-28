export class ProductController {
    #productView;
    #events;
    #productService;

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

        this.#productView.render(baseline, 'Ranking base (antes da personalização)');
    }

    setupEventListeners() {
        this.#events.onRecommendationsReady(({ user, recommendations }) => {
            this.#productView.render(recommendations.slice(0, 5), user.name);
        });
    }
}
