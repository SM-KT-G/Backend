import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
            const { uuid } = req.params;
            // TODO: uuid로 채팅 기록 조회
        }
        catch (error) {

        }
    }

    // 특정 사용자의 모든 채팅 기록을 불러온다
    static async getChatsByUser(req: Request, res: Response) {
        try {
            // TODO: accessToken 해독하여 userUuid 추출
            // TODO: userUuid로 User의 pk 조회
            // TODO: 해당 사용자의 모든 채팅 기록 조회
        }
        catch (error) {

        }
    }
}

export default ChatBotController;