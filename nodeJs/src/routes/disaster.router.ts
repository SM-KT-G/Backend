import express from 'express';
import DisasterController from '../controllers/disaster.controller';

const disasterRouter = express.Router();

disasterRouter.get('/alert/region', DisasterController.getAlertByRegion);
disasterRouter.get('/alert/type', DisasterController.getAlertByType);
disasterRouter.get('/alert/severity', DisasterController.getAlertBySeverity);



export default disasterRouter;