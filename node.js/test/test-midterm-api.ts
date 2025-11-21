/**
 * 기상청 중기예보 API 테스트 (날씨 + 기온)
 * 
 * 실행: npx ts-node test/test-midterm-api.ts
 */

import 'dotenv/config';
import axios from 'axios';
import { GeoConverter } from '../src/utils/GeoConverter';

const LAND_API_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst';
const TEMP_API_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY || '19883038094b9f0ea6ab463e24cde26cb6becec2e13f989b2098e9df1fa197f3';

// 테스트 좌표 (서울 시청)
const TEST_LAT = 37.5665;
const TEST_LON = 126.9780;

async function testMidTermAPI() {
  console.log('\n===========================================');
  console.log('📆 기상청 중기예보 API 테스트');
  console.log('===========================================\n');

  try {
    // 1. 좌표로 지역 코드 획득
    const regionCodes = GeoConverter.getRegionCodes(TEST_LAT, TEST_LON);
    console.log(`✓ 지역: ${regionCodes.name}`);
    console.log(`✓ 육상예보 코드: ${regionCodes.regId}`);
    console.log(`✓ 기온예보 코드: ${regionCodes.tempRegId}`);

    // 2. 발표시각 계산 (06시, 18시)
    const now = new Date();
    const hours = now.getHours();
    
    let baseTime = '0600';
    if (hours < 6) {
      now.setDate(now.getDate() - 1);
      baseTime = '1800';
    } else if (hours >= 18) {
      baseTime = '1800';
    }
    
    const tmFc = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${baseTime}`;
    
    console.log(`✓ 발표시각: ${tmFc}\n`);

    // 3. 중기육상예보 API 호출
    console.log('📡 중기육상예보 API 요청 중...');
    const landResponse = await axios.get(LAND_API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        dataType: 'JSON',
        regId: regionCodes.regId,
        tmFc: tmFc,
      },
    });

    console.log(`✓ 육상예보 응답 코드: ${landResponse.data.response.header.resultCode}`);
    console.log(`✓ 육상예보 응답 메시지: ${landResponse.data.response.header.resultMsg}`);

    const landItem = landResponse.data?.response?.body?.items?.item?.[0];
    
    if (!landItem) {
      console.error('❌ 육상예보 데이터가 없습니다.');
      console.log('전체 응답:', JSON.stringify(landResponse.data, null, 2));
      return;
    }

    console.log('✓ 육상예보 항목:', Object.keys(landItem).filter(k => k.startsWith('wf')).join(', '));

    // 4. 중기기온예보 API 호출
    console.log('\n📡 중기기온예보 API 요청 중...');
    const tempResponse = await axios.get(TEMP_API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        dataType: 'JSON',
        regId: regionCodes.tempRegId,
        tmFc: tmFc,
      },
    });

    console.log(`✓ 기온예보 응답 코드: ${tempResponse.data.response.header.resultCode}`);
    console.log(`✓ 기온예보 응답 메시지: ${tempResponse.data.response.header.resultMsg}`);

    const tempItem = tempResponse.data?.response?.body?.items?.item?.[0];
    
    if (!tempItem) {
      console.error('❌ 기온예보 데이터가 없습니다.');
      console.log('전체 응답:', JSON.stringify(tempResponse.data, null, 2));
      return;
    }

    console.log('✓ 기온예보 항목:', Object.keys(tempItem).filter(k => k.startsWith('ta')).join(', '));
    console.log('');

    // 5. 예보 데이터 출력
    console.log('\n📊 중기예보 (5일 후 ~ 10일 후):');
    console.log('-------------------------------------------');
    
    // 3~7일: 오전/오후 구분
    for (let i = 3; i <= 7; i++) {
      const weatherAm = landItem[`wf${i}Am`];
      const weatherPm = landItem[`wf${i}Pm`];
      const tempMin = tempItem[`taMin${i}`];
      const tempMax = tempItem[`taMax${i}`];
      
      if (weatherAm || weatherPm) {
        const minTemp = tempMin !== undefined && tempMin !== null ? `${tempMin}°C` : '-';
        const maxTemp = tempMax !== undefined && tempMax !== null ? `${tempMax}°C` : '-';
        console.log(`   ${i}일 후 - 최저: ${minTemp}, 최고: ${maxTemp}`);
        console.log(`          오전: ${weatherAm || '-'}, 오후: ${weatherPm || '-'}`);
      }
    }
    
    // 8~10일: 하루 전체
    for (let i = 8; i <= 10; i++) {
      const weather = landItem[`wf${i}`];
      const tempMin = tempItem[`taMin${i}`];
      const tempMax = tempItem[`taMax${i}`];
      
      if (weather || tempMin !== undefined || tempMax !== undefined) {
        const minTemp = tempMin !== undefined && tempMin !== null ? `${tempMin}°C` : '-';
        const maxTemp = tempMax !== undefined && tempMax !== null ? `${tempMax}°C` : '-';
        console.log(`   ${i}일 후 - 최저: ${minTemp}, 최고: ${maxTemp}`);
        console.log(`          날씨: ${weather || '-'}`);
      }
    }

    console.log('\n✅ 기상청 중기예보 API 테스트 성공!\n');

  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error);
    if (axios.isAxiosError(error)) {
      console.error('   상태 코드:', error.response?.status);
      console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    }
  }
}

testMidTermAPI();
