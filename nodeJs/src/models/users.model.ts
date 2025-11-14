import { dbpool } from "../config/index";

class UsersModel {
    static async getUserIdByUuid(userUuid: string): Promise<number | null> {
        const connection = await dbpool.getConnection();
        try {
            const rows = await connection.query(
                `SELECT id FROM users WHERE uuid = ?`,
                [userUuid]
            );
            if (rows.length > 0) {
                return rows[0].id;
            } else {
                return null;
            }
        } finally {
            connection.release();
        }
    }
}

export default UsersModel;