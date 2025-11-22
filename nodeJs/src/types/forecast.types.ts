// ----------------------------------------------------------------
// 1. 단기예보 (오늘~모레, 3시간 단위)
// ----------------------------------------------------------------

/**
 * '단기예보조회' API 원본 응답 래퍼
 */
export interface KMAShortTermForecastResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: KMAShortTermItem[];
      };
      totalCount: number;
    };
  };
}

/**
 * '단기예보조회' API의 개별 아이템
 * (TMP, POP, PTY, SKY 등의 코드로 옴)
 */
export interface KMAShortTermItem {
  baseDate: string; // "20231116"
  baseTime: string; // "0500" (발표시각)
  category: string; // "TMP" (기온), "POP" (강수확률), "SKY" (하늘상태)
  fcstDate: string; // "20231116" (예보일자)
  fcstTime: string; // "0900" (예보시각)
  fcstValue: string; // "10" (예보값)
  nx: number;
  ny: number;
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 '단기예보' (시간별)
 */
export interface HourlyForecast {
  fcstDate: string; // "20231116"
  fcstTime: string; // "0900"
  temp: number; // 기온 (TMP)
  sky: string; // 하늘 상태 (SKY)
  rainType: string; // 강수 형태 (PTY)
  rainProbability: number; // 강수 확률 (POP)
}

// ----------------------------------------------------------------
// 2. 중기예보 (3일~10일)
// ----------------------------------------------------------------

/**
 * '중기육상예보조회' API 원본 응답 래퍼
 */
export interface KMAMidTermLandForecastResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: KMAMidTermLandItem[];
      };
    };
  };
}

/**
 * '중기육상예보조회' API의 개별 아이템 (날씨)
 */
export interface KMAMidTermLandItem {
  regId: string; // "11B00000"
  wf3Am: string; // 3일 후 오전 날씨
  wf3Pm: string; // 3일 후 오후 날씨
  wf4Am: string; // 4일 후 오전 날씨
  // ... (wf10Pm 까지)
}

/**
 * '중기기온조회' API 원본 응답 래퍼
 */
export interface KMAMidTermTempForecastResponse {
  response: {
    // ... (Land와 동일한 구조) ...
    body: {
      items: {
        item: KMAMidTermTempItem[];
      };
    };
  };
}

/**
 * '중기기온조회' API의 개별 아이템 (기온)
 */
export interface KMAMidTermTempItem {
  regId: string; // "11B10101"
  taMin3: number; // 3일 후 최저기온
  taMax3: number; // 3일 후 최고기온
  taMin4: number; // 4일 후 최저기온
  // ... (taMax10 까지)
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 '중기예보' (일자별)
 */
export interface DailyForecast {
  day: number; // 3 (3일 후), 4 (4일 후), ... 10
  tempMin: number; // 최저 기온
  tempMax: number; // 최고 기온
  weatherAm: string; // 오전 날씨
  weatherPm: string; // 오후 날씨
}