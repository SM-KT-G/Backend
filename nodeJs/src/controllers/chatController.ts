import { Request, Response } from 'express';
import chatService from '../services/chatService';

export class ChatController {
  /**
   * POST /api/chat/conversations
   * Create a new conversation
   */
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const conversation = await chatService.createConversation(userId, title);
      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  /**
   * GET /api/chat/conversations
   * Get all conversations for a user
   */
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const conversations = await chatService.getUserConversations(userId as string, limit);
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  /**
   * GET /api/chat/conversations/:conversationId
   * Get a specific conversation
   */
  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const conversation = await chatService.getConversation(conversationId, userId as string);

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  /**
   * DELETE /api/chat/conversations/:conversationId
   * Delete a conversation
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const deleted = await chatService.deleteConversation(conversationId, userId as string);

      if (!deleted) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }

  /**
   * POST /api/chat/messages
   * Send a message and get AI response
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { userId, conversationId, message } = req.body;

      if (!userId || !message) {
        res.status(400).json({ error: 'userId and message are required' });
        return;
      }

      const response = await chatService.sendMessage({
        userId,
        conversationId,
        message
      });

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  }

  /**
   * DELETE /api/chat/conversations/:conversationId/messages
   * Clear all messages in a conversation
   */
  async clearConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const cleared = await chatService.clearConversation(conversationId, userId as string);

      if (!cleared) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Conversation cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
      res.status(500).json({ error: 'Failed to clear conversation' });
    }
  }
}

export default new ChatController();
