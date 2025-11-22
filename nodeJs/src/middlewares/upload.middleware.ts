import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { UPLOAD_CONFIG } from '../config/upload.config';

/**
 * 파일 MIME 타입 검증
 * @param mimetype - 검증할 MIME 타입
 * @returns 허용된 타입이면 true, 아니면 false
 */
const isAllowedMimeType = (mimetype: string): boolean => {
  return (UPLOAD_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(mimetype);
};

/**
 * Multer 파일 필터 함수
 * @param _req - Express Request 객체 (미사용)
 * @param file - 업로드된 파일 정보
 * @param cb - Multer 콜백 함수
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (isAllowedMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE));
  }
};

/**
 * 파일 업로드 미들웨어 설정
 * - 메모리 스토리지 사용 (buffer로 저장)
 * - 파일 크기 제한: 5MB
 * - 허용 파일 형식: jpg, jpeg, png, tiff, pdf
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
  fileFilter,
});

export default upload;
