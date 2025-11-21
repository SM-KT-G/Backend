/**
 * 기상청 초단기실황 API 테스트
 * 
 * 실행: npx ts-node test/test-weather-api.ts
 */

import 'dotenv/config';
import axios from 'axios';
import { GeoConverter } from '../src/utils/GeoConverter';

const API_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY || '19883038094b9f0ea6ab463e24cde26cb6becec2e13f989b2098e9df1fa197f3';

// 테스트 좌표 (서울 시청)
const TEST_LAT = 37.5665;
const TEST_LON = 126.9780;

async function testWeatherAPI() {
  console.log('\n===========================================');
  console.log('🌡️  기상청 초단기실황 API 테스트');
  console.log('===========================================\n');

  try {
    // 1. 좌표를 격자로 변환
    const { x, y } = GeoConverter.convertToXY(TEST_LAT, TEST_LON);
    console.log(`✓ 좌표 변환: (${TEST_LAT}, ${TEST_LON}) → 격자 (${x}, ${y})`);

    // 2. 현재 시간 기준으로 base_date, base_time 계산
    const now = new Date();
    now.setMinutes(now.getMinutes() - 40);
    
    const queryTime = new Date();
    if (queryTime.getMinutes() < 40) {
      queryTime.setHours(queryTime.getHours() - 1);
    }
    
    const base_date = `${queryTime.getFullYear()}${(queryTime.getMonth() + 1).toString().padStart(2, '0')}${queryTime.getDate().toString().padStart(2, '0')}`;
    const base_time = `${queryTime.getHours().toString().padStart(2, '0')}30`;

    console.log(`✓ 발표시각: ${base_date} ${base_time}`);

    // 3. API 호출
    console.log(`\n📡 API 요청 중...`);
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        dataType: 'JSON',
        numOfRows: 10,
        pageNo: 1,
        base_date: base_date,
        base_time: base_time,
        nx: x,
        ny: y,
      },
    });

    // 4. 응답 확인
    console.log(`✓ 응답 코드: ${response.data.response.header.resultCode}`);
    console.log(`✓ 응답 메시지: ${response.data.response.header.resultMsg}`);

    const items = response.data?.response?.body?.items?.item;
    
    if (!items) {
      console.error('❌ 응답 데이터가 없습니다.');
      console.log('전체 응답:', JSON.stringify(response.data, null, 2));
      return;
    }

    console.log(`✓ 받은 데이터: ${items.length}개 항목\n`);

    // 5. 데이터 파싱
    console.log('📊 날씨 정보:');
    console.log('-------------------------------------------');
    
    const data: any = {};
    items.forEach((item: any) => {
      data[item.category] = item.obsrValue;
    });

    // 받은 항목들 확인
    console.log('   받은 항목 코드:', Object.keys(data).join(', '));
    console.log('');

    const skyMap: any = { '1': '맑음', '3': '구름많음', '4': '흐림' };
    const ptyMap: any = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' };

    if (data.T1H) console.log(`   기온(T1H): ${data.T1H}°C`);
    if (data.SKY) console.log(`   하늘상태(SKY): ${skyMap[data.SKY] || data.SKY}`);
    if (data.PTY !== undefined) console.log(`   강수형태(PTY): ${ptyMap[data.PTY] || data.PTY}`);
    if (data.RN1) console.log(`   1시간강수량(RN1): ${data.RN1}mm`);
    if (data.REH) console.log(`   습도(REH): ${data.REH}%`);
    if (data.VEC) console.log(`   풍향(VEC): ${data.VEC}°`);
    if (data.WSD) console.log(`   풍속(WSD): ${data.WSD}m/s`);

    console.log('\n✅ 기상청 초단기실황 API 테스트 성공!\n');

  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error);
    if (axios.isAxiosError(error)) {
      console.error('   상태 코드:', error.response?.status);
      console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    }
  }
}

testWeatherAPI();
