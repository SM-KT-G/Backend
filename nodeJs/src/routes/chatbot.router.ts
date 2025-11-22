import express from 'express';
import ChatBotController from '../controllers/chatbot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const chatBotRouter = express.Router();

chatBotRouter.post('/chat', authMiddleware, ChatBotController.sendChat); // 채팅을 보낸다
chatBotRouter.get('/chat/:uuid', authMiddleware, ChatBotController.getChatByUuid); // 특정 채팅 기록을 불러온다
chatBotRouter.get('/chats', authMiddleware, ChatBotController.getChatsByUser); // 특정 사용자의 모든 채팅 기록을 불러온다

export default chatBotRouter;