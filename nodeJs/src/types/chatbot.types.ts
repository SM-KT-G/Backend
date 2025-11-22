export interface FastAPIResponse {
    message: string;
    places?: Array<{
        name: string;
        description: string;
        area: string;
        document_id: string;
    }>;
    chat_completion_id?: string;
}