// app/api/odds-by-sport/route.ts
import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const regions = searchParams.get('regions') || 'us';
  const markets = searchParams.get('markets') || 'h2h,spreads,totals';
  const oddsFormat = searchParams.get('oddsFormat') || 'decimal';
  const dateFormat = searchParams.get('dateFormat') || 'iso';

  if (!sport || !PRIZEPICKS_SPORT_KEYS.includes(sport)) {
    return NextResponse.json({ error: 'Invalid or missing sport parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${ODDS_API_HOST}/v4/sports/${sport}/odds?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&dateFormat=${dateFormat}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      throw new Error('Failed to fetch odds');
    }

    const odds = await response.json();
    return NextResponse.json(odds);

  } catch (error) {
    console.error('Error fetching odds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds data' },
      { status: 500 }
    );
  }
}
