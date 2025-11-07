import axios from "axios";
import { ExchangeRate } from "../interface/exchangeRate";

type ApiResponse = ExchangeRate[];
const API_URL: string =
  "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON";

class ExchangeRateService {
  /**
   * API의 모든 환율을 가져오는 메소드입니다.
   * @returns 각 환율 객체를 포함하는 배열을 반환합니다 Promise객체로.
   */
  static async getAllExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const response = await axios.get<ApiResponse>(API_URL, {
        params: {
          authkey: process.env.EXCHANGE_RATE_API_KEY,
          searchdate: "", // TODO: 검색요청날짜 정하기 아직 팀원들과 정하지 않음
          data: "AP01", // 검색요청API타입(AP01 : 환율)
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error : ${error.response?.status}: ${error.message}`
        );
      } else {
        console.error(`Unexpected error: ${error}`);
      }
      throw error;
    }
  }
  /**
   * 전체 환율 데이터에서 일본 엔을 가져오는 메소드입니다.
   * @returns 일본 엔에 대한 환율 객체를 반환합니다.
   */
  static async getJPYExchangeRate(): Promise<ExchangeRate> {
    try {
      const exchangeRates = await this.getAllExchangeRates();
      const jpyRate = exchangeRates.find(
        (rate) => rate.cur_unit === "JPY(100)"
      );
      if (!jpyRate) {
        throw new Error("JPY 환율 정보를 찾을 수 없습니다.");
      }
      return jpyRate;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error : ${error.response?.status}: ${error.message}`
        );
      } else {
        console.error(`Unexpected error: ${error}`);
      }
      throw error;
    }
  }
}

export default ExchangeRateService;
