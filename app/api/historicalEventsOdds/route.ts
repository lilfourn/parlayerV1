// app/api/historicalEventsOdds/route.ts
import { MARKETS_CONFIG } from '@/app/odds/constants/markets';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Constants for required parameters
const REGIONS = 'us';
const DATE = '2024-02-05T12:00:00Z'; // One year ago from current date
const ODDS_FORMAT = 'american';
const DATE_FORMAT = 'iso';

const BASE_URL = 'https://api.the-odds-api.com/v4';
const INITIAL_RETRY_DELAY = 500; // 1 second
const MAX_RETRIES = 3;

// Sleep function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limited axios get with exponential backoff
async function rateLimit<T>(
  url: string, 
  params: any, 
  retryCount = 0
): Promise<T> {
  try {
    // Add a small delay before each request to help prevent rate limiting
    await sleep(INITIAL_RETRY_DELAY);
    
    const response = await axios.get<T>(url, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      // Calculate exponential backoff delay
      const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Rate limited, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      await sleep(backoffDelay);
      return rateLimit(url, params, retryCount + 1);
    }
    throw error;
  }
}

interface Market {
  key: string;
  description?: string;
  outcomes: Array<{
    name: string;
    price: number;
    point?: number;
  }>;
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface OddsResponse {
  id: string;
  sport_key: string;
  bookmakers: Bookmaker[];
}

function getMarketsForSport(sportKey: string): string {
  // Extract the base sport from the key (e.g., 'basketball_nba' -> 'basketball_nba')
  const sport = sportKey.includes('_') ? sportKey : 'soccer';
  const config = MARKETS_CONFIG[sport];

  if (!config) {
    console.warn(`No market configuration found for sport: ${sport}`);
    return '';
  }

  const markets: string[] = [];

  // Add regular markets
  if (config.regular) {
    markets.push(...config.regular);
  }

  // Add alternate markets
  if (config.alternate) {
    markets.push(...config.alternate);
  }

  // Add other markets
  if (config.other) {
    markets.push(...config.other);
  }

  return markets.join(',');
}

export async function GET(request: NextRequest) {
  try {
    // Required constant parameter
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key missing',
        code: 'API_KEY_MISSING'
      }, { status: 500 });
    }

    // Get interactive parameters from request
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport');
    const eventId = searchParams.get('eventId');
    const marketKey = searchParams.get('marketKey'); // Optional interactive parameter
    const markets = searchParams.get('markets'); // Optional interactive parameter

    // Validate required interactive parameters
    if (!sport || !eventId) {
      return NextResponse.json({ 
        error: 'Sport and eventId are required parameters',
        code: 'MISSING_PARAMETERS',
        details: {
          sport: !sport ? 'Sport parameter is required' : undefined,
          eventId: !eventId ? 'EventId parameter is required' : undefined
        }
      }, { status: 400 });
    }

    // Get markets for the specific sport or use the provided marketKey
    const marketsForSport = marketKey || getMarketsForSport(sport);
    console.log('Using markets:', { sport, marketKey, marketsCount: marketsForSport.split(',').length });

    // Construct the URL with parameters
    const url = `${BASE_URL}/historical/sports/${sport}/events/${eventId}/odds`;
    const queryParams = new URLSearchParams({
      apiKey,
      regions: REGIONS,
      date: DATE,
      dateFormat: DATE_FORMAT,
      oddsFormat: ODDS_FORMAT,
      ...(marketsForSport && { markets: marketsForSport })
    });

    console.log('Making historical odds API request:', {
      url: `${url}?${queryParams.toString().replace(apiKey, '[REDACTED]')}`,
      sport,
      eventId
    });

    const response = await rateLimit<OddsResponse>(`${url}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check if response is empty
    if (!response) {
      return NextResponse.json({ 
        error: 'No historical odds found',
        code: 'NO_ODDS_FOUND',
        details: 'No odds were found for the specified event'
      }, { status: 404 });
    }

    // Transform the response to include player names from descriptions
    const transformedData = {
      ...response,
      bookmakers: response.bookmakers?.map((bookmaker: Bookmaker) => ({
        ...bookmaker,
        markets: bookmaker.markets?.map((market: Market) => ({
          ...market,
          outcomes: market.outcomes?.map(outcome => ({
            ...outcome,
            name: market.description || outcome.name, // Use description as player name if available
          }))
        }))
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      
      console.error('API Error:', {
        status,
        data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url?.replace(process.env.ODDS_API_KEY || '', '[REDACTED]'),
          method: error.config?.method
        }
      });

      // Handle specific API errors
      if (status === 422) {
        return NextResponse.json({
          error: 'Invalid request parameters',
          code: data?.error_code || 'INVALID_PARAMETERS',
          details: data?.message || 'The API rejected one or more parameters'
        }, { status: 422 });
      }

      if (status === 429) {
        return NextResponse.json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: 'Too many requests. Please try again later.'
        }, { status: 429 });
      }

      return NextResponse.json({ 
        error: 'API request failed',
        code: data?.error_code || 'API_ERROR',
        details: data?.message || error.message
      }, { status });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
