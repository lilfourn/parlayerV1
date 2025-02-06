// app/api/historicalEvents/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { HistoricalEvent } from '@/types/historical-events';

// Constants
const DATE_FORMAT = 'iso';
const BASE_URL = 'https://api.the-odds-api.com/v4';
const PAGE_SIZE = 15;
const DEFAULT_REGION = 'us';
const DEFAULT_ODDS_FORMAT = 'american';

interface OddsResponse {
  timestamp: string;
  previous_timestamp: string;
  next_timestamp: string;
  data: Array<{
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: Array<{
      key: string;
      title: string;
      markets: Array<{
        key: string;
        outcomes: Array<{
          name: string;
          price: number;
        }>;
      }>;
    }>;
  }>;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalEvents: number;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key missing',
        code: 'API_KEY_MISSING'
      }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const team = searchParams.get('team')?.toLowerCase();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const markets = searchParams.get('markets') || 'h2h';

    if (!sport) {
      return NextResponse.json({ 
        error: 'Sport parameter is required',
        code: 'MISSING_SPORT'
      }, { status: 400 });
    }

    // Validate and parse dates
    const now = new Date();
    const parsedStartDate = startDate ? new Date(startDate) : new Date(now.setFullYear(now.getFullYear() - 1));
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format',
        code: 'INVALID_DATE'
      }, { status: 400 });
    }

    // Format dates for the API
    // Set the snapshot time (date parameter) to match commenceTimeFrom for accurate historical odds
    const formattedStartDate = parsedStartDate.toISOString().split('.')[0] + 'Z';
    const formattedEndDate = parsedEndDate.toISOString().split('.')[0] + 'Z';

    // Construct the URL with parameters for historical odds
    const url = `${BASE_URL}/historical/sports/${sport}/odds`;
    const queryParams = new URLSearchParams({
      apiKey,
      regions: DEFAULT_REGION,
      oddsFormat: DEFAULT_ODDS_FORMAT,
      dateFormat: DATE_FORMAT,
      markets,
      date: formattedStartDate, // Use the start date as the snapshot time
      commenceTimeFrom: formattedStartDate,
      commenceTimeTo: formattedEndDate
    });

    console.log('Making historical odds API request:', {
      url: `${url}?${queryParams.toString().replace(apiKey, '[REDACTED]')}`,
      sport,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      page,
      markets
    });

    const response = await axios.get<OddsResponse>(`${url}?${queryParams.toString()}`);
    let events = response.data.data;

    // Filter by team if specified
    if (team) {
      events = events.filter(event => 
        event.home_team.toLowerCase().includes(team) ||
        event.away_team.toLowerCase().includes(team)
      );
    }

    // Calculate pagination
    const totalEvents = events.length;
    const totalPages = Math.ceil(totalEvents / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedEvents = events.slice(startIndex, endIndex);

    // Transform events to include odds data
    const transformedEvents = paginatedEvents.map(event => ({
      id: event.id,
      sport_key: event.sport_key,
      sport_title: event.sport_title,
      commence_time: event.commence_time,
      home_team: event.home_team,
      away_team: event.away_team,
      odds: event.bookmakers.map(bookmaker => ({
        key: bookmaker.key,
        title: bookmaker.title,
        markets: bookmaker.markets.map(market => ({
          key: market.key,
          outcomes: market.outcomes
        }))
      }))
    }));

    const paginatedResponse: PaginatedResponse<typeof transformedEvents[0]> = {
      data: transformedEvents,
      page,
      pageSize: PAGE_SIZE,
      totalPages,
      totalEvents,
      timestamp: response.data.timestamp
    };

    return NextResponse.json(paginatedResponse);

  } catch (error) {
    console.error('Error fetching historical odds:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      if (status === 429) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status });
      }
      
      return NextResponse.json({
        error: message,
        code: 'API_ERROR'
      }, { status });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
