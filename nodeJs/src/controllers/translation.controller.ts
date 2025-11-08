import { Request, Response } from 'express';
import TranslationService from '../services/translation.service';
import { TranslationRequest, TranslationError, TranslationResponse } from '../types/translation';

class TranslationController {
  static async translateText(req: Request, res: Response): Promise<void> {
    try {
      const { text, sourceLang, targetLang }: TranslationRequest = req.body;

      if (!text) {
        const errorResponse: TranslationError = {
          error: 'INVALID_REQUEST',
          message: '번역할 텍스트를 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }
      const result: TranslationResponse = await TranslationService.translateJapaneseToKorean({
        text,
        sourceLang,
        targetLang,
      });
      res.json(result);
    } catch (error) {
      const errorResponse: TranslationError = {
        error: 'TRANSLATION_ERROR',
        message: error instanceof Error ? error.message : '번역 중 오류가 발생했습니다.',
      };
      res.status(500).json(errorResponse);
    }
  }
}

export default TranslationController;