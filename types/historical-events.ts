export interface Score {
  name: string;
  score: string;
}

export interface HistoricalEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed: boolean;
  scores: Score[] | null;
  isUpcoming: boolean;
}

export interface GroupedEvents {
  [date: string]: HistoricalEvent[];
}

export interface ApiResponse {
  scores?: GroupedEvents;
  events?: GroupedEvents;
}
