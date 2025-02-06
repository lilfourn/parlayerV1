interface TeamVenue {
  id: string;
}

interface TeamLink {
  rel: string[];
  href: string;
  text: string;
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
  color: string;
  alternateColor: string;
  isActive: boolean;
  venue: TeamVenue;
  links: TeamLink[];
  logo: string;
}

interface Competitor {
  homeAway: 'home' | 'away';
  id: string;
  score: string;
  team: Team;
  type: string;
}

interface StatusType {
  id: string;
  name: string;
  state: string;
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
  altDetail?: string;
}

interface Status {
  clock: number;
  displayClock: string;
  period: number;
  type: StatusType;
}

interface Season {
  year: number;
  type: number;
  slug: string;
}

interface Format {
  regulation: {
    periods: number;
  };
}

interface VenueAddress {
  city: string;
  state: string;
}

interface Venue {
  id: string;
  fullName: string;
  address: VenueAddress;
  indoor: boolean;
}

interface Competition {
  competitors: Competitor[];
  attendance: number;
  broadcast: string;
  conferenceCompetition: boolean;
  date: string;
  format: Format;
  id: string;
  neutralSite: boolean;
  playByPlayAvailable: boolean;
  recent: boolean;
  startDate: string;
  status: Status;
  type: {
    id: string;
    abbreviation: string;
  };
  venue: Venue;
}

interface Event {
  date: string;
  id: string;
  name: string;
  season: Season;
  shortName: string;
  status: Status;
  uid: string;
  competitions: Competition;
}

interface ScoreboardResponse {
  Events: Event[];
}

interface ApiResponse {
  status: string;
  response: ScoreboardResponse;
}

export type {
  ApiResponse,
  ScoreboardResponse,
  Event,
  Competition,
  Venue,
  VenueAddress,
  Format,
  Season,
  Status,
  StatusType,
  Competitor,
  Team,
  TeamLink,
  TeamVenue
};