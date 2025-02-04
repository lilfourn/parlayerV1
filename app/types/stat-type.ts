export interface StatValue {
  key: string;
  value: number;
}

export interface StatTypes {
  football: {
    regular: Record<keyof FootballRegularStats, StatValue>;
    alternate: Record<keyof FootballAlternateStats, StatValue>;
  };
  basketball: {
    regular: Record<keyof BasketballRegularStats, StatValue>;
    alternate: Record<keyof BasketballAlternateStats, StatValue>;
  };
  baseball: {
    regular: Record<keyof BaseballRegularStats, StatValue>;
    alternate: Record<keyof BaseballAlternateStats, StatValue>;
  };
  hockey: {
    regular: Record<keyof HockeyRegularStats, StatValue>;
    alternate: Record<keyof HockeyAlternateStats, StatValue>;
  };
  afl: {
    regular: Record<keyof AFLRegularStats, StatValue>;
  };
  rugby: {
    regular: Record<keyof RugbyRegularStats, StatValue>;
  };
  soccer: {
    regular: Record<keyof SoccerRegularStats, StatValue>;
    other: Record<keyof SoccerOtherStats, StatValue>;
  };
}

interface FootballRegularStats {
  player_defensive_interceptions: string;
  player_field_goals: string;
  player_kicking_points: string;
  player_pass_attempts: string;
  player_pass_completions: string;
  player_pass_interceptions: string;
  player_pass_longest_completion: string;
  player_pass_rush_reception_tds: string;
  player_pass_rush_reception_yds: string;
  player_pass_tds: string;
  player_pass_yds: string;
  player_pass_yds_q1: string;
  player_pats: string;
  player_receptions: string;
  player_reception_longest: string;
  player_reception_tds: string;
  player_reception_yds: string;
  player_rush_attempts: string;
  player_rush_longest: string;
  player_rush_reception_tds: string;
  player_rush_reception_yds: string;
  player_rush_tds: string;
  player_rush_yds: string;
  player_sacks: string;
  player_solo_tackles: string;
  player_tackles_assists: string;
  player_tds_over: string;
  player_1st_td: string;
  player_anytime_td: string;
  player_last_td: string;
}

interface FootballAlternateStats {
  player_field_goals_alternate: string;
  player_kicking_points_alternate: string;
  player_pass_attempts_alternate: string;
  player_pass_completions_alternate: string;
  player_pass_interceptions_alternate: string;
  player_pass_longest_completion_alternate: string;
  player_pass_rush_reception_tds_alternate: string;
  player_pass_rush_reception_yds_alternate: string;
  player_pass_tds_alternate: string;
  player_pass_yds_alternate: string;
  player_pats_alternate: string;
  player_receptions_alternate: string;
  player_reception_longest_alternate: string;
  player_reception_tds_alternate: string;
  player_reception_yds_alternate: string;
  player_rush_attempts_alternate: string;
  player_rush_longest_alternate: string;
  player_rush_reception_tds_alternate: string;
  player_rush_reception_yds_alternate: string;
  player_rush_tds_alternate: string;
  player_rush_yds_alternate: string;
  player_sacks_alternate: string;
  player_solo_tackles_alternate: string;
  player_tackles_assists_alternate: string;
}

interface BasketballRegularStats {
  player_points: string;
  player_points_q1: string;
  player_rebounds: string;
  player_rebounds_q1: string;
  player_assists: string;
  player_assists_q1: string;
  player_threes: string;
  player_blocks: string;
  player_steals: string;
  player_blocks_steals: string;
  player_turnovers: string;
  player_points_rebounds_assists: string;
  player_points_rebounds: string;
  player_points_assists: string;
  player_rebounds_assists: string;
  player_field_goals: string;
  player_frees_made: string;
  player_frees_attempts: string;
  player_first_basket: string;
  player_double_double: string;
  player_triple_double: string;
  player_method_of_first_basket: string;
}

interface BasketballAlternateStats {
  player_points_alternate: string;
  player_rebounds_alternate: string;
  player_assists_alternate: string;
  player_blocks_alternate: string;
  player_steals_alternate: string;
  player_turnovers_alternate: string;
  player_threes_alternate: string;
  player_points_assists_alternate: string;
  player_points_rebounds_alternate: string;
  player_rebounds_assists_alternate: string;
  player_points_rebounds_assists_alternate: string;
}

interface BaseballRegularStats {
  batter_home_runs: string;
  batter_first_home_run: string;
  batter_hits: string;
  batter_total_bases: string;
  batter_rbis: string;
  batter_runs_scored: string;
  batter_hits_runs_rbis: string;
  batter_singles: string;
  batter_doubles: string;
  batter_triples: string;
  batter_walks: string;
  batter_strikeouts: string;
  batter_stolen_bases: string;
  pitcher_strikeouts: string;
  pitcher_record_a_win: string;
  pitcher_hits_allowed: string;
  pitcher_walks: string;
  pitcher_earned_runs: string;
  pitcher_outs: string;
}

interface BaseballAlternateStats {
  batter_total_bases_alternate: string;
  batter_home_runs_alternate: string;
  batter_hits_alternate: string;
  batter_rbis_alternate: string;
  pitcher_hits_allowed_alternate: string;
  pitcher_walks_alternate: string;
  pitcher_strikeouts_alternate: string;
}

interface HockeyRegularStats {
  player_points: string;
  player_power_play_points: string;
  player_assists: string;
  player_blocked_shots: string;
  player_shots_on_goal: string;
  player_goals: string;
  player_total_saves: string;
  player_goal_scorer_first: string;
  player_goal_scorer_last: string;
  player_goal_scorer_anytime: string;
}

interface HockeyAlternateStats {
  player_points_alternate: string;
  player_assists_alternate: string;
  player_power_play_points_alternate: string;
  player_goals_alternate: string;
  player_shots_on_goal_alternate: string;
  player_blocked_shots_alternate: string;
  player_total_saves_alternate: string;
}

interface AFLRegularStats {
  player_disposals: string;
  player_disposals_over: string;
  player_goal_scorer_first: string;
  player_goal_scorer_last: string;
  player_goal_scorer_anytime: string;
  player_goals_scored_over: string;
  player_marks_over: string;
  player_marks_most: string;
  player_tackles_over: string;
  player_tackles_most: string;
  player_afl_fantasy_points: string;
  player_afl_fantasy_points_over: string;
  player_afl_fantasy_points_most: string;
}

interface RugbyRegularStats {
  player_try_scorer_first: string;
  player_try_scorer_last: string;
  player_try_scorer_anytime: string;
  player_try_scorer_over: string;
}

interface SoccerRegularStats {
  player_goal_scorer_anytime: string;
  player_first_goal_scorer: string;
  player_last_goal_scorer: string;
  player_to_receive_card: string;
  player_to_receive_red_card: string;
  player_shots_on_target: string;
  player_shots: string;
  player_assists: string;
}

interface SoccerOtherStats {
  alternate_spreads_corners: string;
  alternate_totals_corners: string;
  alternate_spreads_cards: string;
  alternate_totals_cards: string;
  double_chance: string;
}

export type StatType = keyof FootballRegularStats | keyof FootballAlternateStats |
                         keyof BasketballRegularStats | keyof BasketballAlternateStats |
                         keyof BaseballRegularStats | keyof BaseballAlternateStats |
                         keyof HockeyRegularStats | keyof HockeyAlternateStats |
                         keyof AFLRegularStats |
                         keyof RugbyRegularStats |
                         keyof SoccerRegularStats | keyof SoccerOtherStats;