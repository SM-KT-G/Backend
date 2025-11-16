import axios from 'axios';
// GeoConverter에서 '지역 이름'을 가져오는 기능을 사용합니다.
import { GeoConverter } from '../utils/GeoConverter';
import {
  AirKoreaResponse,
  AirKoreaItem,
  AirQualityInfo,
} from '../types/airquality.types';
import { KMARegionCode } from '../types/geocoding.types';

// '시도별 실시간 평균정보 조회' API 엔드포인트
const AIR_KOREA_URL =
  'https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnRltmMesureDnsty';

// .env 에서 공공데이터 키 가져오기 (기상청과 동일한 키 사용)
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

// 캐시 설정 (대기질 정보는 1시간마다 갱신)
const CACHE_TTL = 60 * 60 * 1000;

class AirQualityService {
  private cache: Map<string, { timestamp: number; data: AirQualityInfo }> =
    new Map();

  /**
   * (lat, lon) 좌표 기반으로 현재 대기질(미세먼지) 정보를 가져옵니다.
   */
  async getCurrentAirQuality(
    lat: number,
    lon: number
  ): Promise<AirQualityInfo> {
    
    // [핵심 1] lat, lon -> '시/도' 이름 (예: "경기", "서울") 획득
    const regionCodes: KMARegionCode = await GeoConverter.getRegionCodes(
      lat,
      lon
    );
    // API는 "서울", "경기" 등 축약된 이름을 파라미터로 요구합니다.
    const sidoName = regionCodes.name;
    const cacheKey = sidoName;
    const now = Date.now();

    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Air quality for ${cacheKey}`);
        return entry.data;
      }
    }
    console.log(`[Cache] MISS: Fetching new air quality for ${cacheKey}`);

    try {
      const response = await axios.get<AirKoreaResponse>(AIR_KOREA_URL, {
        params: {
          serviceKey: SERVICE_KEY,
          returnType: 'JSON',
          sidoName: sidoName, // "서울", "경기" 등
          searchDate: this.getCurrentDate(), // "YYYY-MM-DD" (당일)
          numOfRows: 1, // 해당 시/도의 1개 데이터면 충분
          pageNo: 1,
        },
      });

      // [핵심 2] API 응답에서 item 배열의 첫 번째 항목을 사용
      const item = response.data?.response?.body?.items?.[0];
      if (!item) {
        throw new Error('대기질 API 응답 형식이 올바르지 않습니다.');
      }

      const airQualityInfo: AirQualityInfo = {
        pm10: parseInt(item.pm10Value) || 0, // 미세먼지
        pm25: parseInt(item.pm25Value) || 0, // 초미세먼지
        dataTime: item.dataTime, // 측정시각
      };

      this.cache.set(cacheKey, {
        timestamp: now,
        data: airQualityInfo,
      });

      return airQualityInfo;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (Air Korea): ${error.message}`);
      } else {
        console.error(`Error in getCurrentAirQuality: ${error}`);
      }
      throw new Error('대기질 정보를 가져오는 데 실패했습니다.');
    }
  }

  /**
   * (Private) "YYYY-MM-DD" 형식의 현재 날짜 문자열을 반환합니다.
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// 싱글톤 인스턴스 Export
export default new AirQualityService();