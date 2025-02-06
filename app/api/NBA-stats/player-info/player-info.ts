interface Player {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayWeight: string;
  displayHeight: string;
  age: number;
  salary: number;
  image: string;
}

interface PlayerListResponse {
  PlayerList: Player[];
}

interface ApiResponse {
  status: string;
  response: PlayerListResponse;
}

interface PlayerLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface CollegeAthlete {
  id: string;
}

interface PlayerHeadshot {
  href: string;
  alt: string;
}

interface Position {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  leaf: boolean;
  slug: string;
}

interface TeamLogo {
  href: string;
  width: number;
  height: number;
  rel: string[];
}

interface PlayerTeam {
  id: string;
  uid: string;
  guid: string;
  slug: string;
  displayName: string;
  logos: TeamLogo[];
}

interface PlayerStatus {
  id: string;
  name: string;
  type: string;
  abbreviation: string;
}

interface DetailedPlayer {
  id: string;
  uid: string;
  guid: string;
  type: string;
  firstName: string;
  lastName: string;
  displayName: string;
  fullName: string;
  jersey: string;
  links: PlayerLink[];
  collegeAthlete: CollegeAthlete;
  headshot: PlayerHeadshot;
  position: Position;
  team: PlayerTeam;
  active: boolean;
  status: PlayerStatus;
  displayBirthPlace: string;
  displayHeight: string;
  displayWeight: string;
  displayDOB: string;
  age: number;
  displayJersey: string;
  displayExperience: string;
  displayDraft: string;
}

interface DetailedPlayerResponse {
  athlete: DetailedPlayer;
}

interface DetailedApiResponse {
  status: string;
  response: DetailedPlayerResponse;
}

interface PlayerImageUrl {
  href: string;
  alt: string;
}

interface PlayerImageResponse {
  url: PlayerImageUrl;
}

interface ImageApiResponse {
  status: string;
  response: PlayerImageResponse;
}

interface PlayerStatusResponse {
  status: PlayerStatus;
}

interface StatusApiResponse {
  status: string;
  response: PlayerStatusResponse;
}

interface PlayerTeamResponse {
  team: PlayerTeam;
}

interface TeamApiResponse {
  status: string;
  response: PlayerTeamResponse;
}

interface FilterOption {
  value: string;
  displayValue: string;
  shortDisplayName?: string;
}

interface GameLogFilter {
  displayName: string;
  name: string;
  value: string;
  options: FilterOption[];
}

interface GameLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface GameTeam {
  id: string;
  uid: string;
  abbreviation: string;
  displayName: string;
  links: GameLink[];
  logo: string;
  isAllStar?: boolean;
}

interface GameEvent {
  id: string;
  links: GameLink[];
  atVs: string;
  gameDate: string;
  score: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamScore: string;
  awayTeamScore: string;
  gameResult: string;
  opponent: GameTeam;
  leagueName: string;
  leagueAbbreviation: string;
  leagueShortName: string;
  eventNote?: string;
  team: GameTeam;
}

interface GameLog {
  filters: GameLogFilter[];
  labels: string[];
  names: string[];
  displayNames: string[];
  events: { [key: string]: GameEvent };
}

interface GameLogResponse {
  gamelog: GameLog;
}

interface GameLogApiResponse {
  status: string;
  response: GameLogResponse;
}

interface Split {
  displayName: string;
  stats: string[];
  abbreviation: string;
}

interface SplitCategory {
  name: string;
  displayName: string;
  splits: Split[];
}

interface PlayerSplits {
  filters: GameLogFilter[];
  displayName: string;
  labels: string[];
  names: string[];
  displayNames: string[];
  descriptions: string[];
  splitCategories: SplitCategory[];
}

interface PlayerSplitsResponse {
  splits: PlayerSplits;
}

interface SplitsApiResponse {
  status: string;
  response: PlayerSplitsResponse;
}

export type {
  Player,
  PlayerListResponse,
  ApiResponse,
  PlayerLink,
  CollegeAthlete,
  PlayerHeadshot,
  Position,
  TeamLogo,
  PlayerTeam,
  PlayerStatus,
  DetailedPlayer,
  DetailedPlayerResponse,
  DetailedApiResponse,
  PlayerImageUrl,
  PlayerImageResponse,
  ImageApiResponse,
  PlayerStatusResponse,
  StatusApiResponse,
  PlayerTeamResponse,
  TeamApiResponse,
  FilterOption,
  GameLogFilter,
  GameLink,
  GameTeam,
  GameEvent,
  GameLog,
  GameLogResponse,
  GameLogApiResponse,
  Split,
  SplitCategory,
  PlayerSplits,
  PlayerSplitsResponse,
  SplitsApiResponse
};