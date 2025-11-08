import { Router } from 'express';
import TranslationController from '../controllers/translation.controller';

const router = Router();

/**
 * POST /api/translation/translate
 * 일본어 문장을 한국어로 번역
 *
 * Request body:
 * {
 *   "text": "こんにちは、私は猫が好きです"
 * }
 *
 * Response:
 * {
 *   "originalText": "こんにちは、私は猫が好きです",
 *   "translatedText": "안녕하세요、나는고양이が好きです",
 *   "sourceLang": "ja",
 *   "targetLang": "ko"
 * }
 */
router.post('/translate', TranslationController.translateText);

export default router;
