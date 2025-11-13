import express from 'express';
import chatBotController from '../controllers/chatbot.controller';

const chatBotRouter = express.Router();

chatBotRouter.post('/chat', chatBotController.sendChat); // 채팅을 보낸다
chatBotRouter.get('/chat/:uuid', chatBotController.getChatByUuid); // 특정 채팅 기록을 불러온다
chatBotRouter.get('/chats/:userUuid', chatBotController.getChatsByUser); // 특정 사용자의 모든 채팅 기록을 불러온다