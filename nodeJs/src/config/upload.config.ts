/**
 * 파일 업로드 설정
 */
export const UPLOAD_CONFIG = {
  /** 최대 파일 크기 (bytes) */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  /** 허용된 MIME 타입 */
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/tiff',
    'application/pdf',
  ] as const,

  /** 에러 메시지 */
  ERROR_MESSAGES: {
    INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다. (jpg, jpeg, png, tiff, pdf만 가능)',
  },
} as const;

export type AllowedMimeType = typeof UPLOAD_CONFIG.ALLOWED_MIME_TYPES[number];
