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
  stnId: string; // "108" (전국), "109" (서울/인천/경기)
  tmFc: number; // 발표시각
  tmSeq: number; // 발표번호
  warC: string; // 1:발표, 2:해제
  warCpy: string; // (내용)
  warn: string; // (내용)
}

/**
 * 서비스가 프론트엔드에 제공할 가공된 '기상특보' 정보
 */
export interface AdvisoryInfo {
  warning: boolean; // 현재 특보가 발효 중인지
  details: string; // 특보 상세 내용
}