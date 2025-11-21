/**
 * NavigationService 통합 테스트
 * 
 * 실행: npx ts-node test/test-navigation-service.ts
 */

import 'dotenv/config';
import navigationService from '../src/services/NavigationService';

// 테스트 시나리오
const testCases = [
  {
    name: '서울 시청 → 잠실 롯데월드타워',
    origin: { lat: 37.5665, lon: 126.9780 },
    destination: { lat: 37.5124, lon: 127.1054 },
  },
  {
    name: '강남역 → 홍대입구역',
    origin: { lat: 37.4979, lon: 127.0276 },
    destination: { lat: 37.5563, lon: 126.9239 },
  },
  {
    name: '인천공항 → 김포공항',
    origin: { lat: 37.4602, lon: 126.4407 },
    destination: { lat: 37.5583, lon: 126.7906 },
  },
];

async function testNavigationService() {
  console.log('\n===========================================');
  console.log('🧪 NavigationService 통합 테스트');
  console.log('===========================================\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n[테스트 ${i + 1}/${testCases.length}] ${testCase.name}`);
    console.log(`   출발: (${testCase.origin.lat}, ${testCase.origin.lon})`);
    console.log(`   도착: (${testCase.destination.lat}, ${testCase.destination.lon})`);

    try {
      const startTime = Date.now();
      const result = await navigationService.getDirections(
        testCase.origin,
        testCase.destination
      );
      const elapsedTime = Date.now() - startTime;

      console.log(`   ✅ 성공 (${elapsedTime}ms)`);
      console.log(`      거리: ${(result.totalDistance / 1000).toFixed(2)}km`);
      console.log(`      시간: ${Math.floor(result.totalDuration / 60)}분 ${result.totalDuration % 60}초`);
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      failCount++;
    }
  }

  // 캐시 테스트
  console.log('\n\n[캐시 테스트] 첫 번째 경로 재요청');
  const testCase = testCases[0];
  try {
    const startTime = Date.now();
    const result = await navigationService.getDirections(
      testCase.origin,
      testCase.destination
    );
    const elapsedTime = Date.now() - startTime;

    console.log(`   ✅ 캐시 히트 확인 (${elapsedTime}ms)`);
    console.log(`      거리: ${(result.totalDistance / 1000).toFixed(2)}km`);
    console.log(`      시간: ${Math.floor(result.totalDuration / 60)}분`);
    
    if (elapsedTime < 50) {
      console.log('   🎯 캐시가 정상 작동 중입니다!');
    }
  } catch (error) {
    console.log(`   ❌ 캐시 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    failCount++;
  }

  // 결과 요약
  console.log('\n===========================================');
  console.log('📊 테스트 결과');
  console.log('===========================================');
  console.log(`   성공: ${successCount}/${testCases.length}`);
  console.log(`   실패: ${failCount}/${testCases.length}`);
  
  if (failCount === 0) {
    console.log('\n✅ 모든 테스트 통과!\n');
  } else {
    console.log('\n⚠️  일부 테스트 실패\n');
  }
}

testNavigationService();
