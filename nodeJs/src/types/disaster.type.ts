export interface disasterRequest {
    area?: string;
    disasterType?: string;
    severityLevel?: string;
}

export interface disasterResponse {
    id: string;
    area: string;
    disasterType: string;
    severityLevel: string;
    reportedAt: Date;
    message: string;
}