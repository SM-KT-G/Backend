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
}

export default chatBotModel;
