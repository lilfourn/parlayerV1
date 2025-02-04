// app/api/sports/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }
const regions = 'us'
const markets = 'h2h'
const oddsFormat = 'american'
const dateFormat = 'iso'

  try {
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/${sportsKey}/events/${eventsId}/odds', {
      params: {
        apiKey,
        regions,
        markets,
        oddsFormat,
        dateFormat,
      }
    });

    // Filter to only allowed sports
    const allowedKeys = [
      'americanfootball_ncaaf', 'americanfootball_nfl', 'basketball_nba',
      'basketball_ncaab', 'basketball_wncaab',
      'icehockey_nhl', 'soccer_epl', 'soccer_uefa_champs_league',
      'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a',
      'soccer_france_ligue_one', 'mma_mixed_martial_arts',
      'soccer_uefa_europa_league', 'soccer_fa_cup', 'soccer_mexico_ligamx'
    ];

    const filteredSports = response.data.filter((sport: any) => 
      allowedKeys.includes(sport.key)
    );

    return NextResponse.json(filteredSports);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
