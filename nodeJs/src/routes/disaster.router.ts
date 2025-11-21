import express from 'express';
import DisasterController from '../controllers/disaster.controller';

const disasterRouter = express.Router();

disasterRouter.get('/alert', DisasterController.getAllDisasters);

export default disasterRouter;