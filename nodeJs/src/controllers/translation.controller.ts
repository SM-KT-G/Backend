import { Request, Response } from 'express';
import translationService from '../services/translation.service';
import ocrService from '../services/ocr.service';
import { TranslationRequestBody, TranslationRequestData, TranslationError, TranslationResponse } from '../types/translation';

class TranslationController {
  static async translate(req: Request, res: Response): Promise<void> {
    try {
      const { text, sourceLang, targetLang }: TranslationRequestBody = req.body;
      const image = req.file;

      if (!text && !image) {
        const errorResponse: TranslationError = {
          error: 'INVALID_REQUEST',
          message: '텍스트 또는 이미지를 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      let textToTranslate = text;

      // 이미지가 있으면 OCR로 텍스트 추출
      if (image) {
        textToTranslate = await ocrService.extractTextFromImage(image);
      }

      const requestData: TranslationRequestData = {
        text: textToTranslate,
        sourceLang,
        targetLang,
      };

      const result: TranslationResponse = await translationService.translateJapaneseToKorean(requestData);
      console.log('Translation Result:', JSON.stringify(result));
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