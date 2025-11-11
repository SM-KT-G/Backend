import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import chatService from '../services/chat.service';

class ChatBotController {
    static async handleChat(req: Request, res: Response) {
        try {
            const { message } = req.body;
        }
        catch (error) {

        }
    }
}

export default ChatBotController