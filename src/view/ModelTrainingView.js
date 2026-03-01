import { View } from './View.js';
import { I18n } from '../i18n/i18n.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #trainingBoardBtn = document.querySelector('#trainingBoardBtn');
    #trainingProgressBar = document.querySelector('#trainingProgressBar');
    #trainingStatusText = document.querySelector('#trainingStatusText');
    #onTrainModel;
    #onOpenTrainingBoard;
    #lastProgressData = {
        progress: 0,
        statusKey: 'training.status.waitingInitial',
    };

    constructor() {
        super();
        this.attachEventListeners();
        I18n.onChange(() => {
            this.updateTrainingProgress(this.#lastProgressData);
        });
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }

    registerOpenTrainingBoardCallback(callback) {
        this.#onOpenTrainingBoard = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            if (this.#onTrainModel) {
                this.#onTrainModel();
            }
        });

        if (this.#trainingBoardBtn) {
            this.#trainingBoardBtn.addEventListener('click', () => {
                if (this.#onOpenTrainingBoard) {
                    this.#onOpenTrainingBoard();
                }
            });
        }
    }

    updateTrainingProgress(progressData = {}) {
        this.#lastProgressData = { ...progressData };

        const progress = Math.max(0, Math.min(100, Number(progressData.progress ?? 0)));
        const status = this.#resolveStatus(progressData, progress);

        this.#trainingProgressBar.style.width = `${progress}%`;
        this.#trainingProgressBar.textContent = `${progress}%`;
        this.#trainingStatusText.textContent = status;

        if (progress < 100) {
            this.#trainModelBtn.disabled = true;
            this.#trainModelBtn.innerHTML =
                `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${I18n.t('training.button.running')}`;
            return;
        }

        this.#trainModelBtn.disabled = false;
        this.#trainModelBtn.innerHTML = `<i class="bi bi-cpu"></i> ${I18n.t('training.button.idle')}`;
    }

    setTrainingCompleted() {
        this.updateTrainingProgress({
            progress: 100,
            statusKey: 'training.status.completedSwitchUser',
        });
    }

    #statusMessage(progress) {
        if (progress === 0) return I18n.t('training.status.starting');
        if (progress < 100) return I18n.t('training.status.inProgress');
        return I18n.t('training.status.completed');
    }

    #resolveStatus(progressData, progress) {
        if (progressData.statusKey) {
            return I18n.t(progressData.statusKey, progressData.statusParams);
        }

        if (progressData.status) {
            return progressData.status;
        }

        return this.#statusMessage(progress);
    }
}
