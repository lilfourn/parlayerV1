interface TeamLogo {
  href: string;
  width: number;
  height: number;
  rel: string[];
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

interface VenueImage {
  href: string;
  width: number;
  height: number;
  rel: string[];
}

interface VenueAddress {
  city: string;
  state: string;
}

interface Venue {
  id: string;
  fullName: string;
  shortName: string;
  address: VenueAddress;
  grass: boolean;
  indoor: boolean;
  images: VenueImage[];
}

interface Team {
  id: string;
  uid: string;
  guid: string;
  slug: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  isAllStar: boolean;
  logos: TeamLogo[];
  links: TeamLink[];
  venue: Venue;
  groups: Record<string, unknown>;
  coaches: Record<string, unknown>;
  record: Record<string, unknown>;
  athletes: Record<string, unknown>;
  againstTheSpreadRecords: Record<string, unknown>;
  ranks: Record<string, unknown>;
  franchise: Record<string, unknown>;
}

interface Season {
  year: number;
  displayName: string;
}

interface Statistic {
  teamId: string;
  teamSlug: string;
  season: Season;
  stats: string[];
  position: string;
}

interface Category {
  name: string;
  displayName: string;
  labels: string[];
  names: string[];
  displayNames: string[];
  descriptions: string[];
  statistics: Statistic[];
  totals: string[];
  sortKey: string;
}

interface GlossaryItem {
  abbreviation: string;
  displayName: string;
}

interface AdvancedStats {
  teams: Record<string, Team>;
  categories: Category[];
  glossary: GlossaryItem[];
}

interface ApiResponse {
  status: string;
  response: {
    advancestats: AdvancedStats;
  };
}

interface StatisticSummary {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  abbreviation: string;
  value: number;
  displayValue: string;
  rank: number;
  rankDisplayValue: string;
}

interface StatsSummary {
  displayName: string;
  statistics: StatisticSummary[];
}

interface SummaryApiResponse {
  status: string;
  response: {
    statsSummary: StatsSummary;
  };
}

interface FilterOption {
  value: string;
  displayValue: string;
  shortDisplayName?: string;
}

interface Filter {
  displayName: string;
  name: string;
  value: string;
  options: FilterOption[];
}

interface PlayerStatCategory {
  name: string;
  displayName: string;
  labels: string[];
  names: string[];
  displayNames: string[];
  descriptions: string[];
  statistics: Statistic[];
  totals: string[];
  sortKey: string;
}

interface PlayerStats {
  filters: Filter[];
  teams: Record<string, Team>;
  categories: PlayerStatCategory[];
  glossary: GlossaryItem[];
}

interface PlayerStatsApiResponse {
  status: string;
  response: {
    stats: PlayerStats;
  };
}

export type {
  ApiResponse,
  AdvancedStats,
  Team,
  Category,
  Statistic,
  Season,
  GlossaryItem,
  TeamLogo,
  TeamLink,
  Venue,
  VenueAddress,
  VenueImage,
  StatisticSummary,
  StatsSummary,
  SummaryApiResponse,
  FilterOption,
  Filter,
  PlayerStatCategory,
  PlayerStats,
  PlayerStatsApiResponse
};