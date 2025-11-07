import { Request, Response } from "express";
import ExchangeRateService from "../services/exchangeRate.service";

class ExchangeRateController {
  /**
   * 모든 환율 정보를 가져오는 컨트롤러 메소드입니다.
   * @param req Express 요청 객체
   * @param res Express 응답 객체
   */
  static getExchangeRates = async (req: Request, res: Response) => {
    try {
      const rates = await ExchangeRateService.getAllExchangeRates();
      if (!rates || rates.length === 0) {
        res.status(404).json({
          error: "환율 정보가 없습니다.",
          message: "조회된 환율 정보가 없습니다.",
        });
        return;
      }
      res.status(200).json(rates);
    } catch (error) {
      res.status(500).json({ error: "환율 정보를 가져오는 데 실패했습니다." });
      return;
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
      const jpyRate = await ExchangeRateService.getJPYExchangeRate();
      if (!jpyRate) {
        res.status(404).json({
          error: "환율 정보가 없습니다.",
          message: "조회된 JPY 환율 정보가 없습니다.",
        });
        return;
      }
      res.status(200).json(jpyRate);
    } catch (error) {
      res.status(500).json({ error: "환율 정보를 가져오는 데 실패했습니다." });
      return;
    }
  };
}

export default ExchangeRateController;
