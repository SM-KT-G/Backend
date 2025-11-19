export interface FastAPIResponse {
    response_type: 'chat' | 'search';
    message: string;
    places?: Array<{
        place_name: string;
        domain: string;
        area: string;
        description: string;
        source_id: string;
    }>;
}