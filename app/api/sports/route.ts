// app/api/sports/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const PRIZEPICKS_SPORT_KEYS = [
    // Traditional sports
    'americanfootball_nfl',
    'basketball_nba',
    'baseball_mlb',
    'icehockey_nhl',
    'soccer_usa_mls',
    'soccer_england_efl_championship',
    'soccer_spain_la_liga',
    
    // College sports
    'americanfootball_ncaaf',
    'basketball_ncaab',
    
    // MMA
    'mma_mixed_martial_arts',
    
    // Golf
    'golf_pga_championship',
    
    // Tennis
    'tennis_atp_aus_open',
    
    // Auto racing
    'motorracing_nascar_cup'
  ];

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${process.env.ODDS_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) throw new Error('Failed to fetch sports');

    const allSports = await response.json();
    
    // Filter to only PrizePicks-supported sports
    const prizePicksSports = allSports.filter((sport: { key: string }) => 
      PRIZEPICKS_SPORT_KEYS.includes(sport.key)
    );

    return NextResponse.json(prizePicksSports);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sports data' },
      { status: 500 }
    );
  }
}
