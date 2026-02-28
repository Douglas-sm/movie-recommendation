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

const userService = new UserService();
const productService = new ProductService();

const userView = new UserView();
const productView = new ProductView();
const modelView = new ModelView();
const datasetSourceLabel = document.querySelector('#datasetSourceLabel');
const DEFAULT_PRODUCT_DATA_PATH = './data/movie.json';
const DEFAULT_WORKER_DATA_PATH = '/data/movie.json';

const mlWorker = new Worker('/src/workers/modelTrainingWorker.js', { type: 'module' });
WorkerController.init({
    worker: mlWorker,
    events: Events
});

const modelController = ModelController.init({
    modelView,
    userService,
    events: Events,
});

const productController = ProductController.init({
    productView,
    productService,
    events: Events,
});

const userController = UserController.init({
    userView,
    userService,
    events: Events,
});

productService.setDataSource(DEFAULT_PRODUCT_DATA_PATH);
modelController.setMovieDataPath(DEFAULT_WORKER_DATA_PATH);
if (datasetSourceLabel) datasetSourceLabel.textContent = 'Dados: EN';

await userController.renderUsers();
