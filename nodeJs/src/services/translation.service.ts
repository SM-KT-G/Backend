import OpenAI from 'openai';
import { TranslationRequestData, TranslationResponse } from "../types/translation.type";

class TranslationService {
  static async translateJapaneseToKorean(
    request: TranslationRequestData
  ): Promise<TranslationResponse> {
    const { text, sourceLang = "ja", targetLang = "ko" } = request;

    if (!text || text.trim().length === 0) {
      throw new Error("번역할 텍스트가 비어있습니다.");
    }

    // 지원하는 언어 체크
    const supportedLangs = ["ko", "ja"];
    if (!supportedLangs.includes(sourceLang) || !supportedLangs.includes(targetLang)) {
      throw new Error("지원하지 않는 언어입니다. 한국어(ko)와 일본어(ja)만 지원합니다.");
    }

    if (sourceLang === targetLang) {
      throw new Error("원본 언어와 대상 언어가 같습니다.");
    }

    const translatedText = await this.translate(text, sourceLang, targetLang);

    return {
      translatedText,
      sourceLang,
      targetLang,
    };
  }

  /**
   * OpenAI GPT API를 사용한 양방향 번역 (한국어 ↔ 일본어)
   * @param text - 번역할 텍스트
   * @param sourceLang - 원본 언어 (ko 또는 ja)
   * @param targetLang - 대상 언어 (ko 또는 ja)
   * @returns 번역된 텍스트
   */
  static async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const langNames: { [key: string]: string } = {
        ko: "한국어",
        ja: "일본어"
      };

      const systemPrompt = sourceLang === "ko"
        ? "당신은 한국어를 일본어로 번역하는 전문 번역가입니다. 한국의 메뉴판, 표지판, 안내문 등을 일본인 관광객이 이해하기 쉬운 자연스러운 일본어로 번역합니다. 번역 결과만 출력하고 추가 설명은 하지 않습니다."
        : "당신은 일본어를 한국어로 번역하는 전문 번역가입니다. 일본어 텍스트를 한국인이 이해하기 쉬운 자연스러운 한국어로 번역합니다. 번역 결과만 출력하고 추가 설명은 하지 않습니다.";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `다음 ${langNames[sourceLang]} 텍스트를 ${langNames[targetLang]}로 번역해주세요:\n\n${text}`,
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

  /**
   * @deprecated 하위 호환성을 위해 유지. translate() 사용 권장
   * OpenAI GPT API를 사용한 한국어 → 일본어 번역
   * @param text - 번역할 한국어 텍스트
   * @returns 일본어로 번역된 텍스트
   */
  static async translateKoreanToJapanese(text: string): Promise<string> {
    return this.translate(text, "ko", "ja");
  }
}

export default TranslationService;