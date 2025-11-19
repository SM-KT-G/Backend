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

    // 3. FastAPI 호출
    const response = await axios.post<FastAPIResponse>(
      `${FASTAPI_BASE_URL}/chat`,
      { text: message }
    );

    const fastApiResponse = response.data;

    // 4. DB에 저장 (JSON 형태로)
    await chatBotModel.saveMessageToSession(
      sessionId,
      "user",
      JSON.stringify({ message: message }),
      null
    );
    await chatBotModel.saveMessageToSession(
      sessionId,
      "bot",
      JSON.stringify(fastApiResponse),
      null
    );

    // 5. 응답 반환
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

    // JSON 파싱
    chatData.messages = chatData.messages.map((msg: any) => {
      try {
        msg.parsed_content = JSON.parse(msg.content);
      } catch (error) {
        // 파싱 실패 시 원본 유지
        msg.parsed_content = { message: msg.content };
      }
      return msg;
    });

    return chatData;
  }
}

export default ChatBotService;
