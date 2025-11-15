import { Router } from 'express';
import navigationRouter from './NavigationRouter.js';

const mainRouter = Router();

// /api/navigation 으로 들어오는 요청은 NavigationRouter가 처리
mainRouter.use('/navigation', navigationRouter);

export default mainRouter;