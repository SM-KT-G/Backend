import chatBotModel from "../models/chatbot.model";
import usersModel from "../models/users.model";
import axios from "axios";
import { FastAPIResponse } from "../types/chatbot.types";
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;

class ChatBotService {
  static async sendChat(
    userUuid: string,
    message: string
  ): Promise<FastAPIResponse> {
    // 1. 사용자 확인
    const userId = await usersModel.getUserIdByUuid(userUuid);
    if (!userId) {
      throw new Error("User not found");
    }

    // 2. 세션 확인/생성
    let session = await chatBotModel.getSessionByUserId(userId);
    let sessionId: number;
    if (!session) {
      sessionId = await chatBotModel.createSessionByUserId(userId);
    } else {
      sessionId = session.id;
    }

    // 3. 이전 대화의 completion_id 조회 (대화 맥락 연결용)
    const allMessages = await chatBotModel.getChatHistory(sessionId, 20);
    // 가장 최근 bot 메시지에서 completion_id 가져오기 (역순으로 탐색)
    let previousCompletionId: string | undefined = undefined;
    for (let i = allMessages.length - 1; i >= 0; i--) {
      if (allMessages[i].role === 'bot' && allMessages[i].openai_completion_id) {
        previousCompletionId = allMessages[i].openai_completion_id;
        break;
      }
    }

    // 4. FastAPI 호출
    let fastApiResponse: FastAPIResponse;
    try {
      const response = await axios.post<FastAPIResponse>(
        `${FASTAPI_BASE_URL}/chat`,
        { text: message }
      );
      fastApiResponse = response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "FastAPI error response:",
            error.response.status,
            error.response.data
          );
          throw new Error(`FastAPI returned error: ${error.response.status}`);
        } else if (error.request) {
          console.error("FastAPI no response:", error.message);
          throw new Error("FastAPI server is not responding");
        }
      }
      console.error("Unexpected error calling FastAPI:", error);
      throw new Error("Failed to process chat message");
    }

    // 5. DB에 저장 (JSON 형태로)
    // user 메시지는 이전 봇의 completion_id를 상속
    await chatBotModel.saveMessageToSession(
      sessionId,
      "user",
      JSON.stringify({ message: message }),
      previousCompletionId
    );

    // bot 메시지는 새로운 completion_id 저장 (content에서는 chat_completion_id 제외)
    const { chat_completion_id, ...botContentWithoutId } = fastApiResponse;
    await chatBotModel.saveMessageToSession(
      sessionId,
      "bot",
      JSON.stringify(botContentWithoutId),
      fastApiResponse.chat_completion_id
    );
    return fastApiResponse;
  }

  static async getChatByUuid(chatUuid: string): Promise<any> {
    const chatRecord = await chatBotModel.getChatByUuid(chatUuid);
    if (!chatRecord) {
      return null;
    }

    // JSON 파싱
    chatRecord.messages = chatRecord.messages.map((msg: any) => {
      try {
        msg.parsed_content = JSON.parse(msg.content);
      } catch (error) {
        // 파싱 실패 시 원본 유지
        msg.parsed_content = { message: msg.content };
      }
      return msg;
    });
    return chatRecord;
  }

  static async getChatsByUser(userUuid: string): Promise<any> {
    // 1. 사용자 확인
    const userId = await usersModel.getUserIdByUuid(userUuid);
    if (!userId) {
      throw new Error("User not found");
    }
    // 2. 사용자의 세션 및 메시지 조회
    const chatData = await chatBotModel.getChatsByUserId(userId);
    if (!chatData) {
      return null;
    }
    chatData.messages = chatData.messages.map((msg: any) => {
      try {
        msg.parsed_content = JSON.parse(msg.content);
      } catch (error) {
        msg.parsed_content = { message: msg.content };
      }
      return msg;
    });
    return chatData;
  }
}

export default ChatBotService;
