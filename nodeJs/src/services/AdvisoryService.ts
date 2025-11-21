import axios from 'axios';
// GeoConverter에서 '지역 이름'을 가져오는 기능을 사용합니다.
import { GeoConverter } from '../utils/GeoConverter'; 
import {
  KMAAdvisoryResponse,
  KMAAdvisoryItem,
  AdvisoryInfo,
} from '../types/advisory.types';
import { KMARegionCode } from '../types/geocoding.types';

// '기상특보통보문조회' API 엔드포인트
const KMA_ADVISORY_URL =
  'https://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnMsg';

// .env 에서 공공데이터 키 가져오기
const KMA_SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

// 캐시 설정 (특보는 자주 바뀌므로 10분)
const CACHE_TTL = 10 * 60 * 1000;

class AdvisoryService {
  private cache: Map<string, { timestamp: number; data: AdvisoryInfo }> = new Map();

  /**
   * (lat, lon) 좌표 기반으로 현재 발효된 기상특보를 가져옵니다.
   */
  async getCurrentAdvisory(
    lat: number,
    lon: number
  ): Promise<AdvisoryInfo> {
    
    // [핵심 1] lat, lon -> '시/도' 이름이 포함된 지역 코드 객체 획득
    // (좌표 기반 매핑으로 변경됨)
    const regionCodes: KMARegionCode = GeoConverter.getRegionCodes(lat, lon);
    const regionName = regionCodes.name; // 예: "경기", "서울"
    
    // [핵심 2] '시/도' 이름을 기상청 'stnId'로 변환
    const stnId = this.lookupStnId(regionName);
    const cacheKey = stnId; // 캐시 키는 stnId 사용
    const now = Date.now();

    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (now - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache] HIT: Weather advisory for ${cacheKey}`);
        return entry.data;
      }
    }
    console.log(`[Cache] MISS: Fetching new weather advisory for ${cacheKey}`);

    try {
      // 최근 6일간의 특보 조회 (API 제한)
      const { fromDate, toDate } = this.getDateRange();
      
      const response = await axios.get<KMAAdvisoryResponse>(
        KMA_ADVISORY_URL,
        {
          params: {
            serviceKey: KMA_SERVICE_KEY,
            dataType: 'JSON',
            stnId: stnId, // "108" (서울) 등
            fromTmFc: fromDate, // YYYYMMDD
            toTmFc: toDate, // YYYYMMDD
            numOfRows: 100,
            pageNo: 1,
          },
        }
      );

      const items = response.data?.response?.body?.items?.item;

      // [핵심 3] API 응답을 가공하여 AdvisoryInfo로 변환
      const advisoryInfo = this.parseAdvisoryData(items);

      this.cache.set(cacheKey, {
        timestamp: now,
        data: advisoryInfo,
      });

      return advisoryInfo;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (KMA Advisory): ${error.message}`);
      } else {
        console.error(`Error in getCurrentAdvisory: ${error}`);
      }
      throw new Error('기상특보 정보를 가져오는 데 실패했습니다.');
    }
  }

  /**
   * (Private) '시/도' 이름(key)을 기상청 'stnId'로 변환
   * (참고: 중기예보 regId와 특보 stnId는 코드가 다릅니다.)
   */
  private lookupStnId(regionNameKey: string): string {
    const map: { [key: string]: string } = {
      '서울': '109',
      '인천': '109',
      '경기': '109', // 서울, 인천, 경기는 '109'로 통합
      '강원': '105',
      '충북': '131',
      '충남': '131', // 대전, 세종, 충남, 충북은 '131'
      '대전': '131',
      '세종': '131',
      '전북': '146',
      '전남': '156',
      '광주': '156', // 광주, 전남은 '156'
      '경북': '143',
      '경남': '159',
      '대구': '143', // 대구, 경북은 '143'
      '부산': '159', // 부산, 울산, 경남은 '159'
      '울산': '159',
      '제주': '184',
    };
    // regionNameKey ('서울', '경기' 등)로 stnId를 찾음
    return map[regionNameKey] || '108'; // 기본값 '108' (전국)
  }

  /**
   * (Private) 최근 6일 날짜 범위 계산
   */
  private getDateRange(): { fromDate: string; toDate: string } {
    const today = new Date();
    const sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };
    
    return {
      fromDate: formatDate(sixDaysAgo),
      toDate: formatDate(today),
    };
  }

  /**
   * (Private) 특보 API 응답(item 배열)을 AdvisoryInfo로 가공
   */
  private parseAdvisoryData(items?: KMAAdvisoryItem[]): AdvisoryInfo {
    if (!items || items.length === 0) {
      return { warning: false, details: '현재 발효 중인 특보가 없습니다.' };
    }

    // 배열 변환
    const itemArray = Array.isArray(items) ? items : [items];

    // 특보(warFc=1) 상태인 것만 필터링
    const activeWarnings = itemArray.filter(item => item.warFc === '1');

    if (activeWarnings.length === 0) {
      return { warning: false, details: '현재 발효 중인 특보가 없습니다.' };
    }

    // 가장 최신 특보(tmSeq가 가장 큰)의 내용을 반환
    const latestWarning = activeWarnings.sort(
      (a, b) => parseInt(b.tmSeq) - parseInt(a.tmSeq)
    )[0];
    
    // t6 필드에 현재 발효중인 특보 현황이 들어있음
    const details = latestWarning.t6 || latestWarning.t1 || '특보 정보 없음';
    
    return {
      warning: true,
      details: details.replace(/o /g, '').trim(), // "o " 제거
    };
  }
}

// 싱글톤 인스턴스 Export
export default new AdvisoryService();