// app/api/event-odds/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_HOST = 'https://api.the-odds-api.com';

// Map of supported sports and their API keys
const SUPPORTED_SPORTS: Record<string, string> = {
  'basketball_nba': 'basketball_nba',
  'football_nfl': 'americanfootball_nfl',
  'baseball_mlb': 'baseball_mlb',
  'hockey_nhl': 'icehockey_nhl',
  'soccer_mls': 'soccer_usa_mls',
  'soccer_epl': 'soccer_england_epl',
  'soccer_laliga': 'soccer_spain_la_liga',
  'football_ncaaf': 'americanfootball_ncaaf',
  'basketball_ncaab': 'basketball_ncaab',
  'mma': 'mma_mixed_martial_arts',
  'golf_pga': 'golf_pga_championship',
  'tennis_atp': 'tennis_atp_aus_open',
  'nascar': 'motorracing_nascar_cup'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');
  const sportKey = searchParams.get('sport');

  if (!eventId || !sportKey) {
    return NextResponse.json(
      { error: 'Event ID and sport key are required' },
      { status: 400 }
    );
  }

  // Get the API sport key, defaulting to the provided key if not in our map
  const apiSportKey = SUPPORTED_SPORTS[sportKey] || sportKey;

  try {
    const apiUrl = `${ODDS_API_HOST}/v4/sports/${apiSportKey}/events/${eventId}/odds`;
    const params = new URLSearchParams({
      apiKey: ODDS_API_KEY || '',
      regions: 'us',
      markets: 'h2h,spreads,totals'
    });

    const response = await fetch(`${apiUrl}?${params}`, {
      next: { revalidate: 60 } // Cache for 1 minute since odds change frequently
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Odds API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch odds: ${response.status} ${response.statusText}`);
    }

    const odds = await response.json();
    return NextResponse.json({
      bookmakers: odds.bookmakers || [],
      last_update: odds.last_update
    });
    
  } catch (error) {
    console.error('Error fetching event odds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds data' },
      { status: 500 }
    );
  }
}
