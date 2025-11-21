/**
 * 기상청 기상특보 API 테스트
 * 
 * 실행: npx ts-node test/test-advisory-api.ts
 */

import 'dotenv/config';
import axios from 'axios';
import { GeoConverter } from '../src/utils/GeoConverter';

const API_URL = 'https://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnList';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

if (!SERVICE_KEY) {
  console.error('❌ PUBLIC_DATA_KEY가 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// 테스트 좌표 (서울 시청)
const TEST_LAT = 37.5665;
const TEST_LON = 126.9780;

// stnId 매핑 테이블
const STNID_MAP: { [key: string]: string } = {
  '서울': '109', '인천': '109', '경기': '109',
  '강원': '105',
  '충북': '131', '충남': '131', '대전': '131', '세종': '131',
  '전북': '146',
  '전남': '156', '광주': '156',
  '경북': '143', '대구': '143',
  '경남': '159', '부산': '159', '울산': '159',
  '제주': '184',
};

async function testAdvisoryAPI() {
  console.log('\n===========================================');
  console.log('⚠️  기상청 기상특보 API 테스트');
  console.log('===========================================\n');

  try {
    // 1. 좌표로 지역명 획득
    const regionCodes = GeoConverter.getRegionCodes(TEST_LAT, TEST_LON);
    const regionName = regionCodes.name;
    const stnId = STNID_MAP[regionName] || '108'; // 기본값: 전국
    
    console.log(`✓ 지역: ${regionName}`);
    console.log(`✓ 특보 관측소 코드(stnId): ${stnId}\n`);

    // 2. API 호출
    console.log('📡 API 요청 중...');
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        dataType: 'JSON',
        stnId: stnId,
        numOfRows: 10,
        pageNo: 1,
      },
    });

    // 3. 응답 확인
    console.log(`✓ 응답 코드: ${response.data.response.header.resultCode}`);
    console.log(`✓ 응답 메시지: ${response.data.response.header.resultMsg}`);

    const items = response.data?.response?.body?.items?.item;
    
    if (!items || items.length === 0) {
      console.log('\n📊 현재 발효 중인 기상특보가 없습니다.\n');
      console.log('✅ 기상청 기상특보 API 테스트 성공!\n');
      return;
    }

    console.log(`✓ 받은 데이터: ${items.length}개 항목\n`);

    // 4. 받은 항목 확인 (첫 번째 항목의 키)
    if (items.length > 0) {
      console.log('📋 받은 항목 필드:', Object.keys(items[0]).join(', '));
      console.log('');
    }

    // 5. 발표 중인 특보 필터링 (warC=1)
    const activeWarnings = items.filter((item: any) => item.warC === '1');

    console.log('📊 기상특보 현황:');
    console.log('-------------------------------------------');

    if (activeWarnings.length === 0) {
      console.log('   현재 발효 중인 특보가 없습니다.');
    } else {
      // 최신 특보부터 출력
      activeWarnings
        .sort((a: any, b: any) => b.tmSeq - a.tmSeq)
        .forEach((item: any, index: number) => {
          console.log(`\n   [특보 ${index + 1}]`);
          console.log(`   발표번호: ${item.tmSeq}`);
          console.log(`   내용: ${item.warCpy.substring(0, 100)}...`);
        });
    }

    console.log('\n✅ 기상청 기상특보 API 테스트 성공!\n');

  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error);
    if (axios.isAxiosError(error)) {
      console.error('   상태 코드:', error.response?.status);
      console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    }
  }
}

testAdvisoryAPI();
