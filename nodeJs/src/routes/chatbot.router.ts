import express from 'express';
import chatBotController from '../controllers/chatbot.controller';

const chatBotRouter = express.Router();

chatBotRouter.post('/chat', chatBotController.handleChat);
chatBotRouter.get('/chat/:uuid', chatBotController.getChat);