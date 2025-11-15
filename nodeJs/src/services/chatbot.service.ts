import chatBotModel from '../models/chatbot.model';
import usersModel from '../models/users.model';
import OpenAI from 'openai';

class ChatBotService {
    static async sendChat(userUuid: string, message: string): Promise<string> {
        // 1. 사용자 확인
        const userId = await usersModel.getUserIdByUuid(userUuid);
        if (!userId) {
            throw new Error('User not found');
        }

        // 2. 세션 확인/생성
        let session = await chatBotModel.getSessionByUserId(userId);
        let sessionId: number;
        if (!session) {
            sessionId = await chatBotModel.createSessionByUserId(userId);
        } else {
            sessionId = session.id;
        }

        // 3. 기존 대화 기록 조회
        const history = await chatBotModel.getChatHistory(sessionId, 20);

        // 4. OpenAI 메시지 형식으로 변환
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: 'あなたは日本人観光客のための韓国旅行アシスタントです。親切で正確な情報を日本語で提供してください。'
            },
            ...history.map((msg: any) => ({
                role: msg.role === 'bot' ? 'assistant' as const : 'user' as const,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        });
        const botResponse = completion.choices[0]?.message?.content;

        if (!botResponse) {
            throw new Error('No response from GPT');
        }

        // 6. 마지막 봇 메시지의 completion_id 찾기
        const lastBotMessage = history.reverse().find((msg: any) => msg.role === 'bot');
        const previousCompletionId = lastBotMessage?.openai_completion_id || null;

        // 7. GPT 성공 후 DB에 저장
        await chatBotModel.saveMessageToSession(sessionId, 'user', message, previousCompletionId);
        await chatBotModel.saveMessageToSession(
            sessionId,
            'bot',
            botResponse,
            completion.id
        );
        // 8. 응답 반환
        return botResponse;
    }
    static async getChatByUuid(chatUuid: string): Promise<any> {
        const chatRecord = await chatBotModel.getChatByUuid(chatUuid);
        return chatRecord;
    }

    static async getChatsByUser(userUuid: string): Promise<any> {
        // 1. 사용자 확인
        const userId = await usersModel.getUserIdByUuid(userUuid);
        if (!userId) {
            throw new Error('User not found');
        }

        // 2. 사용자의 세션 및 메시지 조회
        const chatData = await chatBotModel.getChatsByUserId(userId);
        return chatData;
    }
}

export default ChatBotService;