import axios from 'axios';
// Naver Geocoding API 타입을 가져옵니다.
import {
  NaverReverseGeocodeResponse,
  KMARegionCode,
} from '../types/geocoding.types';

// Naver API 키 (NavigationService와 동일한 키를 사용)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_GEOCODE_URL =
  'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';

// --- 1. 기상청 격자 변환 (기존 코드) ---
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
// ... (SLAT1, SLAT2, OLON, OLAT, XO, YO 상수들) ...
const SLAT1 = 30.0;
const SLAT2 = 60.0;
const OLON = 126.0;
const OLAT = 38.0;
const XO = 43;
const YO = 136;

/**
 * LCC DFS 격자 변환 (위경도 -> X,Y)
 * @param lat 위도 (Number)
 * @param lon 경도 (Number)
 * @returns { x: number, y: number }
 */
function convertToXY(lat: number, lon: number): { x: number; y: number } {
  const DEGRAD = Math.PI / 180.0;
  // ... (기존 변환 로직) ...
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
}

// --- 2. 중기예보 지역 ID 변환 (새로 추가된 코드) ---

/**
 * (lat, lon) 좌표로 Naver API를 호출하여 "시/도" 이름을 얻습니다.
 * @param lat 위도
 * @param lon 경도
 * @returns "시/도" 이름 (예: "경기도", "서울특별시")
 */
async function fetchRegionName(lat: number, lon: number): Promise<string> {
  try {
    const response = await axios.get<NaverReverseGeocodeResponse>(
      NAVER_GEOCODE_URL,
      {
        params: {
          coords: `${lon},${lat}`, // Naver는 경도,위도 순서
          output: 'json',
          orders: 'admcode', // 행정동 기준
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
        },
      }
    );

    // Naver API 응답에서 "시/도" 이름 (area1.name) 추출
    const regionName = response.data?.results?.[0]?.region.area1.name;
    if (!regionName) {
      throw new Error('Naver Geocoding API에서 지역 이름을 찾을 수 없습니다.');
    }
    return regionName;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error (Naver Geocoding): ${error.message}`);
    }
    throw new Error('지역 ID 변환을 위한 주소 조회에 실패했습니다.');
  }
}

/**
 * "시/도" 이름을 기상청 '중기예보' 지역 ID(regId)로 변환합니다.
 * @param regionName "시/도" 이름 (예: "경기도")
 * @returns KMARegionCode (육상 ID, 기온 ID 포함)
 */
function lookupRegionCode(regionName: string): KMARegionCode {
  // '서울', '경기' 등 축약 이름으로 검색
  const key = Object.keys(KMA_REGION_CODES).find(k => regionName.includes(k));
  const codes = key ? KMA_REGION_CODES[key] : KMA_REGION_CODES['서울']; // 기본값=서울

  if (!key) {
    console.warn(`'${regionName}'에 대한 중기예보 지역 ID를 찾지 못해 '서울'로 대체합니다.`);
  }

  return {
    name: key || '서울',
    ...codes,
  };
}

/**
 * [핵심 함수] (lat, lon)을 받아 중기예보 API에 필요한 지역 ID 객체를 반환합니다.
 */
async function getRegionCodes(
  lat: number,
  lon: number
): Promise<KMARegionCode> {
  // 1. lat, lon -> "시/도" 이름 (Naver API)
  const regionName = await fetchRegionName(lat, lon);
  // 2. "시/도" 이름 -> regId (내부 테이블)
  return lookupRegionCode(regionName);
}

// --- 3. 기상청 중기예보 지역 ID 매핑 테이블 (새로 추가) ---
const KMA_REGION_CODES: { [key: string]: { regId: string; tempRegId: string } } = {
  // '서울'이 포함된 이름 (서울특별시)
  '서울': { regId: '11B00000', tempRegId: '11B10101' },
  // '인천'
  '인천': { regId: '11B00000', tempRegId: '11B20201' },
  // '경기'
  '경기': { regId: '11B00000', tempRegId: '11B20601' }, // 경기(수원) 기준
  // '강원'
  '강원': { regId: '11D10000', tempRegId: '11D10301' }, // 강원(춘천) 기준
  // '충청북도'
  '충북': { regId: '11C20000', tempRegId: '11C20401' },
  // '충청남도'
  '충남': { regId: '11C20000', tempRegId: '11C20101' },
  // '대전'
  '대전': { regId: '11C20000', tempRegId: '11C20301' },
  // '세종'
  '세종': { regId: '11C20000', tempRegId: '11C20301' }, // 대전/세종
  // '전라북도'
  '전북': { regId: '11F10000', tempRegId: '11F10201' },
  // '전라남도'
  '전남': { regId: '11F20000', tempRegId: '11F20501' },
  // '광주'
  '광주': { regId: '11F20000', tempRegId: '11F20401' },
  // '경상북도'
  '경북': { regId: '11H10000', tempRegId: '11H10701' },
  // '경상남도'
  '경남': { regId: '11H20000', tempRegId: '11H20301' },
  // '대구'
  '대구': { regId: '11H10000', tempRegId: '11H10701' }, // 대구/경북
  // '부산'
  '부산': { regId: '11H20000', tempRegId: '11H20201' },
  // '울산'
  '울산': { regId: '11H20000', tempRegId: '11H20101' },
  // '제주'
  '제주': { regId: '11G00000', tempRegId: '11G00201' },
};

// --- 4. 최종 Export (새로 추가된 함수 포함) ---
export const GeoConverter = {
  convertToXY,
  getRegionCodes, // [추가] lat, lon -> regId 변환 함수
};