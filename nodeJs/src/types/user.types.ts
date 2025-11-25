// User 관련 타입 정의

export interface User {
    uuid: string;
    email: string;
    password?: string; // LINE 로그인 사용자는 password가 없을 수 있음
    provider?: string; // 'email' | 'line'
    line_id?: string; // LINE 사용자 ID
    created_at?: Date;
    updated_at?: Date;
}

export interface UserRegistrationRequest {
    email: string;
    password: string;
}

export interface UserLoginRequest {
    email: string;
    password: string;
}

export interface UserLoginResponse {
    message: string;
    token: string;
}

export interface UserRegistrationResponse {
    message: string;
    uuid: string;
}

// LINE 관련 타입
export interface LineTokenResponse {
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
}

export interface LineProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}
