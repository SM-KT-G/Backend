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
 * (lat, lon) 좌표로 가장 가까운 "시/도"를 찾습니다 (좌표 기반 매칭)
 * Naver Geocoding API 대신 좌표 범위로 지역을 판단합니다.
 * @param lat 위도
 * @param lon 경도
 * @returns "시/도" 이름 (예: "경기", "서울")
 */
function fetchRegionName(lat: number, lon: number): string {
  // 각 시/도의 대표 좌표와 범위로 지역 판단
  // 우선순위: 더 구체적인 지역부터 체크
  
  // 서울 (37.4~37.7, 126.7~127.2)
  if (lat >= 37.4 && lat <= 37.7 && lon >= 126.7 && lon <= 127.2) {
    return '서울';
  }
  
  // 부산 (35.0~35.3, 128.9~129.2)
  if (lat >= 35.0 && lat <= 35.3 && lon >= 128.9 && lon <= 129.2) {
    return '부산';
  }
  
  // 대구 (35.7~36.0, 128.4~128.8)
  if (lat >= 35.7 && lat <= 36.0 && lon >= 128.4 && lon <= 128.8) {
    return '대구';
  }
  
  // 인천 (37.3~37.6, 126.3~126.8)
  if (lat >= 37.3 && lat <= 37.6 && lon >= 126.3 && lon <= 126.8) {
    return '인천';
  }
  
  // 광주 (35.0~35.3, 126.7~127.0)
  if (lat >= 35.0 && lat <= 35.3 && lon >= 126.7 && lon <= 127.0) {
    return '광주';
  }
  
  // 대전 (36.2~36.5, 127.3~127.5)
  if (lat >= 36.2 && lat <= 36.5 && lon >= 127.3 && lon <= 127.5) {
    return '대전';
  }
  
  // 울산 (35.4~35.7, 129.1~129.5)
  if (lat >= 35.4 && lat <= 35.7 && lon >= 129.1 && lon <= 129.5) {
    return '울산';
  }
  
  // 세종 (36.4~36.6, 127.2~127.4)
  if (lat >= 36.4 && lat <= 36.6 && lon >= 127.2 && lon <= 127.4) {
    return '세종';
  }
  
  // 제주 (33.2~33.6, 126.1~126.9)
  if (lat >= 33.2 && lat <= 33.6 && lon >= 126.1 && lon <= 126.9) {
    return '제주';
  }
  
  // 강원 (북동쪽, 위도 높음)
  if (lat >= 37.0 && lon >= 127.5) {
    return '강원';
  }
  
  // 경북 (동남쪽)
  if (lat >= 35.5 && lat <= 37.0 && lon >= 128.0) {
    return '경북';
  }
  
  // 경남 (남동쪽)
  if (lat >= 34.5 && lat < 35.5 && lon >= 127.5) {
    return '경남';
  }
  
  // 전북 (서남쪽 중간)
  if (lat >= 35.5 && lat < 36.5 && lon >= 126.5 && lon < 127.5) {
    return '전북';
  }
  
  // 전남 (남서쪽)
  if (lat >= 34.2 && lat < 35.5 && lon >= 125.0 && lon < 127.5) {
    return '전남';
  }
  
  // 충북 (중부 동쪽)
  if (lat >= 36.5 && lat < 37.5 && lon >= 127.5) {
    return '충북';
  }
  
  // 충남 (중부 서쪽)
  if (lat >= 36.0 && lat < 37.0 && lon >= 126.0 && lon < 127.5) {
    return '충남';
  }
  
  // 경기 (서울 주변, 기본값)
  if (lat >= 36.8 && lat < 38.5 && lon >= 126.5 && lon < 127.8) {
    return '경기';
  }
  
  // 기본값: 서울
  console.warn(`[GeoConverter] 좌표(${lat}, ${lon})에 해당하는 지역을 찾지 못해 '서울'로 대체합니다.`);
  return '서울';
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
function getRegionCodes(
  lat: number,
  lon: number
): KMARegionCode {
  // 1. lat, lon -> "시/도" 이름 (좌표 기반 판단)
  const regionName = fetchRegionName(lat, lon);
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