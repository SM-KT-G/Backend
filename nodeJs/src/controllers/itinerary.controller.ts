import itineraryService from '../services/itinerary.service';
import { Request, Response } from 'express';

class ItineraryController {
    static async generateItinerary(req: Request, res: Response) {
        try {
            const { region, days, categories, transportation, mustInclude } = req.body;

            // 필수 필드 검증
            if (!region) {
                return res.status(400).json({
                    error: 'INVALID_REQUEST',
                    message: '지역을 선택해주세요.'
                });
            }

            if (!days || days < 1 || days > 7) {
                return res.status(400).json({
                    error: 'INVALID_REQUEST',
                    message: '여행 일정은 1일에서 7일 사이여야 합니다.'
                });
            }

            if (!categories || !Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({
                    error: 'INVALID_REQUEST',
                    message: '최소 하나 이상의 카테고리를 선택해주세요.'
                });
            }

            if (!transportation || !['public', 'car', 'both'].includes(transportation)) {
                return res.status(400).json({
                    error: 'INVALID_REQUEST',
                    message: '유효한 이동 수단을 선택해주세요.'
                });
            }

            // 서비스 레이어 호출
            const itinerary = await itineraryService.generateItinerary({
                region,
                days,
                categories,
                transportation,
                mustInclude
            });

            return res.status(200).json(itinerary);

        } catch (error) {
            console.error('Generate itinerary error:', error);
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: '여행 계획 생성 중 오류가 발생했습니다.'
            });
        }
    }
}

export default ItineraryController;