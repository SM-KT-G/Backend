import axios from "axios";
import { ExchangeRate } from "../type/exchangeRate";
import { ApiError, NotFoundError } from "../errors/custom.error";

type ApiResponse = ExchangeRate[];
const API_URL: string =
  "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";

/**
 * 통화 코드 상수
 * API에서 JPY는 100단위로 제공
 */
const CURRENCY_CODES = {
  JPY: "JPY(100)",
} as const;

class ExchangeRateService {
  /**
   * API의 모든 환율을 가져오는 메소드입니다.
   * @param searchDate - 검색할 날짜 (YYYYMMDD 형식), 미입력 시 최근 영업일 기준
   * @returns 각 환율 객체를 포함하는 배열을 반환합니다 Promise객체로.
   */
  static async getAllExchangeRates(searchDate: string = ""): Promise<ExchangeRate[]> {
    try {
      const response = await axios.get<ApiResponse>(API_URL, {
        params: {
          authkey: process.env.EXCHANGE_RATE_API_KEY,
          searchdate: searchDate, // 빈 문자열일 경우 API가 최근 영업일 기준으로 반환
          data: "AP01", // 검색요청API타입(AP01 : 환율)
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          `환율 API 호출 실패: ${error.message}`,
          error.response?.status || 502
        );
      }
      throw new ApiError("환율 정보를 가져오는 중 오류 발생");
    }
  }
  
  /**
   * 전체 환율 데이터에서 일본 엔을 가져오는 메소드입니다.
   * @param searchDate - 검색할 날짜 (YYYYMMDD 형식), 미입력 시 최근 영업일 기준
   * @returns 일본 엔에 대한 환율 객체를 반환합니다.
   */
  static async getJPYExchangeRate(searchDate: string = ""): Promise<ExchangeRate> {
    const exchangeRates = await this.getAllExchangeRates(searchDate);
    const jpyRate = exchangeRates.find(
      (rate) => rate.cur_unit === CURRENCY_CODES.JPY
    );
    if (!jpyRate) {
      throw new NotFoundError("JPY 환율 정보를 찾을 수 없습니다.");
    }
    return jpyRate;
  }
}

export default ExchangeRateService;
