import { Router } from 'express';
import MagicItemsModel from 'src/database/models/dungeons&dragons5e/MagicItemsModel';
import MagicItemsServices from 'src/services/dungeons&dragons5e/MagicItemsServices';
import MagicItemsControllers from 'src/controllers/dungeons&dragons5e/MagicItemsControllers';
import VerifyIdMiddleware from 'src/middlewares/VerifyIdMiddleware';
import VerifyBooleanQueryMiddleware from 'src/middlewares/VerifyBooleanQueryMiddleware';

const logger = require('@tablerise/dynamic-logger');

const model = new MagicItemsModel();
const services = new MagicItemsServices(model, logger);
const controllers = new MagicItemsControllers(services, logger);

const router = Router();

router.get('/', controllers.findAll);
router.get('/disabled', controllers.findAllDisabled);
router.get('/:id', VerifyIdMiddleware, controllers.findOne);
router.put('/:id', VerifyIdMiddleware, controllers.update);
router.patch('/:id', VerifyIdMiddleware, VerifyBooleanQueryMiddleware, controllers.updateAvailability);

export default router;