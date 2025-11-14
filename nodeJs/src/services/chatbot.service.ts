import chatBotModel from '../models/chatbot.model';
import usersModel from '../models/users.model';
// import OpenAI from 'openai';

class ChatBotService {
    static async sendChat(userUuid: string, message: string): Promise<string> {
        // 1. 사용자 확인
        const userId = await usersModel.getUserIdByUuid(userUuid);
        if (!userId) {
            throw new Error('User not found');
        }

        // 2. 세션 확인/생성
        let session = await chatBotModel.getSessionByUserId(userId);
        if (!session) {
            session = await chatBotModel.createSessionByUserId(userId);
        }

        // 3. 기존 대화 기록 조회
        const history = await chatBotModel.getChatHistory(session, 20);

        // 4. OpenAI 메시지 형식으로 변환 (기록 + 새 메시지)
        // const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        //     {
        //         role: 'system',
        //         content: '당신은 일본인 관광객을 위한 한국 여행 도우미입니다. 친절하고 정확한 정보를 일본어로 제공합니다.'
        //     },
        //     ...history.map((msg: any) => ({
        //         role: msg.role === 'bot' ? 'assistant' as const : 'user' as const,
        //         content: msg.content
        //     })),
        //     {
        //         role: 'user',
        //         content: message
        //     }
        // ];

        // 5. GPT API 호출 (테스트용 mock)
        // TODO: 실제 OpenAI API 연결 시 주석 해제
        /*
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        });
        const botResponse = completion.choices[0]?.message?.content;
        */

        // 테스트용 mock 응답
        const botResponse = `[테스트 응답] "${message}" 메시지를 잘 받았습니다! 이것은 GPT API 없이 테스트하기 위한 임시 응답입니다.`;
        const completion = {
            id: `chatcmpl-test-${Date.now()}` // 테스트용 임시 ID
        };

        if (!botResponse) {
            throw new Error('No response from GPT');
        }

        // 6. 마지막 봇 메시지의 completion_id 찾기
        const lastBotMessage = history.reverse().find((msg: any) => msg.role === 'bot');
        const previousCompletionId = lastBotMessage?.openai_completion_id || null;

        // 7. GPT 성공 후 DB에 저장 (사용자 메시지 + 봇 응답)
        await chatBotModel.saveMessageToSession(session, 'user', message, previousCompletionId);
        await chatBotModel.saveMessageToSession(
            session,
            'bot',
            botResponse,
            completion.id
        );

        // 7. 응답 반환
        return botResponse;
    }
}

export default ChatBotService;