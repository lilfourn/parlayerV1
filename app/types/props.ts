export interface Projection {
  type: 'projection';
  id: string;
  attributes: {
    adjusted_odds: number | null;
    board_time: string;
    custom_image: string | null;
    description: string;
    end_time: string | null;
    flash_sale_line_score: number | null;
    game_id: string;
    hr_20: boolean;
    in_game: boolean;
    is_live: boolean;
    is_promo: boolean;
    line_score: number;
    line_movement?: {
      original: number;
      current: number;
      direction: 'up' | 'down';
      difference: number;
    };
    odds_type: string;
    projection_type: string;
    rank: number;
    refundable: boolean;
    start_time: string;
    stat_display_name: string;
    stat_type: string;
    status: 'pre_game' | 'in_progress' | 'final' | string;
    tv_channel: string | null;
    updated_at: string;
  };
  relationships: {
    duration: { data: { type: string; id: string; } };
    league: { data: { type: string; id: string; } };
    new_player: { data: { type: string; id: string; } | null };
    projection_type: { data: { type: string; id: string; } };
    score: { data: null };
    stat_average: { data: { type: string; id: string; } | null };
    stat_type: { data: { type: string; id: string; } };
  };
}

export interface NewPlayer {
  type: 'new_player';
  id: string;
  attributes: {
    combo: boolean;
    display_name: string;
    image_url: string | null;
    league: string;
    league_id: number;
    market: string | null;
    name: string;
    position: string;
    team: string;
    team_name: string | null;
  };
}

export interface StatAverage {
  type: 'stat_average';
  id: string;
  attributes: {
    average: number;
    count: number;
    max_value: number;
    min_value?: number;
    last_n?: number;
    last_n_average?: number;
    trend?: 'up' | 'down' | 'stable';
    recent_games?: Array<{
      value: number;
      date: string;
      opponent?: string;
    }>;
  };
}

export type IncludedItem = NewPlayer | StatAverage;

export interface ApiResponse {
  data: Projection[];
  included: IncludedItem[];
}

export interface ProjectionWithAttributes {
  projection: Projection;
  player: NewPlayer | null;
  stats: StatAverage | null;
}

export interface ProcessedProjection {
  projection: {
    id: string;
    type: string;
    attributes: {
      is_promo: any;
      is_live: any;
      in_game: any;
      hr_20: any;
      refundable: any;
      tv_channel: any;
      description: string;
      status: string;
      line_score: number;
      start_time: string;
      stat_type: string;
      stat_display_name: string;
      game_id: string;
      updated_at: string;
      odds_type: string;
      line_movement?: {
        original: number;
        current: number;
        direction: "up" | "down";
        difference: number;
      };
    };
    relationships: {
      new_player: {
        data: {
          type: string;
          id: string;
        } | null;
      };
      stat_average: {
        data: {
          type: string;
          id: string;
        } | null;
      };
    };
  };
  player: NewPlayer | null;
  statAverage: StatAverage | null;
  percentageDiff: number;
}
