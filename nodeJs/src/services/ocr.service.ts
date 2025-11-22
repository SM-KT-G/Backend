import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

class OcrService {
  static async extractTextFromImage(image: Express.Multer.File): Promise<string> {
    try {
      const apiUrl = process.env.CLOVA_OCR_API_URL;
      const secretKey = process.env.CLOVA_OCR_SECRET_KEY;

      if (!apiUrl || !secretKey) {
        throw new Error('Clova OCR API URL과 Secret Key가 환경변수에 설정되어야 합니다.');
      }

      // FormData 생성
      const formData = new FormData();

      // message JSON 구성 (data 필드 없이)
      const message = {
        version: 'V2',
        requestId: uuidv4(),
        timestamp: Date.now(),
        lang: 'ko', // 한국어 텍스트 OCR 인식 (일본 관광객이 한국 메뉴판/표지판 촬영)
        images: [
          {
            format: this.getImageFormat(image.originalname),
            name: image.originalname,
          },
        ],
      };

      // FormData에 message와 file 추가
      formData.append('message', JSON.stringify(message));
      formData.append('file', image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });

      const response = await axios.post(apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'X-OCR-SECRET': secretKey,
        },
      });

      // 추출된 텍스트 조합
      if (response.data.images && response.data.images.length > 0) {
        const fields = response.data.images[0].fields;
        let extractedText = '';

        for (const field of fields) {
          extractedText += field.inferText;
          // lineBreak가 true이면 줄바꿈 추가
          if (field.lineBreak) {
            extractedText += '\n';
          } else {
            extractedText += ' ';
          }
        }
        return extractedText.trim();
      }

      throw new Error('이미지에서 텍스트를 추출할 수 없습니다.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Clova OCR API 오류: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  private static getImageFormat(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'pdf':
        return 'pdf';
      case 'tiff':
      case 'tif':
        return 'tif';
      default:
        return 'jpg';
    }
  }
}

export default OcrService;
