import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router = Router();

// 이메일/비밀번호 인증
// POST /api/auth/register
router.post('/register', AuthController.register);
// POST /api/auth/login
router.post('/login', AuthController.login);

// LINE 소셜 로그인
// GET /api/auth/line - LINE 로그인 시작
router.get('/line', AuthController.lineLogin);
// GET /api/auth/line/callback - LINE 콜백 처리
router.get('/line/callback', AuthController.lineCallback);

export default router;
