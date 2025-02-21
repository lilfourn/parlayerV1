// app/api/eventOdds/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://api.the-odds-api.com/v4';

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

    console.log('Fetching odds for:', { eventId, sportKey });

    if (!eventId || !sportKey) {
      console.error('Missing required parameters:', { eventId, sportKey });
      return NextResponse.json({ 
        error: 'Event ID and sport key are required',
        details: { eventId: !!eventId, sportKey: !!sportKey }
      }, { status: 400 });
    }

    // Construct the URL exactly as in the working example
    const url = `${BASE_URL}/sports/${sportKey}/events/${eventId}/odds`;
    console.log('Requesting URL:', url);

    const response = await axios.get(url, {
      params: {
        apiKey,
        regions: 'us',
        oddsFormat: 'american',
        markets: 'h2h'
      }
    });

    if (!response.data) {
      console.warn('No data received from API:', { eventId, sportKey });
      return NextResponse.json({ 
        error: 'No odds data available',
        details: { hasData: false }
      }, { status: 404 });
    }

    console.log('API Response:', {
      bookmakers: response.data.bookmakers?.length || 0,
      hasData: !!response.data
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching odds:', error);
    
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
