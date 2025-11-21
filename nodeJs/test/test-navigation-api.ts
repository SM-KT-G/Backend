/**
 * 네이버 길찾기 API 테스트
 * 
 * 실행: npx ts-node test/test-navigation-api.ts
 */

import 'dotenv/config';
import axios from 'axios';

const API_URL = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving';
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error('❌ NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// 테스트 좌표
const ORIGIN = { lat: 37.5665, lon: 126.9780 };      // 서울 시청
const DESTINATION = { lat: 37.5124, lon: 127.1054 }; // 잠실 롯데월드타워

async function testNavigationAPI() {
  console.log('\n===========================================');
  console.log('🗺️  네이버 길찾기 API 테스트');
  console.log('===========================================\n');

  try {
    console.log(`✓ 출발지: (${ORIGIN.lat}, ${ORIGIN.lon})`);
    console.log(`✓ 도착지: (${DESTINATION.lat}, ${DESTINATION.lon})\n`);

    // API 호출
    console.log('📡 API 요청 중...');
    console.log('   URL:', API_URL);
    console.log('   Client ID:', NAVER_CLIENT_ID);
    console.log('   Secret:', NAVER_CLIENT_SECRET?.substring(0, 10) + '...');
    
    const response = await axios.get(API_URL, {
      params: {
        start: `${ORIGIN.lon},${ORIGIN.lat}`,
        goal: `${DESTINATION.lon},${DESTINATION.lat}`,
      },
      headers: {
        'x-ncp-apigw-api-key-id': NAVER_CLIENT_ID,
        'x-ncp-apigw-api-key': NAVER_CLIENT_SECRET,
      },
    });

    const { data } = response;

    // 응답 확인
    if (data.code !== 0) {
      console.error(`❌ API 오류 코드: ${data.code}`);
      console.error(`   메시지: ${data.message}`);
      return;
    }

    console.log(`✓ 응답 코드: ${data.code}`);
    console.log(`✓ 응답 메시지: ${data.message}\n`);

    // 경로 정보 확인
    if (!data.route || !data.route.traavoid || data.route.traavoid.length === 0) {
      console.error('❌ 경로 정보를 찾을 수 없습니다.');
      console.log('전체 응답:', JSON.stringify(data, null, 2));
      return;
    }

    const routeSummary = data.route.traavoid[0].summary;

    console.log('📊 경로 정보:');
    console.log('-------------------------------------------');
    console.log(`   총 거리: ${(routeSummary.distance / 1000).toFixed(2)}km (${routeSummary.distance}m)`);
    console.log(`   소요 시간: ${Math.floor(routeSummary.duration / 1000 / 60)}분 (${Math.round(routeSummary.duration / 1000)}초)`);
    
    if (routeSummary.tollFare !== undefined) {
      console.log(`   통행료: ${routeSummary.tollFare}원`);
    }
    if (routeSummary.taxiFare !== undefined) {
      console.log(`   택시 요금: ${routeSummary.taxiFare}원`);
    }
    if (routeSummary.fuelPrice !== undefined) {
      console.log(`   유류비: ${routeSummary.fuelPrice}원`);
    }

    console.log('\n✅ 네이버 길찾기 API 테스트 성공!\n');

  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('\n⚠️  API 인증 실패 (401 Unauthorized)');
      console.error('   오류 응답:', JSON.stringify(error.response?.data, null, 2));
      console.log('   네이버 클라우드 플랫폼에서 Directions 5 API 구독이 필요합니다.');
      console.log('   https://www.ncloud.com/product/applicationService/maps\n');
      console.log('💡 임시로 더미 데이터로 테스트합니다...\n');
      
      // 하버사인 공식으로 직선 거리 계산
      const R = 6371; // 지구 반지름 (km)
      const dLat = (DESTINATION.lat - ORIGIN.lat) * Math.PI / 180;
      const dLon = (DESTINATION.lon - ORIGIN.lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(ORIGIN.lat * Math.PI / 180) * Math.cos(DESTINATION.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // km
      const duration = Math.round(distance / 40 * 3600); // 평균 40km/h, 초 단위
      
      console.log('📊 경로 정보 (더미 데이터):');
      console.log('-------------------------------------------');
      console.log(`   총 거리: ${distance.toFixed(2)}km (${Math.round(distance * 1000)}m)`);
      console.log(`   소요 시간: ${Math.floor(duration / 60)}분 (${duration}초)`);
      console.log(`   평균 속도: 40km/h 가정`);
      console.log('\n✅ 네이버 길찾기 API 테스트 완료 (더미 데이터)\n');
    } else {
      console.error('\n❌ API 테스트 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('   상태 코드:', error.response?.status);
        console.error('   응답 데이터:', JSON.stringify(error.response?.data, null, 2));
      }
    }
  }
}

testNavigationAPI();
