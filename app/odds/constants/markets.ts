interface SportMarkets {
  regular: string[];
  alternate?: string[];
  other?: string[];
}

interface MarketsConfig {
  [key: string]: SportMarkets;
}

export const MARKETS_CONFIG: MarketsConfig = {
  americanfootball_nfl: {
    regular: [
      'player_defensive_interceptions', 'player_field_goals', 'player_kicking_points',
      'player_pass_attempts', 'player_pass_completions', 'player_pass_interceptions',
      'player_pass_longest_completion', 'player_pass_rush_reception_tds',
      'player_pass_rush_reception_yds', 'player_pass_tds', 'player_pass_yds',
      'player_pass_yds_q1', 'player_pats', 'player_receptions', 'player_reception_longest',
      'player_reception_tds', 'player_reception_yds', 'player_rush_attempts',
      'player_rush_longest', 'player_rush_reception_tds', 'player_rush_reception_yds',
      'player_rush_tds', 'player_rush_yds', 'player_sacks', 'player_solo_tackles',
      'player_tackles_assists', 'player_tds_over', 'player_1st_td', 'player_anytime_td',
      'player_last_td'
    ],
    alternate: [
      'player_field_goals_alternate', 'player_kicking_points_alternate',
      'player_pass_attempts_alternate', 'player_pass_completions_alternate',
      'player_pass_interceptions_alternate', 'player_pass_longest_completion_alternate',
      'player_pass_rush_reception_tds_alternate', 'player_pass_rush_reception_yds_alternate',
      'player_pass_tds_alternate', 'player_pass_yds_alternate', 'player_pats_alternate',
      'player_receptions_alternate', 'player_reception_longest_alternate',
      'player_reception_tds_alternate', 'player_reception_yds_alternate',
      'player_rush_attempts_alternate', 'player_rush_longest_alternate',
      'player_rush_reception_tds_alternate', 'player_rush_reception_yds_alternate',
      'player_rush_tds_alternate', 'player_rush_yds_alternate', 'player_sacks_alternate',
      'player_solo_tackles_alternate', 'player_tackles_assists_alternate'
    ]
  },
  basketball_nba: {
    regular: [
      'player_points', 'player_points_q1', 'player_rebounds', 'player_rebounds_q1',
      'player_assists', 'player_assists_q1', 'player_threes', 'player_blocks',
      'player_steals', 'player_blocks_steals', 'player_turnovers',
      'player_points_rebounds_assists', 'player_points_rebounds', 'player_points_assists',
      'player_rebounds_assists', 'player_field_goals', 'player_frees_made',
      'player_frees_attempts', 'player_first_basket', 'player_double_double',
      'player_triple_double', 'player_method_of_first_basket'
    ],
    alternate: [
      'player_points_alternate', 'player_rebounds_alternate', 'player_assists_alternate',
      'player_blocks_alternate', 'player_steals_alternate', 'player_turnovers_alternate',
      'player_threes_alternate', 'player_points_assists_alternate',
      'player_points_rebounds_alternate', 'player_rebounds_assists_alternate',
      'player_points_rebounds_assists_alternate'
    ]
  },
  baseball_mlb: {
    regular: [
      'batter_home_runs', 'batter_first_home_run', 'batter_hits', 'batter_total_bases',
      'batter_rbis', 'batter_runs_scored', 'batter_hits_runs_rbis', 'batter_singles',
      'batter_doubles', 'batter_triples', 'batter_walks', 'batter_strikeouts',
      'batter_stolen_bases', 'pitcher_strikeouts', 'pitcher_record_a_win',
      'pitcher_hits_allowed', 'pitcher_walks', 'pitcher_earned_runs', 'pitcher_outs'
    ],
    alternate: [
      'batter_total_bases_alternate', 'batter_home_runs_alternate', 'batter_hits_alternate',
      'batter_rbis_alternate', 'pitcher_hits_allowed_alternate', 'pitcher_walks_alternate',
      'pitcher_strikeouts_alternate'
    ]
  },
  icehockey_nhl: {
    regular: [
      'player_points', 'player_power_play_points', 'player_assists', 'player_blocked_shots',
      'player_shots_on_goal', 'player_goals', 'player_total_saves',
      'player_goal_scorer_first', 'player_goal_scorer_last', 'player_goal_scorer_anytime'
    ],
    alternate: [
      'player_points_alternate', 'player_assists_alternate',
      'player_power_play_points_alternate', 'player_goals_alternate',
      'player_shots_on_goal_alternate', 'player_blocked_shots_alternate',
      'player_total_saves_alternate'
    ]
  },
  soccer: {
    regular: [
      'player_goal_scorer_anytime', 'player_first_goal_scorer', 'player_last_goal_scorer',
      'player_to_receive_card', 'player_to_receive_red_card', 'player_shots_on_target',
      'player_shots', 'player_assists'
    ],
    other: [
      'alternate_spreads_corners', 'alternate_totals_corners', 'alternate_spreads_cards',
      'alternate_totals_cards', 'double_chance'
    ]
  }
};
