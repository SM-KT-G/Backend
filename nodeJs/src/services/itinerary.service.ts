import axios from 'axios';
import { ItineraryRequest, ItineraryResponse } from '../types/itinerary.type';

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;

// 미완성입니다
class ItineraryService {
    static async generateItinerary(data: ItineraryRequest): Promise<ItineraryResponse> {
        try {
            const response = await axios.post<ItineraryResponse>(
                `${FASTAPI_BASE_URL}/recommend/itinerary`,
                {
                    region: data.region,
                    themes: data.mustInclude || "", 
                    duration_days: data.days,
                    domains: data.categories,
                    transport_mode: data.transportation,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(
                        'FastAPI error response:',
                        error.response.status,
                        error.response.data
                    );
                    throw new Error(`FastAPI returned error: ${error.response.status}`);
                } else if (error.request) {
                    console.error('FastAPI no response:', error.message);
                    throw new Error('FastAPI server is not responding');
                }
            }
            console.error('Unexpected error calling FastAPI:', error);
            throw new Error('Failed to generate itinerary');
        }
    }
}

export default ItineraryService;