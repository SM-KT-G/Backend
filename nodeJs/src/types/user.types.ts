// User 관련 타입 정의

export interface User {
    uuid: string;
    email: string;
    password: string;
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
