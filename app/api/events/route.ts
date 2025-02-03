// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_HOST = 'https://api.the-odds-api.com';

const PRIZEPICKS_SPORT_KEYS = [
  'americanfootball_nfl',
  'basketball_nba',
  'baseball_mlb',
  'icehockey_nhl',
  'soccer_usa_mls',
  'soccer_england_efl_championship',
  'soccer_spain_la_liga',
  'americanfootball_ncaaf',
  'basketball_ncaab',
  'mma_mixed_martial_arts',
  'golf_pga_championship',
  'tennis_atp_aus_open',
  'motorracing_nascar_cup'
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sportKey = searchParams.get('sport');

  if (!sportKey) {
    return NextResponse.json(
      { error: 'Sport key is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${ODDS_API_HOST}/v4/sports/${sportKey}/events?apiKey=${ODDS_API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const events = await response.json();
    return NextResponse.json(events);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events data' },
      { status: 500 }
    );
  }
}
