interface Sport {
  key: string;
  name: string;
}

export const supportedSports: Sport[] = [
  { key: "americanfootball_ncaaf", name: "College Football" },
  { key: "americanfootball_nfl", name: "NFL" },
  { key: "basketball_nba", name: "NBA" },
  { key: "basketball_ncaab", name: "College Basketball" },
  { key: "basketball_wncaab", name: "Women's College Basketball" },
  { key: "baseball_mlb_world_series_winner", name: "MLB" },
  { key: "icehockey_nhl", name: "NHL" },
  { key: "soccer_epl", name: "EPL" },
  { key: "soccer_uefa_champs_league", name: "Champions League" },
  { key: "soccer_spain_la_liga", name: "La Liga" },
  { key: "soccer_germany_bundesliga", name: "Bundesliga" },
  { key: "soccer_italy_serie_a", name: "Serie A" },
  { key: "soccer_france_ligue_one", name: "Ligue 1" },
  { key: "golf_masters_tournament_winner", name: "Masters" },
  { key: "golf_pga_championship_winner", name: "PGA Championship" },
  { key: "golf_the_open_championship_winner", name: "The Open" },
  { key: "golf_us_open_winner", name: "US Open" },
  { key: "mma_mixed_martial_arts", name: "MMA" },
  { key: "soccer_uefa_europa_league", name: "Europa League" },
  { key: "soccer_fa_cup", name: "FA Cup" },
  { key: "soccer_mexico_ligamx", name: "Liga MX" }
];

export const sportKeyToName = Object.fromEntries(
  supportedSports.map(sport => [sport.key, sport.name])
) as Record<string, string>;

export const sportNameToKey = Object.fromEntries(
  supportedSports.map(sport => [sport.name, sport.key])
) as Record<string, string>;

export type SupportedSportKey = (typeof supportedSports)[number]["key"];
export type SupportedSportName = (typeof supportedSports)[number]["name"];