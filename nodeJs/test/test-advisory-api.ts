/**
 * 기상청 기상특보 통보문 API 테스트
 * 
 * 실행: npx ts-node test/test-advisory-api.ts
 */

import 'dotenv/config';
import axios from 'axios';

// 기상특보 통보문 조회 API
const API_URL = 'https://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnMsg';
const SERVICE_KEY = process.env.PUBLIC_DATA_KEY;

if (!SERVICE_KEY) {
  console.error('❌ PUBLIC_DATA_KEY가 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

async function testAdvisoryAPI() {
  console.log('\n===========================================');
  console.log('⚠️  기상청 기상특보 통보문 API 테스트');
  console.log('===========================================\n');

  try {
    // 오늘 날짜 기준으로 최근 6일간의 특보 조회 (API 제한)
    const now = new Date();
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    // 날짜 형식: YYYYMMDD (년월일만)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };
    
    const fromDate = formatDate(sixDaysAgo);
    const toDate = formatDate(now);
    
    console.log(`📅 조회 기간: ${fromDate} ~ ${toDate} (최근 6일)`);
    console.log('📍 지점: 108 (서울)');
    console.log('📡 API 요청 중...\n');
    
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: SERVICE_KEY,
        pageNo: 1,
        numOfRows: 100,
        dataType: 'JSON',
        stnId: '108', // 서울 지점 (필수)
        fromTmFc: fromDate,
        toTmFc: toDate,
      },
    });

    // 응답 확인
    const header = response.data.response.header;
    console.log(`✅ 응답 성공!`);
    console.log(`응답 코드: ${header.resultCode}`);
    console.log(`응답 메시지: ${header.resultMsg}\n`);

    const items = response.data?.response?.body?.items?.item;
    
    if (!items || items.length === 0) {
      console.log('📊 조회 기간 내 발령된 기상특보가 없습니다.');
      console.log('✅ API 호출은 성공했으나 현재 특보 없음\n');
      return;
    }

    // 배열로 변환
    const itemArray = Array.isArray(items) ? items : [items];
    console.log(`✓ 받은 데이터: ${itemArray.length}개 특보 통보문\n`);

    // 받은 항목 확인
    if (itemArray.length > 0) {
      console.log('📋 데이터 필드:', Object.keys(itemArray[0]).join(', '));
      console.log('\n📊 기상특보 통보문 목록:');
      console.log('===========================================');
      
      itemArray.slice(0, 5).forEach((item: any, index: number) => {
        console.log(`\n[특보 ${index + 1}]`);
        Object.entries(item).forEach(([key, value]) => {
          if (value) console.log(`  ${key}: ${value}`);
        });
      });
      
      if (itemArray.length > 5) {
        console.log(`\n... 외 ${itemArray.length - 5}개 특보 더 있음`);
      }
    }

    console.log('\n===========================================');
    console.log('✅ 기상청 기상특보 통보문 API 테스트 성공!\n');

  } catch (error) {
    console.error('\n❌ API 호출 실패');
    if (axios.isAxiosError(error)) {
      console.error(`상태 코드: ${error.response?.status}`);
      console.error(`에러 메시지: ${error.response?.data?.response?.header?.resultMsg || error.message}`);
      
      if (error.response?.status === 403) {
        console.error('\n💡 403 Forbidden: 공공데이터포털에서 "기상특보조회서비스" 승인 필요');
      } else if (error.response?.status === 504) {
        console.error('\n💡 504 Timeout: 서버 응답 시간 초과 (날짜 범위를 줄여보세요)');
      }
    } else {
      console.error('에러:', error);
    }
    console.log();
  }
}

testAdvisoryAPI();
