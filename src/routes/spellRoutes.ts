import { Router } from 'express';
import SpellsModel from 'src/database/models/SpellsModel';
import SpellsServices from 'src/services/SpellsServices';
import SpellsControllers from 'src/controllers/SpellsControllers';
import VerifyIdMiddleware from 'src/middlewares/VerifyIdMiddleware';
import VerifyBooleanQueryMiddleware from 'src/middlewares/VerifyBooleanQueryMiddleware';
import ValidateData from 'src/support/helpers/ValidateData';

const logger = require('@tablerise/dynamic-logger');

const model = new SpellsModel();
const validateData = new ValidateData(logger);
const services = new SpellsServices(model, logger, validateData);
const controllers = new SpellsControllers(services, logger);

const router = Router();

router.get('/', controllers.findAll);
router.get('/disabled', controllers.findAllDisabled);
router.get('/:id', VerifyIdMiddleware, controllers.findOne);
router.put('/:id', VerifyIdMiddleware, controllers.update);
router.patch('/:id', VerifyIdMiddleware, VerifyBooleanQueryMiddleware, controllers.updateAvailability);

export default router;
