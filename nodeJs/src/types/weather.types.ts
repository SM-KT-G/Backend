/**
 * 서비스가 프론트엔드에 제공할 가공된 날씨 정보 (최종 반환 타입)
 * (공공데이터 API 기반으로 수정됨)
 */
export interface WeatherInfo {
  temp: number; // 기온 (섭씨)
  sky: string; // 하늘 상태 (예: "맑음", "구름많음")
  rainType: string; // 강수 형태 (예: "비", "눈")
  rainAmount: string; // 1시간 강수량 (예: "1.0mm")
}

// ----------------------------------------------------------------
// (참고) 아래는 '초단기실황' API의 원본 응답 타입을 정의한 것입니다.
// ----------------------------------------------------------------

/**
 * '초단기실황조회' API 원본 응답 래퍼
 * (response.body.items.item이 실제 데이터)
 */
export interface KMAUltraShortTermLiveResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        // item이 배열로 옴
        item: KMAUltraShortTermItem[];
      };
      totalCount: number;
    };
  };
}

/**
 * '초단기실황조회' API의 개별 아이템
 * (T1H, RN1, SKY, PTY 등의 코드로 옴)
 */
export interface KMAUltraShortTermItem {
  baseDate: string; // "20231116"
  baseTime: string; // "0600"
  category: string; // "T1H" (기온), "RN1" (1시간 강수량), "SKY" (하늘상태) 등
  obsrValue: string; // "10.0" (관측값)
  nx: number;
  ny: number;
}

// --- [이 부분 파일 맨 아래에 추가됨] ---

/**
 * (AdvisoryService) 특보 정보 타입 (가져오기)
 */
import { AdvisoryInfo } from './advisory.types';

/**
 * (AirQualityService) 대기질 정보 타입 (가져오기)
 */
import { AirQualityInfo } from './airquality.types';

/**
 * [최종] WeatherController가 반환할 '통합 현재 날씨' 타입
 * (날씨 + 특보 + 미세먼지)
 */
export interface CombinedWeatherInfo {
  weather: WeatherInfo;
  advisory: AdvisoryInfo;
  airQuality: AirQualityInfo;
}