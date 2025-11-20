import { Request, Response } from "express";
import ExchangeRateService from "../services/exchangeRate.service";
import { ApiError, NotFoundError } from "../errors/custom.error";

class ExchangeRateController {
  /**
   * 모든 환율 정보를 가져오는 컨트롤러 메소드입니다.
   * @param req Express 요청 객체
   * @param res Express 응답 객체
   */
  static getExchangeRates = async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const rates = await ExchangeRateService.getAllExchangeRates(date as string);

      res.status(200).json({
        data: rates
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`[${error.name}] ${error.message}`);
        res.status(error.statusCode).json({
          status: error.status,
          message: "외부 환율 API 호출에 실패했습니다.",
        });
      } else {
        console.error(`[Unexpected Error]`, error);
        res.status(500).json({
          status: "error",
          message: "환율 정보를 가져오는 데 실패했습니다.",
        });
      }
    }
  };
  /**
   * 일본 엔 환율 정보를 가져오는 컨트롤러 메소드입니다.
   * @param req Express 요청 객체
   * @param res Express 응답 객체
   * @returns 일본 엔 환율 정보
   */
  static getJPYExchangeRate = async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const jpyRate = await ExchangeRateService.getJPYExchangeRate(date as string);

      res.status(200).json({
        data: jpyRate,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.error(`[${error.name}] ${error.message}`);
        res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      } else if (error instanceof ApiError) {
        console.error(`[${error.name}] ${error.message}`);
        res.status(error.statusCode).json({
          status: error.status,
          message: "외부 환율 API 호출에 실패했습니다.",
        });
      } else {
        console.error(`[Unexpected Error]`, error);
        res.status(500).json({
          status: "error",
          message: "JPY 환율 정보를 가져오는 데 실패했습니다.",
        });
      }
    }
  };
}

export default ExchangeRateController;
