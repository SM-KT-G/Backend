import { Request, Response } from 'express';
import chatService from '../services/chatbot.service';

class ChatBotController {
    static async sendChat(req: Request, res: Response) {
        try {
            const user = req.user as { uuid: string };
            if (!user || !user.uuid) {
                return res.status(401).json({
                    error: "Not authorized"
                });
            }
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({
                    error: "Message is required"
                });
            }
            const chatResponse = await chatService.sendChat(user.uuid, message);
            return res.status(200).json({
                reply: chatResponse,
            });
        }
        catch (error) {
            console.error("Send chat error:", error);
            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }

    // 특정 채팅 기록을 불러온다
    static async getChatByUuid(req: Request, res: Response) {
        try {
            const user = req.user as { uuid: string };
            if (!user || !user.uuid) {
                return res.status(401).json({
                    error: "Not authorized"
                });
            }
            const chatUuid = req.params.uuid;
            const chatRecord = await chatService.getChatByUuid(chatUuid);
            return res.status(200).json({
                chat: chatRecord,
            });
        }
        catch (error) {
            console.error("Get chat error:", error);
            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }

    // 특정 사용자의 모든 채팅 기록을 불러온다
    static async getChatsByUser(req: Request, res: Response) {
        try {
            const user = req.user as { uuid: string };
            if (!user || !user.uuid) {
                return res.status(401).json({
                    error: "Not authorized"
                });
            }
            const chatData = await chatService.getChatsByUser(user.uuid);
            if (!chatData) {
                return res.status(404).json({
                    error: "No chat session found"
                });
            }
            return res.status(200).json(chatData);
        }
        catch (error) {
            console.error("Get chats by user error:", error);
            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }
}

export default ChatBotController;