export interface ItineraryRequest {
    region: string;
    days: number;
    categories: string[];
    transportation: string;
    mustInclude?: string;
}

export interface ItinerarySegment {
    time: string;
    place_name: string;
    description: string;
}

export interface ItineraryDay {
    day: number;
    segments: ItinerarySegment[];
}

export interface ItineraryResponse {
    response_type: string;
    message: string;
    itinerary: {
        title: string;
        summary: string;
        days: ItineraryDay[];
        highlights: string[];
    };
}
