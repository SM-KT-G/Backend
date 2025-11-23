# 재난 알림 API 명세서

## 개요

재난 알림 정보를 조회할 수 있는 API입니다. 지역, 재난 유형, 긴급 단계별로 재난 알림을 조회할 수 있습니다.

**Base URL**: `/api/disaster`

---

## API 엔드포인트

### 1. 지역별 재난 알림 조회

지정된 지역의 재난 알림을 조회합니다.

**Endpoint**
```
GET /api/disaster/alert/region
```

**Request Body**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| region | string | O | 지역명 (예: 서울특별시, 부산광역시) |

**Request Example**
```json
{
  "region": "서울특별시"
}
```

**Response (Success - 200)**
```json
[
  {
    "_id": "string",
    "SN": "number",
    "RCPTN_RGN_NM": "서울특별시",
    "DST_SE_NM": "호우",
    "EMRG_STEP_NM": "안전안내",
    "MSG_CN": "재난 메시지 내용",
    "CRT_DT": "2025-11-23T00:00:00.000Z"
  }
]
```

**Response (Error - 404)**
```json
{
  "message": "Cannot find region input"
}
```

**Response (Error - 500)**
```json
{
  "message": "Internal server error"
}
```

---

### 2. 재난 유형별 알림 조회

지정된 재난 유형의 알림을 조회합니다.

**Endpoint**
```
GET /api/disaster/alert/type
```

**Request Body**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| type | string | O | 재난 유형 (예: 산불, 호우, 기타) |

**Request Example**
```json
{
  "type": "호우"
}
```

**Response (Success - 200)**
```json
[
  {
    "_id": "string",
    "SN": "number",
    "RCPTN_RGN_NM": "서울특별시",
    "DST_SE_NM": "호우",
    "EMRG_STEP_NM": "안전안내",
    "MSG_CN": "재난 메시지 내용",
    "CRT_DT": "2025-11-23T00:00:00.000Z"
  }
]
```

**Response (Error - 404)**
```json
{
  "message": "Cannot find type input"
}
```

**Response (Error - 500)**
```json
{
  "message": "Internal server error"
}
```

---

### 3. 긴급 단계별 알림 조회

지정된 긴급 단계의 재난 알림을 조회합니다.

**Endpoint**
```
GET /api/disaster/alert/severity
```

**Request Body**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| severity | string | O | 긴급 단계 (예: 안전안내) |

**Request Example**
```json
{
  "severity": "안전안내"
}
```

**Response (Success - 200)**
```json
[
  {
    "_id": "string",
    "SN": "number",
    "RCPTN_RGN_NM": "서울특별시",
    "DST_SE_NM": "호우",
    "EMRG_STEP_NM": "안전안내",
    "MSG_CN": "재난 메시지 내용",
    "CRT_DT": "2025-11-23T00:00:00.000Z"
  }
]
```

**Response (Error - 404)**
```json
{
  "message": "Cannot find severity input"
}
```

**Response (Error - 500)**
```json
{
  "message": "Internal server error"
}
```

---

## 데이터 스키마

### MongoDB 컬렉션: `messages`

| 필드명 | 설명 |
|--------|------|
| SN | 일련번호 |
| RCPTN_RGN_NM | 지역명 (예: 서울특별시, 부산광역시) |
| DST_SE_NM | 재난 재해 구분 (예: 산불, 호우, 기타) |
| EMRG_STEP_NM | 긴급 단계 (예: 안전안내) |
| MSG_CN | 재난 메시지 내용 |
| CRT_DT | 생성 일시 |

---

## 공통 사항

### 정렬 및 제한
- 모든 조회 API는 `SN` 기준 내림차순으로 정렬됩니다.
- 최대 10개의 결과만 반환됩니다.

### 검색 방식
- 모든 검색은 대소문자를 구분하지 않는 부분 일치 검색(regex)을 사용합니다.
- 예: "서울"로 검색 시 "서울특별시", "서울시" 등 모두 매칭됩니다.

### 응답 형식
- 성공 시: HTTP 200과 함께 배열 형태의 재난 알림 데이터 반환
- 실패 시: 해당 HTTP 상태 코드와 에러 메시지 반환

---

## 사용 예시

### cURL 예시

```bash
# 지역별 조회
curl -X GET http://localhost:3000/api/disaster/alert/region \
  -H "Content-Type: application/json" \
  -d '{"region": "서울특별시"}'

# 재난 유형별 조회
curl -X GET http://localhost:3000/api/disaster/alert/type \
  -H "Content-Type: application/json" \
  -d '{"type": "호우"}'

# 긴급 단계별 조회
curl -X GET http://localhost:3000/api/disaster/alert/severity \
  -H "Content-Type: application/json" \
  -d '{"severity": "안전안내"}'
```

### JavaScript (Fetch) 예시

```javascript
// 지역별 조회
const response = await fetch('http://localhost:3000/api/disaster/alert/region', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    region: '서울특별시'
  })
});

const data = await response.json();
console.log(data);
```

---

## 참고 사항

- 이 API는 MongoDB의 `messages` 컬렉션을 사용합니다.
- GET 메서드지만 Request Body를 사용하는 구조입니다.
- 검색 조건은 regex를 사용하여 유연한 검색이 가능합니다.
