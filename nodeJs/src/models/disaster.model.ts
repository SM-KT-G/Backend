//mongodb 접속 패키지 위치
import mongoose from "mongoose";

//mongodb 접속
// (Connection is handled in config/mongodb.ts)

// mongoDB 스키마 안내
// 재난 지역 : RCPTN_RGN_NM (서울특별시, 부산광역시 등)
// 재난 재해구분 : DST_SE_NM (산불, 호우, 기타 등)
// 재난 긴급 단계 : EMRG_STEP_NM (안전안내 등)

class DisasterModel {
  private static getCollection() {
    return mongoose.connection.collection("messages");
  }

  private static async findWithFilter(filter: Record<string, unknown>) {
    const collection = this.getCollection();
    // [디버깅] 현재 접속된 DB명과 검색 조건 출력
    console.log(
      `[DEBUG] DB: ${mongoose.connection.db?.databaseName} | Collection: ${collection.collectionName}`
    );
    console.log(`[DEBUG] Filter:`, JSON.stringify(filter));

    const result = await collection
      .find(filter)
      .sort({ SN: -1 })
      .limit(10)
      .toArray();

    console.log(`[DEBUG] Found: ${result.length} docs`);
    return result;
  }

  static async getAlertByRegion(region: string) {
    try {
      const alerts = await this.findWithFilter({
        RCPTN_RGN_NM: { $regex: region, $options: "i" },
      });
      return alerts;
    } finally {
      // Connection is managed globally, do not close it here
    }
  }

  static async getAlertByType(type: string) {
    try {
      const alerts = await this.findWithFilter({
        DST_SE_NM: { $regex: type, $options: "i" },
      });
      return alerts;
    } finally {
      // Connection is managed globally, do not close it here
    }
  }

  static async getAlertBySeverity(severity: string) {
    try {
      const alerts = await this.findWithFilter({
        EMRG_STEP_NM: { $regex: severity, $options: "i" },
      });
      return alerts;
    } finally {
      // Connection is managed globally, do not close it here
    }
  }
}

export default DisasterModel;
