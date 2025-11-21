/**
 * '시도별 실시간 평균정보 조회' API 원본 응답 래퍼
 * (공공데이터포털 API는 응답 구조가 조금씩 다를 수 있습니다)
 */
export interface AirKoreaResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: AirKoreaItem[]; // item이 배열로 옴
      totalCount: number;
    };
  };
}

/**
 * '시도별 실시간 평균정보' API의 개별 아이템 (시/도 별)
 */
export interface AirKoreaItem {
  sidoName: string; // "서울", "경기", "인천" ...
  pm10Value: string; // "35" (미세먼지 PM10)
  pm25Value: string; // "20" (초미세먼지 PM2.5)
  // ... (o3Value, no2Value 등 다른 오염물질도 있음)
  dataTime: string; // "2025-11-16 13:00"
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 '대기질' 정보
 */
export interface AirQualityInfo {
  pm10: number; // 미세먼지
  pm25: number; // 초미세먼지
  dataTime: string; // 측정 시각
}