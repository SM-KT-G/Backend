import axios from 'axios';
// [변경] 새로 만든 GeoConverter와 날씨 타입을 가져옵니다.
import { GeoConverter } from '../utils/GeoConverter';
import {
  WeatherInfo,
  KMAUltraShortTermLiveResponse,
  KMAUltraShortTermItem,
} from '../types/weather.types';

// [변경] '초단기실황' API 엔드포인트
const KMA_API_URL =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

// [변경] .env 파일에서 *새로운* 공공데이터 API 키를 가져옵니다.
const KMA_SERVICE_KEY = process.env.PUBLIC_DATA_KEY; 

/**
 * 캐시된 데이터를 저장하기 위한 인터페이스 (내부용)
 */
interface CacheEntry {
  timestamp: number;
  data: WeatherInfo;
}

// 캐시 유효 시간: 30분 (초단기실황은 1시간마다 갱신되므로 30분이면 충분)
const CACHE_TTL = 30 * 60 * 1000; 

class WeatherService {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 특정 위도와 경도를 기반으로 "현재" 날씨 정보를 가져옵니다.
   * (OpenWeatherMap -> 공공데이터 '초단기실황' API로 변경됨)
   * @param lat 위도
   * @param lon 경도
   * @returns 가공된 날씨 정보(WeatherInfo) Promise 객체
   */
  async getCurrentWeather(
    lat: number,
    lon: number
  ): Promise<WeatherInfo> {
    // [핵심 1] lat, lon을 X, Y 격자 좌표로 변환
    const { x, y } = GeoConverter.convertToXY(lat, lon);
    const cacheKey = `${x},${y}`; // 캐시 키를 X,Y 기반으로 변경
    const now = Date.now();

    // 2. 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather data for ${cacheKey}`);
        return entry.data;
      }
    }

    console.log(`[Cache] MISS: Fetching new weather data for ${cacheKey}`);

    try {
      // 3. API 호출 (private 헬퍼 메소드)
      const formattedWeather = await this.fetchFromKMA(x, y);

      // 4. 캐시에 저장
      this.cache.set(cacheKey, {
        timestamp: now,
        data: formattedWeather,
      });

      return formattedWeather;
    } catch (error) {
      throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
    }
  }

  /**
   * (Private) 기상청 '초단기실황' API에서 데이터를 직접 가져옵니다.
   */
  private async fetchFromKMA(nx: number, ny: number): Promise<WeatherInfo> {
    // [핵심 2] API가 요구하는 'base_date'와 'base_time' 계산
    const { base_date, base_time } = this.getKmaBaseTime();

    try {
      const response = await axios.get<KMAUltraShortTermLiveResponse>(
        KMA_API_URL,
        {
          params: {
            serviceKey: KMA_SERVICE_KEY, // 인증키
            dataType: 'JSON',             // 응답 자료 형식
            numOfRows: 10,                // 한 페이지 결과 수 (10개면 충분)
            pageNo: 1,
            base_date: base_date,         // 예: "20251116"
            base_time: base_time,         // 예: "1230"
            nx: nx,                       // X 좌표
            ny: ny,                       // Y 좌표
          },
        }
      );

      const items = response.data?.response?.body?.items?.item;
      if (!items) {
        throw new Error('기상청 API 응답 형식이 올바르지 않습니다.');
      }

      // [핵심 3] 복잡한 item 배열을 WeatherInfo 객체로 가공
      return this.parseKMAData(items);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (KMA Weather): ${error.message}`);
      } else {
        console.error(`Error in fetchFromKMA: ${error}`);
      }
      throw error;
    }
  }

  /**
   * (Private) 기상청 API는 1시간마다 갱신되며, 'base_time'이 필요합니다.
   * (예: 12:47분 -> 12:30 데이터 요청, 12:20분 -> 11:30 데이터 요청)
   */
  private getKmaBaseTime(): { base_date: string; base_time: string } {
    const now = new Date();
    
    // API는 매시 30분에 생성됨 (예: 12:30)
    // 현재 시간이 40분 이전이면 이전 시간대 데이터 요청
    if (now.getMinutes() < 40) {
      now.setHours(now.getHours() - 1);
    }
    
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');

    return {
      base_date: `${year}${month}${day}`,
      base_time: `${hours}30`, // 매시 30분 데이터 요청
    };
  }

  /**
   * (Private) KMA item 배열을 WeatherInfo 객체로 변환합니다.
   * ["T1H", "RN1", "SKY", "PTY"...]
   */
  private parseKMAData(items: KMAUltraShortTermItem[]): WeatherInfo {
    const data: any = {};
    items.forEach(item => {
      data[item.category] = item.obsrValue;
    });

    return {
      temp: parseFloat(data.T1H), // T1H: 기온
      sky: this.getSkyState(data.SKY), // SKY: 하늘 상태
      rainType: this.getRainType(data.PTY), // PTY: 강수 형태
      rainAmount: data.RN1, // RN1: 1시간 강수량
    };
  }

  // (Private) 코드 변환 헬퍼
  private getSkyState(code: string): string {
    switch (code) {
      case '1': return '맑음';
      case '3': return '구름많음';
      case '4': return '흐림';
      default: return '알 수 없음';
    }
  }

  // (Private) 코드 변환 헬퍼
  private getRainType(code: string): string {
    switch (code) {
      case '0': return '없음';
      case '1': return '비';
      case '2': return '비/눈';
      case '3': return '눈';
      case '5': return '빗방울';
      case '6': return '빗방울/눈날림';
      case '7': return '눈날림';
      default: return '없음';
    }
  }
}

// 싱글톤 인스턴스를 export
export default new WeatherService();