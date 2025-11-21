/**
 * '기상특보통보문조회' API 원본 응답 래퍼
 */
export interface KMAAdvisoryResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: KMAAdvisoryItem[];
      };
      totalCount: number;
    };
  };
}

/**
 * '기상특보통보문조회' API의 개별 아이템
 */
export interface KMAAdvisoryItem {
  stnId: string; // "108" (서울)
  other: string; // 기타사항
  t1: string; // 제목 (발표/해제 정보)
  t2: string; // 발표/해제 대상 지역
  t3: string; // 발표/해제 시각
  t4?: string; // 예비특보 또는 해제예고
  t5: string; // 발표/해제 시각 (YYYYMMDDHHmm)
  t6: string; // 현재 발효중인 특보 현황
  t7: string; // 예비특보
  tmFc: string; // 통보문 발표 시각 (YYYYMMDDHHmm)
  tmSeq: string; // 통보문 일련번호
  warFc: string; // 특보 구분 (1: 특보, 0: 예비특보)
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 '기상특보' 정보
 */
export interface AdvisoryInfo {
  warning: boolean; // 현재 특보가 발효 중인지
  details: string; // 특보 상세 내용
}