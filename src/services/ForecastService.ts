import axios from 'axios';
import { GeoConverter } from '../utils/GeoConverter';
import {
  // 단기예보 타입
  KMAShortTermForecastResponse,
  KMAShortTermItem,
  HourlyForecast,
  // 중기예보 타입
  KMAMidTermLandForecastResponse,
  KMAMidTermTempForecastResponse,
  DailyForecast,
} from '../types/forecast.types';

// --- API 엔드포인트 ---
const KMA_SHORT_TERM_URL =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'; // 단기예보
const KMA_MID_TERM_LAND_URL =
  'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst'; // 중기육상예보
const KMA_MID_TERM_TEMP_URL =
  'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa'; // 중기기온

// .env 에서 공공데이터 키 가져오기
const KMA_SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

// --- 캐시 설정 ---
const CACHE_TTL_SHORT = 60 * 60 * 1000; // 단기예보는 1시간
const CACHE_TTL_MID = 3 * 60 * 60 * 1000; // 중기예보는 3시간

class ForecastService {
  private shortTermCache: Map<string, { timestamp: number; data: HourlyForecast[] }> = new Map();
  private midTermCache: Map<string, { timestamp: number; data: DailyForecast[] }> = new Map();

  // =================================================================
  // 1. 단기예보 (오늘 ~ 모레)
  // =================================================================

  /**
   * (lat, lon) 좌표 기반으로 3일치 단기예보를 가져옵니다.
   */
  async getShortTermForecast(
    lat: number,
    lon: number
  ): Promise<HourlyForecast[]> {
    // [핵심 1] 단기예보는 X, Y 격자 좌표를 사용합니다.
    const { x, y } = GeoConverter.convertToXY(lat, lon);
    const cacheKey = `${x},${y}`;
    const now = Date.now();

    // 캐시 확인 (1시간)
    if (this.shortTermCache.has(cacheKey)) {
      const entry = this.shortTermCache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL_SHORT) {
        console.log(`[Cache] HIT: Short-term forecast for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new short-term forecast for ${cacheKey}`);

    try {
      // [핵심 2] 단기예보는 API가 요구하는 'base_time' (발표시각)이 중요합니다.
      const { base_date, base_time } = this.getKmaShortTermBaseTime();

      const response = await axios.get<KMAShortTermForecastResponse>(
        KMA_SHORT_TERM_URL,
        {
          params: {
            serviceKey: KMA_SERVICE_KEY,
            dataType: 'JSON',
            numOfRows: 1000, // 3일치 (약 300개) 데이터를 모두 받기 위해 넉넉하게
            pageNo: 1,
            base_date: base_date, // "20251116"
            base_time: base_time, // "0500" (발표시각)
            nx: x,
            ny: y,
          },
        }
      );

      const items = response.data?.response?.body?.items?.item;
      if (!items) {
        throw new Error('단기예보 API 응답 형식이 올바르지 않습니다.');
      }

      // [핵심 3] (TMP, POP, PTY...) 흩어진 데이터를 시간대별로 그룹화
      const formattedData = this.parseShortTermData(items);

      this.shortTermCache.set(cacheKey, {
        timestamp: now,
        data: formattedData,
      });

      return formattedData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (KMA Short-Term): ${error.message}`);
      } else {
        console.error(`Error in getShortTermForecast: ${error}`);
      }
      throw new Error('단기예보 정보를 가져오는 데 실패했습니다.');
    }
  }

  // =================================================================
  // 2. 중기예보 (3일 ~ 10일)
  // =================================================================

  /**
   * (regId) 지역 ID 기반으로 10일치 중기예보를 가져옵니다.
   * [주의] 중기예보는 (X, Y)가 아닌 'regId' (지역 ID)를 사용합니다.
   * (lat, lon -> regId 변환은 이 서비스의 다음 단계에서 구현합니다.)
   */
  async getMidTermForecast(regId: string): Promise<DailyForecast[]> {
    const cacheKey = regId;
    const now = Date.now();

    // 캐시 확인 (3시간)
    if (this.midTermCache.has(cacheKey)) {
      const entry = this.midTermCache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL_MID) {
        console.log(`[Cache] HIT: Mid-term forecast for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new mid-term forecast for ${cacheKey}`);

    try {
      // [핵심 4] 중기예보는 '날씨'와 '기온' API를 *2번 호출*해야 합니다.
      const { base_time } = this.getKmaMidTermBaseTime(); // "0600" 또는 "1800"

      // 호출 1: 날씨(오전/오후) API
      const landResponse = await axios.get<KMAMidTermLandForecastResponse>(
        KMA_MID_TERM_LAND_URL,
        {
          params: {
            serviceKey: KMA_SERVICE_KEY,
            dataType: 'JSON',
            regId: regId, // "11B00000" (X, Y가 아님)
            tmFc: base_time, // "202511160600"
          },
        }
      );

      // 호출 2: 기온(최저/최고) API
      const tempResponse = await axios.get<KMAMidTermTempForecastResponse>(
        KMA_MID_TERM_TEMP_URL,
        {
          params: {
            serviceKey: KMA_SERVICE_KEY,
            dataType: 'JSON',
            regId: regId.startsWith('11') ? regId.slice(0, 8) + '101' : regId, // 기온 ID는 다소 다를 수 있음 (예: 11B10101)
            tmFc: base_time,
          },
        }
      );

      const landItem = landResponse.data?.response?.body?.items?.item?.[0];
      const tempItem = tempResponse.data?.response?.body?.items?.item?.[0];

      if (!landItem || !tempItem) {
        throw new Error('중기예보 API 응답 형식이 올바르지 않습니다.');
      }

      // [핵심 5] 날씨(landItem)와 기온(tempItem) 데이터를 조합
      const formattedData = this.parseMidTermData(landItem, tempItem);

      this.midTermCache.set(cacheKey, {
        timestamp: now,
        data: formattedData,
      });

      return formattedData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (KMA Mid-Term): ${error.message}`);
      } else {
        console.error(`Error in getMidTermForecast: ${error}`);
      }
      throw new Error('중기예보 정보를 가져오는 데 실패했습니다.');
    }
  }

  // =================================================================
  // Private 헬퍼 메소드
  // =================================================================

  /**
   * (Private) 단기예보 발표 시각(base_time) 계산
   * 단기예보는 02시, 05시, 08시, 11시, 14시, 17시, 20시, 23시에 발표됨 (하루 8번)
   * 현재 시각에서 가장 가까운 *과거* 발표 시각을 찾아야 함
   */
  private getKmaShortTermBaseTime(): { base_date: string; base_time: string } {
    const now = new Date();
    // API는 10분 정도 늦게 생성되므로 10분을 뺌
    now.setMinutes(now.getMinutes() - 10); 

    const hours = now.getHours();
    // 02시, 05시... 23시 (3시간 간격)
    const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let baseHour = availableTimes[availableTimes.length - 1]; // 기본값 23

    // 현재 시간보다 작은 가장 큰 발표 시간 찾기
    for (let i = availableTimes.length - 1; i >= 0; i--) {
      if (hours >= availableTimes[i]) {
        baseHour = availableTimes[i];
        break;
      }
    }

    // 만약 현재가 00시, 01시라면 (baseHour=23이 선택됨), 날짜를 하루 빼야 함
    if (hours < 2) {
      now.setDate(now.getDate() - 1);
      baseHour = 23; // 어제 23시
    }

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    return {
      base_date: `${year}${month}${day}`,
      base_time: `${baseHour.toString().padStart(2, '0')}00`,
    };
  }

  /**
   * (Private) 중기예보 발표 시각(tmFc) 계산
   * 중기예보는 06시, 18시에 발표됨 (하루 2번)
   */
  private getKmaMidTermBaseTime(): { base_time: string } {
    const now = new Date();
    const hours = now.getHours();
    
    let baseTime = "0600";
    if (hours < 6) {
      // 06시 이전이면, 어제 18시 데이터 사용
      now.setDate(now.getDate() - 1);
      baseTime = "1800";
    } else if (hours >= 18) {
      // 18시 이후면, 오늘 18시 데이터 사용
      baseTime = "1800";
    }
    // 6시 ~ 18시 사이는 06시 데이터 사용

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    return {
      base_time: `${year}${month}${day}${baseTime}`, // "202511160600"
    };
  }

  /**
   * (Private) 단기예보 API (item 배열)를 HourlyForecast 배열로 가공
   */
  private parseShortTermData(items: KMAShortTermItem[]): HourlyForecast[] {
    const forecastMap = new Map<string, Partial<HourlyForecast>>();

    // 1. (TMP, POP...) 흩어진 데이터를 시간대별로 그룹화
    items.forEach(item => {
      const key = `${item.fcstDate}${item.fcstTime}`;
      if (!forecastMap.has(key)) {
        forecastMap.set(key, {
          fcstDate: item.fcstDate,
          fcstTime: item.fcstTime,
        });
      }

      const entry = forecastMap.get(key)!;
      switch (item.category) {
        case 'TMP': entry.temp = parseFloat(item.fcstValue); break;
        case 'POP': entry.rainProbability = parseInt(item.fcstValue); break;
        case 'SKY': entry.sky = this.getSkyState(item.fcstValue); break;
        case 'PTY': entry.rainType = this.getRainType(KMA_PTY_CODE, item.fcstValue); break;
      }
    });

    // 2. Map을 배열로 변환하고 정렬
    return Array.from(forecastMap.values())
      .sort((a, b) => 
        parseInt(a.fcstDate! + a.fcstTime!) - parseInt(b.fcstDate! + b.fcstTime!)
      ) as HourlyForecast[];
  }

  /**
   * (Private) 중기예보 (날씨, 기온) 2개 응답을 DailyForecast 배열로 조합
   */
  private parseMidTermData(landItem: any, tempItem: any): DailyForecast[] {
    const forecasts: DailyForecast[] = [];
    
    // 3일 후부터 10일 후까지 반복
    for (let i = 3; i <= 10; i++) {
      forecasts.push({
        day: i,
        weatherAm: landItem[`wf${i}Am`],
        weatherPm: landItem[`wf${i}Pm`],
        tempMin: tempItem[`taMin${i}`],
        tempMax: tempItem[`taMax${i}`],
      });
    }
    return forecasts;
  }
  
  // (Private) 코드 변환 헬퍼 (초단기/단기 공용)
  private getSkyState = (code: string): string => {
    switch (code) {
      case '1': return '맑음';
      case '3': return '구름많음';
      case '4': return '흐림';
      default: return '알 수 없음';
    }
  }

  private getRainType = (type: any, code: string): string => {
    return type[code] || '없음';
  }
}

// 코드 변환표
const KMA_PTY_CODE: { [key: string]: string } = {
  '0': '없음',
  '1': '비',
  '2': '비/눈',
  '3': '눈',
  '4B': '소나기',
  '5': '빗방울',
  '6': '빗방울/눈날림',
  '7': '눈날림',
};

// 싱글톤 인스턴스 Export
export default new ForecastService();