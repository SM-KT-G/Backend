import DisasterModel from "../models/disaster.model";

class DisasterService {
  static async getAlertByRegion(region: string) {
    const alerts = await DisasterModel.getAlertByRegion(region);
    return alerts;
  }

  static async getAlertByType(type: string) {
    const alerts = await DisasterModel.getAlertByType(type);
    return alerts;
  }

  static async getAlertBySeverity(severity: string) {
    const alerts = await DisasterModel.getAlertBySeverity(severity);
    return alerts;
  }
}

export default DisasterService;
