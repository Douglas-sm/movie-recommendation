export class ModelController {
    #modelView;
    #userService;
    #events;
    #movieDataPath = '/data/movie.json';

    constructor({
        modelView,
        userService,
        events,
    }) {
        this.#modelView = modelView;
        this.#userService = userService;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new ModelController(deps);
    }

    setMovieDataPath(path) {
        if (!path || typeof path !== 'string') {
            return;
        }

        this.#movieDataPath = path;
    }

    async init() {
        this.setupCallbacks();
        await this.handleTrainModel();
    }

    setupCallbacks() {
        this.#modelView.registerTrainModelCallback(this.handleTrainModel.bind(this));

        this.#events.onUserSelected((user) => {
            this.#events.dispatchRecommend(user);
        });

        this.#events.onTrainingComplete(() => {
            this.#modelView.setTrainingCompleted();
        });

        this.#events.onProgressUpdate((progress) => {
            this.handleTrainingProgressUpdate(progress);
        });
    }

    async handleTrainModel() {
        const users = await this.#userService.getUsers();

        this.#modelView.updateTrainingProgress({
            progress: 0,
            status: 'Preparando dados para treinamento...'
        });

        this.#events.dispatchTrainModel({
            users,
            movieDataPath: this.#movieDataPath,
        });
    }

    handleTrainingProgressUpdate(progress) {
        this.#modelView.updateTrainingProgress(progress);
    }
}
