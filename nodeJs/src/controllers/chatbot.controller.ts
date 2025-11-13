import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import chatService from '../services/chat.service';

class ChatBotController {
    // 채팅을 보낸다
    static async sendChat(req: Request, res: Response) {
        try {
            const userUuid = req.params.userUuid;
            const { message } = req.body;
            // TODO: accessToken 해독하여 userUuid 추출
            // TODO: userUuid로 User의 pk 조회
            // TODO: 채팅 메시지 DB 저장
        }
        catch (error) {

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

export default ChatBotController