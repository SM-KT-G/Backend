import express from 'express';
import exchangeRateController from '../controllers/exchangeRate.controller';
const exchangeRateRouter = express.Router();

exchangeRateRouter.get('/', exchangeRateController.getExchangeRates);
exchangeRateRouter.get('/jpy', exchangeRateController.getJPYExchangeRate);
export default exchangeRateRouter;