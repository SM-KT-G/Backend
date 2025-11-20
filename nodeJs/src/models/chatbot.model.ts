import { dbpool } from "../config/index";
import { v4 as uuidv4 } from "uuid";

class chatBotModel {
  static async getSessionByUserId(userId: number) {
    const connection = await dbpool.getConnection();
    try {
      const rows = await connection.query(
        `SELECT * FROM CHAT_SESSIONS WHERE user_id = ?`,
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async createSessionByUserId(userId: number) {
    const connection = await dbpool.getConnection();
    try {
      const uuid = uuidv4();
      const result = await connection.query(
        `INSERT INTO CHAT_SESSIONS (uuid, user_id) VALUES (?, ?)`,
        [uuid, userId]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }
  static async saveMessageToSession(
    sessionId: number,
    role: 'user' | 'bot',
    content: string,
    openaiCompletionId?: string
  ) {
    const connection = await dbpool.getConnection();
    try {
      await connection.query(
        `INSERT INTO CHAT_MESSAGES (session_id, role, content, openai_completion_id)
         VALUES (?, ?, ?, ?)`,
        [sessionId, role, content, openaiCompletionId || null]
      );
    } finally {
      connection.release();
    }
  }
  
  // 대화 기록 조회 (최근 20개) 혹시 몰라서 만들어놨습니다
  static async getChatHistory(sessionId: number, limit: number = 20) {
    const connection = await dbpool.getConnection();
    try {
      const rows = await connection.query(
        `SELECT * FROM CHAT_MESSAGES
         WHERE session_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [sessionId, limit]
      );
      return rows.reverse(); // 오래된 순서로 반환
    } finally {
      connection.release();
    }
  }

  // UUID로 특정 채팅 세션 조회
  static async getChatByUuid(chatUuid: string) {
    const connection = await dbpool.getConnection();
    try {
      const session = await connection.query(
        `SELECT * FROM CHAT_SESSIONS WHERE uuid = ?`,
        [chatUuid]
      );
      if (!session || session.length === 0) {
        return null;
      }

      const messages = await connection.query(
        `SELECT * FROM CHAT_MESSAGES
         WHERE session_id = ?
         ORDER BY created_at ASC`,
        [session[0].id]
      );

      return {
        session: session[0],
        messages: messages
      };
    } finally {
      connection.release();
    }
  }

  // 사용자 ID로 세션과 모든 메시지 조회
  static async getChatsByUserId(userId: number) {
    const connection = await dbpool.getConnection();
    try {
      const session = await connection.query(
        `SELECT * FROM CHAT_SESSIONS WHERE user_id = ?`,
        [userId]
      );
      if (!session || session.length === 0) {
        return null;
      }

      const messages = await connection.query(
        `SELECT * FROM CHAT_MESSAGES
         WHERE session_id = ?
         ORDER BY created_at ASC`,
        [session[0].id]
      );

      return {
        session: session[0],
        messages: messages
      };
    } finally {
      connection.release();
    }
  }
}

export default chatBotModel;
