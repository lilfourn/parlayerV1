// app/api/sports/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get('sport');

  if (!sport) {
    return NextResponse.json({ error: 'Sport parameter is required' }, { status: 400 });
  }

  const regions = 'us';
  const markets = 'h2h';
  const oddsFormat = 'american';
  const dateFormat = 'iso';
  const sportsKey = 'upcoming'
  try {
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/events`, {
      params: {
        apiKey,
        regions,
        markets,
        oddsFormat,
        dateFormat,
      }
    });

    return NextResponse.json(response.data);
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
