/**
 * Naver Reverse Geocoding API 원본 응답 래퍼
 */
export interface NaverReverseGeocodeResponse {
  status: {
    code: number;
    name: string;
    message: string;
  };
  results: NaverReverseGeocodeResult[]; // 주소 결과 배열
}

/**
 * Naver Reverse Geocoding API 상세 결과
 */
export interface NaverReverseGeocodeResult {
  name: string; // "land" (법정동) 또는 "addr" (행정동)
  region: {
    area0: { name: string }; // "kr"
    area1: { name: string }; // 시/도 (예: "경기도")
    area2: { name: string }; // 시/군/구 (예: "오산시")
    area3: { name: string }; // 읍/면/동 (예: "초평동")
    area4: { name: string }; // 리 (예: "")
  };
}

/**
 * 중기예보를 위한 기상청 지역 ID 매핑 테이블 타입
 */
export interface KMARegionCode {
  name: string; // 시/도 이름 (예: "서울")
  regId: string; // 중기 육상예보 ID (예: "11B00000")
  tempRegId: string; // 중기 기온예보 ID (예: "11B10101")
}