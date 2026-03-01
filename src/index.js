import { UserController } from './controller/UserController.js';
import { ProductController } from './controller/ProductController.js';
import { ModelController } from './controller/ModelTrainingController.js';
import { UserService } from './service/UserService.js';
import { ProductService } from './service/ProductService.js';
import { UserView } from './view/UserView.js';
import { ProductView } from './view/ProductView.js';
import { ModelView } from './view/ModelTrainingView.js';
import Events from './events/events.js';
import { WorkerController } from './controller/WorkerController.js';
import { I18n } from './i18n/i18n.js';
import { TFVisorView } from './view/TFVisorView.js';
import { TFVisorController } from './controller/TFVisorController.js';

const userService = new UserService();
const productService = new ProductService();

const userView = new UserView();
const productView = new ProductView();
const modelView = new ModelView();
const tfVisorView = new TFVisorView();
const translationToggleBtn = document.querySelector('#translationToggleBtn');
const datasetSourceLabel = document.querySelector('#datasetSourceLabel');
const DEFAULT_PRODUCT_DATA_PATH = './data/movie.json';
const DEFAULT_WORKER_DATA_PATH = '/data/movie.json';

function applyStaticTranslations() {
    document.title = I18n.t('meta.title');
    document.documentElement.lang = I18n.getDocumentLanguage();

    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(element => {
        const key = element.dataset.i18n;
        if (!key) return;
        element.textContent = I18n.t(key);
    });

    const progressContainer = document.querySelector('.progress[role="progressbar"]');
    if (progressContainer) {
        progressContainer.setAttribute('aria-label', I18n.t('training.progressAriaLabel'));
    }

    if (datasetSourceLabel) {
        datasetSourceLabel.textContent = I18n.t('dataset.label');
    }

    if (translationToggleBtn) {
        translationToggleBtn.textContent = I18n.getToggleButtonLabel();
    }
}

if (translationToggleBtn) {
    translationToggleBtn.addEventListener('click', () => {
        I18n.toggleLanguage();
    });
}

I18n.onChange(() => {
    applyStaticTranslations();
});
applyStaticTranslations();

const mlWorker = new Worker('/src/workers/modelTrainingWorker.js', { type: 'module' });
WorkerController.init({
    worker: mlWorker,
    events: Events
});

TFVisorController.init({
    tfVisorView,
    events: Events,
});

modelView.registerOpenTrainingBoardCallback(() => {
    tfVisorView.openDashboard();
});

const productController = ProductController.init({
    productView,
    productService,
    events: Events,
});

const modelController = ModelController.init({
    modelView,
    userService,
    events: Events,
});

const userController = UserController.init({
    userView,
    userService,
    events: Events,
});

productService.setDataSource(DEFAULT_PRODUCT_DATA_PATH);
modelController.setMovieDataPath(DEFAULT_WORKER_DATA_PATH);

await userController.renderUsers();
