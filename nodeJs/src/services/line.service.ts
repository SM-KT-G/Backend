import axios from 'axios';
import { LineTokenResponse, LineProfile } from '../types/user.types';

class LineService {
    private static readonly LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
    private static readonly LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

    /**
     * LINE 인증 코드를 액세스 토큰으로 교환
     */
    static async getAccessToken(code: string): Promise<LineTokenResponse> {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.LINE_CALLBACK_URL!,
            client_id: process.env.LINE_CHANNEL_ID!,
            client_secret: process.env.LINE_CHANNEL_SECRET!
        });

        try {
            const response = await axios.post<LineTokenResponse>(
                this.LINE_TOKEN_URL,
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('LINE token exchange error:', error);
            throw new Error('Failed to exchange LINE authorization code');
        }
    }

    /**
     * 액세스 토큰으로 LINE 사용자 프로필 정보 가져오기
     */
    static async getProfile(accessToken: string): Promise<LineProfile> {
        try {
            const response = await axios.get<LineProfile>(
                this.LINE_PROFILE_URL,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('LINE profile fetch error:', error);
            throw new Error('Failed to fetch LINE profile');
        }
    }
}

export default LineService;
