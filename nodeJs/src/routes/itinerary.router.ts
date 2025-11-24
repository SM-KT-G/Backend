import {Router} from 'express';
import ItineraryController from '../controllers/itinerary.controller';
import { it } from 'node:test';

const itineraryRouter = Router();

itineraryRouter.post('/generate', ItineraryController.generateItinerary);

export default itineraryRouter;