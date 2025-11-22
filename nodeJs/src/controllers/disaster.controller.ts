import { Request, Response } from "express";
import DisasterService from "../services/disaster.service";

class DisasterController {
  static async getAlertByRegion(req: Request, res: Response) {
    try {
      const { region } = req.body;
      if (!region) {
        return res.status(404).json({ message: "Cannot find region input" });
      }
      const alertsResponse = await DisasterService.getAlertByRegion(region);
      res.status(200).json(alertsResponse);
    } catch (error) {
      console.error("Error in getAlertByRegion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAlertByType(req: Request, res: Response) {
    try {
      const { type } = req.body;
      if (!type) {
        return res.status(404).json({ message: "Cannot find type input" });
      }
      const alertsResponse = await DisasterService.getAlertByType(type);
      res.status(200).json(alertsResponse);
    } catch (error) {
      console.error("Error in getAlertByType:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAlertBySeverity(req: Request, res: Response) {
    try {
      const { severity } = req.body;
      if (!severity) {
        return res.status(404).json({ message: "Cannot find severity input" });
      }
      const alertsResponse = await DisasterService.getAlertBySeverity(severity);

      res.status(200).json(alertsResponse);
    } catch (error) {
      console.error("Error in getAlertBySeverity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
export default DisasterController;
