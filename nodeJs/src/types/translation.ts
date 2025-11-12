export interface TranslationRequestBody {
  text?: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslationRequestData {
  text?: string;
  image?: Express.Multer.File;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationError {
  error: string;
  message: string;
}
