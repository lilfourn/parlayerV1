export interface Score {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: TeamScore[];
  last_update: string;
}

export interface TeamScore {
  name: string;
  score: string;
}

