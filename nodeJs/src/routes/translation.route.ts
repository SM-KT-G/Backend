import { Router } from 'express';
import multer from 'multer';
import TranslationController from '../controllers/translation.controller';

const router = Router();

// Multer 설정: 메모리 스토리지 사용 (buffer로 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/tiff', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. (jpg, jpeg, png, tiff, pdf만 가능)'));
    }
  },
});

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


