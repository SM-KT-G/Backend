import { Router } from 'express';
// 2번 파일(컨트롤러)을 import
import navigationController from '../controllers/NavigationController'; 

const navigationRouter = Router();

// POST /api/navigation/directions
navigationRouter.post('/directions', navigationController.getDirections);

export default navigationRouter;