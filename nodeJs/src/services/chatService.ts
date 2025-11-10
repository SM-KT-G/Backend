import { Conversation, IConversation, IMessage } from '../models/Conversation';

export interface ChatRequest {
  userId: string;
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  response: string;
  timestamp: Date;
}

export class ChatService {
  /**
   * Create a new conversation for a user
   */
  async createConversation(userId: string, title?: string): Promise<IConversation> {
    const conversation = new Conversation({
      userId,
      title: title || 'New Conversation',
      messages: []
    });

    await conversation.save();
    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string, limit: number = 50): Promise<IConversation[]> {
    return await Conversation.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string, userId: string): Promise<IConversation | null> {
    return await Conversation.findOne({
      _id: conversationId,
      userId,
      isActive: true
    }).exec();
  }

  /**
   * Delete (soft delete) a conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await Conversation.updateOne(
      { _id: conversationId, userId },
      { isActive: false }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    let conversation: IConversation | null;

    // Get or create conversation
    if (request.conversationId) {
      conversation = await this.getConversation(request.conversationId, request.userId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
    } else {
      conversation = await this.createConversation(request.userId);
    }

    // Add user message
    const userMessage: IMessage = {
      role: 'user',
      content: request.message,
      timestamp: new Date()
    };
    conversation.messages.push(userMessage);

    // Generate AI response (placeholder)
    const aiResponse = await this.generateAIResponse(conversation.messages);

    // Add assistant message
    const assistantMessage: IMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    conversation.messages.push(assistantMessage);

    // Update conversation title if it's the first message
    if (conversation.messages.length === 2) {
      conversation.title = this.generateConversationTitle(request.message);
    }

    await conversation.save();

    return {
      conversationId: conversation.id.toString(),
      response: aiResponse,
      timestamp: assistantMessage.timestamp
    };
  }

  /**
   * Generate AI response - PLACEHOLDER
   * TODO: Integrate with GPT OSS or API
   */
  private async generateAIResponse(messages: IMessage[]): Promise<string> {
    // OPTION 1: Use OpenAI API
    // Uncomment and configure when using OpenAI API:
    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    return response.choices[0].message.content || 'No response';
    */

    // OPTION 2: Use local GPT OSS (e.g., Ollama, llama.cpp)
    // Uncomment and configure when using local model:
    /*
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false
      })
    });

    const data = await response.json();
    return data.message.content;
    */

    // PLACEHOLDER: Simple echo response
    const lastMessage = messages[messages.length - 1];
    return `Echo: ${lastMessage.content}\n\n[This is a placeholder response. Please configure GPT API or OSS integration in chatService.ts]`;
  }

  /**
   * Generate a title for the conversation based on first message
   */
  private generateConversationTitle(firstMessage: string): string {
    const maxLength = 50;
    if (firstMessage.length <= maxLength) {
      return firstMessage;
    }
    return firstMessage.substring(0, maxLength) + '...';
  }

  /**
   * Clear all messages in a conversation
   */
  async clearConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await Conversation.updateOne(
      { _id: conversationId, userId },
      { $set: { messages: [] } }
    );
    return result.modifiedCount > 0;
  }
}

export default new ChatService();
