interface TeamLogo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

interface TeamLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface Team {
  id: string;
  uid: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  isActive: boolean;
  logos: TeamLogo[];
  links: TeamLink[];
}

interface Stat {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  abbreviation: string;
  type: string;
  value: number | string;
  displayValue: string;
  id?: string;
  summary?: string;
}

interface StandingsLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface StandingsEntry {
  team: Team;
  stats: Stat[];
}

interface StandingsGroup {
  id: string;
  name: string;
  displayName: string;
  links: StandingsLink[];
  season: number;
  seasonType: number;
  seasonDisplayName: string;
  entries: StandingsEntry[];
}

interface Division {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  isConference: boolean;
  standings: StandingsGroup;
}

interface Conference {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  children?: Division[];
  isConference?: boolean;
  standings?: StandingsGroup;
}

interface LeagueStandingsResponse {
  standings: StandingsGroup;
}

interface ConferenceStandingsResponse {
  standings: Conference[];
}

interface ApiResponse {
  status: string;
  response: LeagueStandingsResponse | ConferenceStandingsResponse;
}

export type {
  ApiResponse,
  LeagueStandingsResponse,
  ConferenceStandingsResponse,
  Conference,
  Division,
  StandingsGroup,
  StandingsEntry,
  Team,
  TeamLogo,
  TeamLink,
  Stat,
  StandingsLink
};