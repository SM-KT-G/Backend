import { Router } from 'express';
import TranslationController from '../controllers/translation.controller';
import upload from '../middlewares/upload.middleware';

const router = Router();

/**
 * POST /api/translation/translate
 * 텍스트 또는 이미지를 번역
 *
 * Request (텍스트):
 * Content-Type: application/json
 * {
 *   "text": "불고기",
 *   "sourceLang": "ko",
 *   "targetLang": "ja"
 * }
 *
 * Request (이미지):
 * Content-Type: multipart/form-data
 * - file: 이미지 파일 (jpg, jpeg, png, tiff, pdf)
 * - sourceLang: "ko" (optional)
 * - targetLang: "ja" (optional)
 *
 * Response:
 * {
 *   "translatedText": "プルコギ",
 *   "sourceLang": "ko",
 *   "targetLang": "ja"
 * }
 */
router.post('/translate', upload.single('file'), TranslationController.translate);

export default router;
{}