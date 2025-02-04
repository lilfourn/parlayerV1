import { Event } from './events';

export interface EventOdds extends Event {
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;          // e.g., "draftkings"
  title: string;        // e.g., "DraftKings"
  markets: Market[];
}

export interface Market {
  key: string;          // e.g., "h2h"
  last_update: string;  // ISO timestamp
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;         // Team name
  price: number;        // Odds price (e.g., 2.24)
}