'use server';

import { ProcessedProjection, AnalysisResponse } from '@/app/types/props';

export async function analyzeBatchProjections(projections: ProcessedProjection[]): Promise<AnalysisResponse[]> {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/perplexity/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projections }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(`Batch analysis failed: ${errorMessage}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success || !Array.isArray(responseData.data)) {
      throw new Error('Invalid batch analysis response format');
    }

    return responseData.data;
  } catch (error) {
    console.error('Batch Analysis Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function analyzeProjection(projection: ProcessedProjection): Promise<AnalysisResponse> {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured');
  }

  try {
    console.log('Analyzing projection:', {
      player: {
        name: projection.player?.attributes.display_name,
        team: projection.player?.attributes.team
      },
      projection: {
        stat: projection.projection.attributes.stat_display_name,
        line: projection.projection.attributes.line_score,
        status: projection.projection.attributes.status,
        odds_type: projection.projection.attributes.odds_type,
        description: projection.projection.attributes.description,
        start_time: projection.projection.attributes.start_time,
        line_movement: projection.projection.attributes.line_movement
      },
      stats: {
        season_average: projection.statAverage?.attributes.average,
        recent_average: projection.statAverage?.attributes.last_n_average,
        trend: projection.statAverage?.attributes.trend,
        recent_games: projection.statAverage?.attributes.recent_games,
        percentage_diff: projection.percentageDiff
      },
      league: projection.projection.relationships?.league?.data || { type: 'unknown', id: 'unknown' }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/perplexity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projection }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(`Analysis failed: ${errorMessage}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid analysis response format');
    }

    const analysis = responseData.data;

    console.log('Analysis completed:', {
      confidence: analysis.confidence,
      recommendation: analysis.recommendation,
      risk_level: analysis.risk_level,
      timestamp: new Date().toISOString()
    });

    return analysis;
  } catch (error) {
    console.error('Analysis Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
