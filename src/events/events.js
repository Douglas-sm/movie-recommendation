import { events } from './constants.js';

export default class Events {
    static #subscribe(eventName, callback) {
        document.addEventListener(eventName, event => callback(event.detail));
    }

    static #publish(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    static onTrainingComplete(callback) {
        Events.#subscribe(events.trainingComplete, callback);
    }

    static dispatchTrainingComplete(data) {
        Events.#publish(events.trainingComplete, data);
    }

    static onRecommend(callback) {
        Events.#subscribe(events.recommend, callback);
    }

    static dispatchRecommend(data) {
        Events.#publish(events.recommend, data);
    }

    static onRecommendationsReady(callback) {
        Events.#subscribe(events.recommendationsReady, callback);
    }

    static dispatchRecommendationsReady(data) {
        Events.#publish(events.recommendationsReady, data);
    }

    static onTrainModel(callback) {
        Events.#subscribe(events.modelTrain, callback);
    }

    static dispatchTrainModel(data) {
        Events.#publish(events.modelTrain, data);
    }

    static onProgressUpdate(callback) {
        Events.#subscribe(events.modelProgressUpdate, callback);
    }

    static dispatchProgressUpdate(progressData) {
        Events.#publish(events.modelProgressUpdate, progressData);
    }

    static onTrainingLog(callback) {
        Events.#subscribe(events.trainingLog, callback);
    }

    static dispatchTrainingLog(logData) {
        Events.#publish(events.trainingLog, logData);
    }

    static onUserSelected(callback) {
        Events.#subscribe(events.userSelected, callback);
    }

    static dispatchUserSelected(data) {
        Events.#publish(events.userSelected, data);
    }

    static onUsersUpdated(callback) {
        Events.#subscribe(events.usersUpdated, callback);
    }

    static dispatchUsersUpdated(data) {
        Events.#publish(events.usersUpdated, data);
    }
}
