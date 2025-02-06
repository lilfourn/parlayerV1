interface Season {
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
}

interface SeasonsResponse {
  seasons: Season[];
}

interface ApiResponse {
  status: string;
  response: SeasonsResponse;
}

export type { Season, SeasonsResponse, ApiResponse };