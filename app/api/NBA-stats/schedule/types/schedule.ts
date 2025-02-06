interface Broadcast {
  name: string;
  type: string;
  market: string;
  link?: string;
  logo?: string;
}

interface PlayerLeader {
  shortName: string;
  name: string;
  href: string;
  uid: string;
  displayValue: string;
}

interface Team {
  id: string;
  abbrev: string;
  displayName: string;
  shortDisplayName: string;
  logo: string;
  teamColor: string;
  altColor: string;
  uid: string;
  recordSummary: string;
  standingSummary: string;
  location: string;
  links: string;
  name: string;
  shortName: string;
  isHome: boolean;
  score: number;
  winner?: boolean;
  leader?: PlayerLeader;
}

interface Status {
  id: string;
  state: string;
  detail: string;
  altDetail?: string;
  resultColumnText?: string;
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

interface Event {
  id: string;
  broadcasts: Broadcast[];
  competitors: Team[];
  completed: boolean;
  date: string;
  status: Status;
  tickets: Record<string, never>;
  venue: Venue;
}

interface ScheduleResponse {
  Events: Event[];
}

interface ApiResponse {
  status: string;
  response: ScheduleResponse;
}

export type {
  ApiResponse,
  ScheduleResponse,
  Event,
  Broadcast,
  Team,
  PlayerLeader,
  Status,
  Venue,
  VenueAddress
};