import { View } from './View.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #trainingProgressBar = document.querySelector('#trainingProgressBar');
    #trainingStatusText = document.querySelector('#trainingStatusText');
    #onTrainModel;

    constructor() {
        super();
        this.attachEventListeners();
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            if (this.#onTrainModel) {
                this.#onTrainModel();
            }
        });
    }

    updateTrainingProgress(progressData = {}) {
        const progress = Math.max(0, Math.min(100, Number(progressData.progress ?? 0)));
        const status = progressData.status || this.#statusMessage(progress);

        this.#trainingProgressBar.style.width = `${progress}%`;
        this.#trainingProgressBar.textContent = `${progress}%`;
        this.#trainingStatusText.textContent = status;

        if (progress < 100) {
            this.#trainModelBtn.disabled = true;
            this.#trainModelBtn.innerHTML =
                '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Treinando...';
            return;
        }

        this.#trainModelBtn.disabled = false;
        this.#trainModelBtn.innerHTML = '<i class="bi bi-cpu"></i> Treinar Modelo';
    }

    setTrainingCompleted() {
        this.updateTrainingProgress({
            progress: 100,
            status: 'Treinamento finalizado. Troque o usuário para atualizar as recomendações.',
        });
    }

    #statusMessage(progress) {
        if (progress === 0) return 'Iniciando treinamento...';
        if (progress < 100) return 'Treinamento em andamento...';
        return 'Treinamento concluído.';
    }
}
