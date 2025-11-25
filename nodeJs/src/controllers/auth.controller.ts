import { Request, Response } from "express";
import { dbpool } from "../config/index";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { User } from "../types/user.types";
import LineService from "../services/line.service";
import crypto from "crypto";

class AuthController {
    // 회원가입
    static async register(req: Request, res: Response) {
        const { email, password } = req.body;

        // 유효성 검사
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        // 이메일 형식 검증
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
            });
        }

        // 비밀번호 길이 검증
        if (password.length < 12) {
            return res.status(400).json({
                error: "Password must be at least 12 characters",
            });
        }
        const connection = await dbpool.getConnection();

        try {
            // 트랜잭션 시작
            await connection.beginTransaction();
            const check_email: User[] = await connection.query(
                "SELECT * FROM USERS WHERE email = ?",
                [email]
            )
            if (check_email.length > 0) { // length가 0이상이면 중복 email 존재
                await connection.rollback(); // 중복 이메일이 있을 경우 롤백
                return res.status(400).json({
                    error: "Email already exists",
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
            const userUuid = uuidv4(); // UUID 생성
            await connection.query(
                "INSERT INTO USERS (uuid, email, password) VALUES (?, ?, ?)",
                [userUuid, email, hashedPassword]
            );
            await connection.commit();
            return res.status(201).json({
                message: "User registered successfully",
                uuid: userUuid // 회원가입 성공 시 UUID 반환(프론트에서 사용할 수도 있음)
            });
        } catch (error) {
            console.error("Register error:", error);
            await connection.rollback();
            return res.status(500).json({
                error: "Internal server error",
            });
        } finally {
            connection.release();
        }
    }
    // 로그인
    static async login(req: Request, res: Response) {
        const { email, password } = req.body;
        // email과 password가 존재하는지 확인
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }
        try {
            const rows: User[] = await dbpool.query(
                "SELECT * FROM USERS WHERE email = ?",
                [email]
            )
            if (rows.length === 0) {
                return res.status(400).json({
                    error: "Invalid email or password",
                });
            }
            const user: User = rows[0];

            // LINE 로그인 사용자는 password가 없으므로 이메일/비밀번호 로그인 불가
            if (!user.password) {
                return res.status(400).json({
                    error: "Invalid email or password",
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({
                    error: "Invalid email or password",
                });
            }
            const token = jwt.sign(
                { uuid: user.uuid },
                process.env.JWT_SECRET!,
                { expiresIn: "1h"}
            );

            return res.status(200).json({
                message: "Login successful",
                token: token
            });
        } catch (error) {
            return res.status(500).json({
                error: "Internal server error",
            });
        }
    }

    // LINE 로그인 시작
    static async lineLogin(req: Request, res: Response) {
        try {
            const state = crypto.randomBytes(16).toString('hex');
            const lineAuthUrl = 'https://access.line.me/oauth2/v2.1/authorize';
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: process.env.LINE_CHANNEL_ID!,
                redirect_uri: process.env.LINE_CALLBACK_URL!,
                state: state,
                scope: 'profile openid email'
            });

            // 프로덕션에서는 state를 세션이나 Redis에 저장해야 함
            const redirectUrl = `${lineAuthUrl}?${params.toString()}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('LINE login error:', error);
            return res.status(500).json({
                error: "Failed to initiate LINE login"
            });
        }
    }

    // LINE 로그인 콜백
    static async lineCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({
                error: "Authorization code is required"
            });
        }

        const connection = await dbpool.getConnection();

        try {
            // 1. 인증 코드를 액세스 토큰으로 교환
            const tokenData = await LineService.getAccessToken(code as string);

            // 2. 액세스 토큰으로 사용자 프로필 가져오기
            const profile = await LineService.getProfile(tokenData.access_token);

            await connection.beginTransaction();

            // 3. 데이터베이스에서 LINE 사용자 찾기
            const existingUsers: User[] = await connection.query(
                "SELECT * FROM USERS WHERE line_id = ?",
                [profile.userId]
            );

            let user: User;

            if (existingUsers.length > 0) {
                // 기존 사용자
                user = existingUsers[0];
            } else {
                // 새 사용자 생성
                const userUuid = uuidv4();
                const email = `line_${profile.userId}@line.user`; // LINE은 이메일을 제공하지 않을 수 있음

                await connection.query(
                    "INSERT INTO USERS (uuid, email, line_id, provider) VALUES (?, ?, ?, ?)",
                    [userUuid, email, profile.userId, 'line']
                );

                user = {
                    uuid: userUuid,
                    email: email,
                    line_id: profile.userId,
                    provider: 'line'
                };
            }

            await connection.commit();

            // 4. JWT 토큰 생성
            const token = jwt.sign(
                { uuid: user.uuid },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );

            // 5. 프론트엔드로 리다이렉트 (토큰 전달)
            // 프로덕션에서는 프론트엔드 URL로 변경 필요
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);

        } catch (error) {
            console.error('LINE callback error:', error);
            await connection.rollback();
            return res.status(500).json({
                error: "LINE login failed"
            });
        } finally {
            connection.release();
        }
    }
}

export default AuthController;