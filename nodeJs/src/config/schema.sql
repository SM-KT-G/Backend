-- Users 테이블 (인증 기능용)
CREATE TABLE IF NOT EXISTS USERS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID v4 형식의 고유 식별자',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일 (로그인 ID)',
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt로 해싱된 비밀번호',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 정보 수정 시각',

  -- 인덱스
  INDEX idx_uuid (uuid),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 인증 정보 테이블';