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
    league?: { data: { type: string; id: string; } };
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
  attributes: any;
  relationships: any;
  id(id: any): unknown;
  projection: Projection;
  player: NewPlayer | null;
  stats: StatAverage | null;
}

export interface ProcessedProjectionRelationships {
  duration: { data: { type: string; id: string; }; };
  projection_type: { data: { type: string; id: string; }; };
  score: { data: null; };
  stat_type: { data: { type: string; id: string; }; };
  new_player: { data: { type: string; id: string; } | null; };
  stat_average: { data: { type: string; id: string; } | null; };
  league?: { data: { type: string; id: string; }; };
}

export interface ProcessedProjection {
  projection: {
    id: string;
    type: 'projection';
    attributes: {
      is_promo: boolean;
      is_live: boolean;
      in_game: boolean;
      hr_20: boolean;
      refundable: boolean;
      tv_channel: string | null;
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
    relationships: ProcessedProjectionRelationships;
  };
  player: NewPlayer | null;
  statAverage: StatAverage | null;
  percentageDiff: number;
}

export const isValidProcessedProjection = (data: any): data is ProcessedProjection => {
  return (
    data?.projection?.id &&
    data?.projection?.type === 'projection' &&
    typeof data?.projection?.attributes?.line_score === 'number' &&
    typeof data?.percentageDiff === 'number' &&
    (!data.player || data.player.type === 'new_player') &&
    (!data.statAverage || data.statAverage.type === 'stat_average')
  );
}

export interface Factor {
  name: string;
  impact: number; // -1 to 1 scale
  description: string;
}

export interface PerplexityAnalysis {
  factors: Factor[];
  confidence: number; // 0 to 1 scale
  recommendation: 'over' | 'under' | 'neutral';
  risk_level: 'low' | 'medium' | 'high';
  timestamp: string;
  raw_analysis?: string;
}

export interface AnalysisResponse {
  confidence: number;
  recommendation: 'strong_over' | 'lean_over' | 'neutral' | 'lean_under' | 'strong_under';
  key_factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  summary: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface PerplexityAnalysisResponse {
  success: boolean;
  data?: PerplexityAnalysis;
  error?: string;
}

export const isValidAnalysisResponse = (data: any): data is AnalysisResponse => {
  if (!data || typeof data !== 'object') return false;

  // Check confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    return false;
  }

  // Check recommendation
  const validRecommendations = ['strong_over', 'lean_over', 'neutral', 'lean_under', 'strong_under'];
  if (!validRecommendations.includes(data.recommendation)) {
    return false;
  }

  // Check key_factors
  if (!Array.isArray(data.key_factors)) return false;
  
  const validImpacts = ['positive', 'negative', 'neutral'];
  const isValidKeyFactor = (kf: any): boolean => {
    return (
      typeof kf === 'object' &&
      typeof kf.factor === 'string' &&
      validImpacts.includes(kf.impact) &&
      typeof kf.weight === 'number' &&
      kf.weight >= 0 &&
      kf.weight <= 1
    );
  };
  
  if (!data.key_factors.every(isValidKeyFactor)) {
    return false;
  }

  // Check summary
  if (typeof data.summary !== 'string' || data.summary.trim() === '') {
    return false;
  }

  // Check risk_level
  const validRiskLevels = ['low', 'medium', 'high'];
  if (!validRiskLevels.includes(data.risk_level)) {
    return false;
  }

  return true;
};
