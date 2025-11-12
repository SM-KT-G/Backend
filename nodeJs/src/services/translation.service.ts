import OpenAI from 'openai';
import { TranslationRequestData, TranslationResponse } from "../types/translation";

class TranslationService {
  static async translateJapaneseToKorean(
    request: TranslationRequestData
  ): Promise<TranslationResponse> {
    const { text } = request;
    const sourceLang = "ko";
    const targetLang = "ja";

    if (!text || text.trim().length === 0) {
      throw new Error("번역할 텍스트가 비어있습니다.");
    }

    const translatedText = await this.translateKoreanToJapanese(text);

    return {
      translatedText,
      sourceLang,
      targetLang,
    };
  }

  /**
   * OpenAI GPT API를 사용한 한국어 → 일본어 번역
   * @param text - 번역할 한국어 텍스트
   * @returns 일본어로 번역된 텍스트
   */
  static async translateKoreanToJapanese(text: string): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "당신은 한국어를 일본어로 번역하는 전문 번역가입니다. 한국의 메뉴판, 표지판, 안내문 등을 일본인 관광객이 이해하기 쉬운 자연스러운 일본어로 번역합니다. 번역 결과만 출력하고 추가 설명은 하지 않습니다.",
          },
          {
            role: "user",
            content: `다음 한국어 텍스트를 일본어로 번역해주세요:\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const translatedText = completion.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('번역 결과를 받을 수 없습니다.');
      }
      console.log('Translated Text:', translatedText);
      return translatedText;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API 오류: ${error.message}`);
      }
      throw error;
    }
  }
}

export default TranslationService;