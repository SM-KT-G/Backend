import { Router } from 'express';
import chatController from '../controllers/chatController';

const router = Router();

// Conversation routes
router.post('/conversations', chatController.createConversation.bind(chatController));
router.get('/conversations', chatController.getConversations.bind(chatController));
router.get('/conversations/:conversationId', chatController.getConversation.bind(chatController));
router.delete('/conversations/:conversationId', chatController.deleteConversation.bind(chatController));
router.delete('/conversations/:conversationId/messages', chatController.clearConversation.bind(chatController));

// Message routes
router.post('/messages', chatController.sendMessage.bind(chatController));

export default router;
