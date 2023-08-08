import { Router } from 'express';
import MonstersModel from 'src/database/models/MonstersModel';
import MonstersServices from 'src/services/MonstersServices';
import MonstersControllers from 'src/controllers/MonstersControllers';
import VerifyIdMiddleware from 'src/middlewares/VerifyIdMiddleware';
import ValidateData from 'src/support/helpers/ValidateData';

const logger = require('@tablerise/dynamic-logger');

const validateData = new ValidateData(logger);
const model = new MonstersModel();
const services = new MonstersServices(model, logger, validateData);
const controllers = new MonstersControllers(services, logger);

const router = Router();

router.get('/', controllers.findAll);
router.get('/:id', VerifyIdMiddleware, controllers.findOne);
router.put('/:id', VerifyIdMiddleware, controllers.update);
router.delete('/:id', VerifyIdMiddleware, controllers.delete);

export default router;
