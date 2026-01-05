export interface CreateSessionDTO {
    clientId: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    notes?: string;
}

export interface SessionFilters {
    startDate?: string;
    endDate?: string;
    trainerId?: string;
    clientId?: string;
}
