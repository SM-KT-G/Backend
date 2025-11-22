# Chatbot API 명세서

## 개요
사용자와 챗봇 간의 대화를 관리하는 API입니다. FastAPI 서버와 연동하여 자연어 처리 및 장소 검색 기능을 제공합니다.

## Base URL
```
/api/chatbot
```

## 인증
모든 엔드포인트는 `authMiddleware`를 통한 JWT 인증이 필요합니다.

---

## 엔드포인트

### 1. 채팅 메시지 전송

사용자 메시지를 전송하고 챗봇 응답을 받습니다.

**Endpoint:** `POST /chat`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "서울에서 가볼만한 카페 추천해줘"
}
```

**Response:**

*일반 채팅 응답*
```json
{
  "response_type": "chat",
  "message": "안녕하세요! 무엇을 도와드릴까요?"
}
```

*장소 검색 응답*
```json
{
  "response_type": "search",
  "message": "서울의 추천 카페 목록입니다.",
  "places": [
    {
      "place_name": "스타벅스 강남점",
      "domain": "카페",
      "area": "서울 강남구",
      "description": "넓고 쾌적한 분위기",
      "source_id": "place_12345"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: 성공
- `400 Bad Request`: 메시지 누락
- `401 Unauthorized`: 인증 실패
- `500 Internal Server Error`: 서버 오류

---

### 2. 특정 채팅 세션 조회

UUID로 특정 채팅 세션과 메시지 기록을 조회합니다.

**Endpoint:** `GET /chat/:uuid`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `uuid` (string, required): 채팅 세션의 고유 식별자

**Response:**
```json
{
  "chat": {
    "session": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": 123,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:35:00.000Z"
    },
    "messages": [
      {
        "id": 1,
        "session_id": 1,
        "role": "user",
        "content": "{\"message\":\"안녕하세요\"}",
        "parsed_content": {
          "message": "안녕하세요"
        },
        "openai_completion_id": null,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "session_id": 1,
        "role": "bot",
        "content": "{\"response_type\":\"chat\",\"message\":\"안녕하세요! 무엇을 도와드릴까요?\"}",
        "parsed_content": {
          "response_type": "chat",
          "message": "안녕하세요! 무엇을 도와드릴까요?"
        },
        "openai_completion_id": null,
        "created_at": "2024-01-15T10:30:05.000Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK`: 성공
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 접근 권한 없음 (다른 사용자의 채팅)
- `404 Not Found`: 채팅 세션을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 3. 사용자의 모든 채팅 세션 조회

현재 로그인한 사용자의 모든 채팅 기록을 조회합니다.

**Endpoint:** `GET /chats`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "session": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 123,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "messages": [
    {
      "id": 1,
      "session_id": 1,
      "role": "user",
      "content": "{\"message\":\"서울 맛집 추천해줘\"}",
      "parsed_content": {
        "message": "서울 맛집 추천해줘"
      },
      "openai_completion_id": null,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "session_id": 1,
      "role": "bot",
      "content": "{\"response_type\":\"search\",\"message\":\"서울의 추천 맛집입니다.\",\"places\":[...]}",
      "parsed_content": {
        "response_type": "search",
        "message": "서울의 추천 맛집입니다.",
        "places": [
          {
            "place_name": "강남 한정식",
            "domain": "한식",
            "area": "서울 강남구",
            "description": "전통 한정식 전문점",
            "source_id": "place_67890"
          }
        ]
      },
      "openai_completion_id": null,
      "created_at": "2024-01-15T10:30:05.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: 성공
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 채팅 세션이 없음
- `500 Internal Server Error`: 서버 오류

---

## 데이터 모델

### FastAPIResponse
```typescript
interface FastAPIResponse {
  response_type: 'chat' | 'search';
  message: string;
  places?: Array<{
    place_name: string;
    domain: string;
    area: string;
    description: string;
    source_id: string;
  }>;
}
```

### ChatSession
```sql
CHAT_SESSIONS {
  id: INT (PK, AUTO_INCREMENT)
  uuid: VARCHAR(36) (UNIQUE)
  user_id: INT (FK -> USERS)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### ChatMessage
```sql
CHAT_MESSAGES {
  id: INT (PK, AUTO_INCREMENT)
  session_id: INT (FK -> CHAT_SESSIONS)
  role: ENUM('user', 'bot')
  content: TEXT (JSON string)
  openai_completion_id: VARCHAR(255) (NULLABLE)
  created_at: TIMESTAMP
}
```

---

## 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": "에러 메시지"
}
```

**공통 에러 메시지:**
- `"Not authorized"` - 인증 토큰이 없거나 유효하지 않음
- `"Message is required"` - 필수 파라미터 누락
- `"Chat not found"` - 요청한 채팅 세션을 찾을 수 없음
- `"Forbidden: You don't have access to this chat"` - 다른 사용자의 채팅에 접근 시도
- `"No chat session found"` - 사용자의 채팅 세션이 존재하지 않음
- `"Internal server error"` - 서버 내부 오류

---

## 동작 흐름

### 채팅 메시지 전송 프로세스

1. 클라이언트가 JWT 토큰과 함께 메시지 전송
2. 서버가 사용자 인증 확인
3. 사용자의 기존 세션 확인, 없으면 새로 생성
4. FastAPI 서버로 메시지 전달 (`POST {FASTAPI_BASE_URL}/chat`)
5. FastAPI 응답 수신 (chat 또는 search 타입)
6. 사용자 메시지와 봇 응답을 DB에 JSON 형태로 저장
7. FastAPI 응답을 클라이언트에 반환

### 세션 관리

- 각 사용자는 하나의 활성 세션을 가짐
- 세션은 UUID로 식별됨
- 모든 메시지는 세션에 연결되어 시간순으로 저장됨
- 메시지 내용은 JSON 문자열로 저장되며, 조회 시 파싱됨

---

## 환경 변수

```env
FASTAPI_BASE_URL=http://fastapi-server:8000
```

FastAPI 서버의 기본 URL을 설정합니다.

---

## 참고사항

- 모든 타임스탬프는 UTC 기준입니다
- 메시지 내용은 JSON 문자열로 저장되어 유연한 데이터 구조를 지원합니다
- `parsed_content` 필드는 조회 시 자동으로 생성되며, JSON 파싱 실패 시 원본 메시지를 포함합니다
- 한 사용자당 하나의 채팅 세션만 활성화되며, 모든 대화는 해당 세션에 누적됩니다
