-- Users 테이블
CREATE TABLE IF NOT EXISTS USERS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID v4 형식의 고유 식별자',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일 (로그인 ID)',
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt로 해싱된 비밀번호',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 정보 수정 시각',

  -- 인덱스 추가
  INDEX idx_uuid (uuid),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 인증 정보 테이블';

-- Chat Sessions 테이블 채팅방/대화 세션 테이블입니다
CREATE TABLE IF NOT EXISTS CHAT_SESSIONS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID v4 형식의 고유 식별자',
  user_id INT NOT NULL COMMENT '채팅방 소유자 (USERS 테이블 참조)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '채팅방 생성 시각',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '마지막 업데이트 시각',

  -- 외래키는 user의 pk를 참조하고 있습니다
  FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,

  -- 인덱스 추가
  INDEX idx_uuid (uuid),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅 세션(대화방) 테이블';

-- Chat Messages 테이블 각 세션의 개별 메시지를 저장하고 있습니다
CREATE TABLE IF NOT EXISTS CHAT_MESSAGES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL COMMENT '소속 채팅 세션 (CHAT_SESSIONS 테이블 참조)',
  openai_completion_id VARCHAR(255) COMMENT 'OpenAI API Completion ID (chatcmpl-xxx)',
  role ENUM('user', 'bot') NOT NULL COMMENT '메시지 역할 (user: 사용자, bot: 챗봇)',
  content LONGTEXT NOT NULL COMMENT '메시지 내용',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '메시지 생성 시각',

  -- 외래키는 CHAT_SESSIONS의 pk를 참조하고 있습니다
  FOREIGN KEY (session_id) REFERENCES CHAT_SESSIONS(id) ON DELETE CASCADE,

  -- 인덱스 추가
  INDEX idx_session_id (session_id),
  INDEX idx_openai_completion_id (openai_completion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅 메시지 테이블';