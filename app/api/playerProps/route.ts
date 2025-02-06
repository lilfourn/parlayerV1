// app/api/playerProps/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { MARKETS_CONFIG } from '@/app/odds/constants/markets';

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

export async function GET(request: Request) {
  try {
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      console.error('API key is missing');
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const sportKey = searchParams.get('sportKey');
    const marketKey = searchParams.get('marketKey');

    console.log('Fetching player props:', { eventId, sportKey, marketKey });

    if (!eventId || !sportKey) {
      console.error('Missing required parameters:', { eventId, sportKey });
      return NextResponse.json({ 
        error: 'Event ID and sport key are required',
        details: { eventId: !!eventId, sportKey: !!sportKey }
      }, { status: 400 });
    }

    // Get markets for the specific sport or use the provided marketKey
    const markets = marketKey || getMarketsForSport(sportKey);
    console.log('Using markets:', { sportKey, marketKey, marketsCount: markets.split(',').length });

    const url = `${BASE_URL}/sports/${sportKey}/events/${eventId}/odds`;
    console.log('Requesting URL:', url);

    const data = await rateLimit<OddsResponse>(url, {
      apiKey,
      regions: 'us',
      oddsFormat: 'american',
      markets
    });

    if (!data) {
      console.warn('No data received from API:', { eventId, sportKey });
      return NextResponse.json({ 
        error: 'No player props available',
        details: { hasData: false }
      }, { status: 404 });
    }

    // Transform the response to include player names from descriptions
    const transformedData = {
      ...data,
      bookmakers: data.bookmakers?.map((bookmaker: Bookmaker) => ({
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

    console.log('API Response:', {
      bookmakers: transformedData.bookmakers?.length || 0,
      hasData: !!transformedData,
      markets: markets.split(',').length
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching player props:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = {
        status,
        message: errorMessage,
        path: error.config?.url,
        details: error.response?.data
      };
      
      console.error('API Error details:', errorDetails);
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails
      }, { status });
    }
    
    return NextResponse.json({
      error: 'Unknown error occurred',
      details: error instanceof Error ? error.message : 'No error details available'
    }, { status: 500 });
  }
}
