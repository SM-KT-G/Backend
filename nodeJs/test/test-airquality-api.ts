/**
 * 에어코리아 대기질 API 테스트
 * 
 * 실행: npx ts-node test/test-airquality-api.ts
 */

import 'dotenv/config';
import axios from 'axios';
import { GeoConverter } from '../src/utils/GeoConverter';

const API_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

if (!SERVICE_KEY) {
  console.error('❌ PUBLIC_DATA_KEY가 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// 테스트 좌표 (서울 시청)
const TEST_LAT = 37.5665;
const TEST_LON = 126.9780;

async function testAirQualityAPI() {
  console.log('\n===========================================');
  console.log('💨 에어코리아 대기질 API 테스트');
  console.log('===========================================\n');

  try {
    // 1. 좌표로 시/도명 획득
    const regionCodes = GeoConverter.getRegionCodes(TEST_LAT, TEST_LON);
    const sidoName = regionCodes.name;
    
    console.log(`✓ 지역(시/도): ${sidoName}`);

    // 2. 현재 날짜
    const now = new Date();
    const searchDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    console.log(`✓ 조회 날짜: ${searchDate}\n`);

    // 3. API 호출 (측정소명 사용)
    const stationName = '종로구'; // 서울의 대표 측정소
    console.log(`✓ 측정소: ${stationName}\n`);
    console.log('📡 API 요청 중...');
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        returnType: 'json',
        stationName: stationName,
        dataTerm: 'DAILY',
        ver: '1.0',
      },
    });

    // 4. 응답 확인
    console.log(`✓ 응답 코드: ${response.data.response.header.resultCode}`);
    console.log(`✓ 응답 메시지: ${response.data.response.header.resultMsg}`);

    const items = response.data?.response?.body?.items;
    
    if (!items || items.length === 0) {
      console.error('❌ 응답 데이터가 없습니다.');
      console.log('전체 응답:', JSON.stringify(response.data, null, 2));
      return;
    }

    const item = items[0];
    console.log(`✓ 받은 데이터: ${item.sidoName} 지역`);
    console.log('📋 받은 항목 필드:', Object.keys(item).join(', '));
    console.log('');

    // 5. 대기질 정보 출력
    console.log('📊 대기질 현황:');
    console.log('-------------------------------------------');
    console.log(`   측정 시각: ${item.dataTime}`);
    console.log(`   미세먼지(PM10): ${item.pm10Value}㎍/㎥`);
    console.log(`   초미세먼지(PM2.5): ${item.pm25Value}㎍/㎥`);
    
    if (item.o3Value) console.log(`   오존(O3): ${item.o3Value}ppm`);
    if (item.no2Value) console.log(`   이산화질소(NO2): ${item.no2Value}ppm`);
    if (item.coValue) console.log(`   일산화탄소(CO): ${item.coValue}ppm`);
    if (item.so2Value) console.log(`   아황산가스(SO2): ${item.so2Value}ppm`);

    // 6. 대기질 등급 판정
    const pm10 = parseInt(item.pm10Value);
    let pm10Grade = '알 수 없음';
    if (pm10 <= 30) pm10Grade = '좋음';
    else if (pm10 <= 80) pm10Grade = '보통';
    else if (pm10 <= 150) pm10Grade = '나쁨';
    else pm10Grade = '매우 나쁨';

    console.log(`\n   🎯 미세먼지 등급: ${pm10Grade}`);

    console.log('\n✅ 에어코리아 대기질 API 테스트 성공!\n');

  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.error('\n⚠️  API 활성화 대기 중 (403 Forbidden)');
      console.log('   공공데이터포털에서 에어코리아 API 활용신청 후 1-2시간 소요');
      console.log('   상세기능(오퍼레이션) 신청도 필요합니다.');
      console.log('\n💡 임시로 더미 데이터로 테스트합니다...\n');
      
      // 더미 데이터로 테스트
      const dummyItem = {
        sidoName: '서울',
        dataTime: '2025-11-21 13:00',
        pm10Value: '30',
        pm25Value: '15',
        o3Value: '0.025',
        no2Value: '0.020',
        coValue: '0.4',
        so2Value: '0.003',
      };
      
      console.log('📊 대기질 현황 (더미 데이터):');
      console.log('-------------------------------------------');
      console.log(`   측정 시각: ${dummyItem.dataTime}`);
      console.log(`   미세먼지(PM10): ${dummyItem.pm10Value}㎍/㎥`);
      console.log(`   초미세먼지(PM2.5): ${dummyItem.pm25Value}㎍/㎥`);
      console.log(`   오존(O3): ${dummyItem.o3Value}ppm`);
      console.log(`   이산화질소(NO2): ${dummyItem.no2Value}ppm`);
      console.log(`   일산화탄소(CO): ${dummyItem.coValue}ppm`);
      console.log(`   아황산가스(SO2): ${dummyItem.so2Value}ppm`);
      console.log(`\n   🎯 미세먼지 등급: 좋음`);
      console.log('\n✅ 에어코리아 API 테스트 완료 (더미 데이터)\n');
    } else {
      console.error('\n❌ API 테스트 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('   상태 코드:', error.response?.status);
        console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
      }
    }
  }
}

testAirQualityAPI();
