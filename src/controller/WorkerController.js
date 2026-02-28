import { workerEvents } from '../events/constants.js';

export class WorkerController {
    #worker;
    #events;
    #alreadyTrained = false;
    #pendingRecommendation = null;

    constructor({ worker, events }) {
        this.#worker = worker;
        this.#events = events;
        this.init();
    }

    async init() {
        this.setupCallbacks();
    }

    static init(deps) {
        return new WorkerController(deps);
    }

    setupCallbacks() {
        this.#events.onTrainModel((payload) => {
            this.#alreadyTrained = false;
            this.triggerTrain(payload);
        });

        this.#events.onRecommend((user) => {
            if (!user) return;

            if (!this.#alreadyTrained) {
                this.#pendingRecommendation = user;
                return;
            }

            this.triggerRecommend(user);
        });

        this.#worker.onmessage = (event) => {
            const { type } = event.data;

            if (type === workerEvents.progressUpdate) {
                this.#events.dispatchProgressUpdate(event.data.progress);
                return;
            }

            if (type === workerEvents.trainingLog) {
                this.#events.dispatchTrainingLog(event.data);
                return;
            }

            if (type === workerEvents.trainingComplete) {
                this.#alreadyTrained = true;
                this.#events.dispatchTrainingComplete(event.data);

                if (this.#pendingRecommendation) {
                    this.triggerRecommend(this.#pendingRecommendation);
                    this.#pendingRecommendation = null;
                }
                return;
            }

            if (type === workerEvents.recommend) {
                this.#events.dispatchRecommendationsReady(event.data);
            }
        };
    }

    triggerTrain(trainPayload = {}) {
        this.#worker.postMessage({
            action: workerEvents.trainModel,
            ...trainPayload,
        });
    }

    triggerRecommend(user) {
        this.#worker.postMessage({ action: workerEvents.recommend, user });
    }
}
