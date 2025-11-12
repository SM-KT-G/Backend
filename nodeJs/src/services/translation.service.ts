import { TranslationRequestData, TranslationResponse } from "../types/translation";

class TranslationService {
  static async translateJapaneseToKorean(
    request: TranslationRequestData
  ): Promise<TranslationResponse> {
    const { text, sourceLang = "ja", targetLang = "ko" } = request;

    if (!text || text.trim().length === 0) {
      throw new Error("번역할 텍스트가 비어있습니다.");
    }

    const translatedText = await this.translate(text);

    return {
      translatedText,
      sourceLang,
      targetLang,
    };
  }
  // 간단한 사전 기반 번역 API가 잘 작동하는지 테스트
  static async translate(
    text: string
  ): Promise<string> {
    // 간단한 사전 기반 번역 예시
    const dictionary: Record<string, string> = {
      犬: "개",
      水: "물",
      食べる: "먹다",
      飲む: "마시다",
      行く: "가다",
      来る: "오다",
    };
    return dictionary[text] || text;
  }

}

export default TranslationService;