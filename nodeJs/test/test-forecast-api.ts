/**
 * 기상청 단기예보 API 테스트
 * 
 * 실행: npx ts-node test/test-forecast-api.ts
 */

import 'dotenv/config';
import axios from 'axios';
import { GeoConverter } from '../src/utils/GeoConverter';

const API_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

if (!SERVICE_KEY) {
  console.error('❌ PUBLIC_DATA_KEY가 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// 테스트 좌표 (서울 시청)
const TEST_LAT = 37.5665;
const TEST_LON = 126.9780;

async function testForecastAPI() {
  console.log('\n===========================================');
  console.log('📅 기상청 단기예보 API 테스트');
  console.log('===========================================\n');

  try {
    // 1. 좌표를 격자로 변환
    const { x, y } = GeoConverter.convertToXY(TEST_LAT, TEST_LON);
    console.log(`✓ 좌표 변환: (${TEST_LAT}, ${TEST_LON}) → 격자 (${x}, ${y})`);

    // 2. 발표시각 계산 (02, 05, 08, 11, 14, 17, 20, 23시)
    const now = new Date();
    now.setMinutes(now.getMinutes() - 10);
    
    const hours = now.getHours();
    const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let baseHour = availableTimes[availableTimes.length - 1];
    
    for (let i = availableTimes.length - 1; i >= 0; i--) {
      if (hours >= availableTimes[i]) {
        baseHour = availableTimes[i];
        break;
      }
    }
    
    if (hours < 2) {
      now.setDate(now.getDate() - 1);
      baseHour = 23;
    }
    
    const base_date = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const base_time = `${baseHour.toString().padStart(2, '0')}00`;

    console.log(`✓ 발표시각: ${base_date} ${base_time}`);

    // 3. API 호출
    console.log(`\n📡 API 요청 중...`);
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        dataType: 'JSON',
        numOfRows: 100,
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

    // 5. 받은 카테고리 확인
    const categories = new Set<string>();
    items.forEach((item: any) => {
      categories.add(item.category);
    });
    console.log('📋 받은 항목 코드:', Array.from(categories).sort().join(', '));
    console.log('');

    // 6. 시간대별로 그룹화
    const forecastMap = new Map();
    
    items.forEach((item: any) => {
      const key = `${item.fcstDate}${item.fcstTime}`;
      if (!forecastMap.has(key)) {
        forecastMap.set(key, { date: item.fcstDate, time: item.fcstTime });
      }
      
      const entry = forecastMap.get(key);
      switch (item.category) {
        case 'TMP': entry.temp = item.fcstValue; break;
        case 'POP': entry.pop = item.fcstValue; break;
        case 'SKY': entry.sky = item.fcstValue; break;
        case 'PTY': entry.pty = item.fcstValue; break;
      }
    });

    // 7. 처음 5개 예보 출력
    console.log('📊 단기예보 (처음 5개):');
    console.log('-------------------------------------------');
    
    const skyMap: any = { '1': '맑음', '3': '구름많음', '4': '흐림' };
    const ptyMap: any = { '0': '강수없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };
    
    let count = 0;
    for (const [key, value] of forecastMap.entries()) {
      if (count >= 5) break;
      
      const v: any = value;
      const date = `${v.date.slice(4, 6)}/${v.date.slice(6, 8)}`;
      const time = `${v.time.slice(0, 2)}:${v.time.slice(2, 4)}`;
      const precipitation = ptyMap[v.pty] || v.pty;
      
      console.log(`   ${date} ${time} - 기온: ${v.temp}°C, 하늘: ${skyMap[v.sky] || v.sky}, 강수확률: ${v.pop}%, 강수형태: ${precipitation}`);
      count++;
    }

    console.log('\n✅ 기상청 단기예보 API 테스트 성공!\n');

  } catch (error) {
    console.error('\n❌ API 테스트 실패:', error);
    if (axios.isAxiosError(error)) {
      console.error('   상태 코드:', error.response?.status);
      console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    }
  }
}

testForecastAPI();
