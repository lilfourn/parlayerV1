'use server';

import { ProcessedProjection, AnalysisResponse } from '@/app/types/props';

export async function analyzeProjection(projection: ProcessedProjection): Promise<AnalysisResponse> {
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
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      if (response.status === 401) {
        throw new Error('API key is missing or invalid. Please check your PERPLEXITY_API_KEY environment variable.');
      }

      throw new Error('Failed to analyze projection');
    }

    const analysis = await response.json();
    console.log('Analysis completed:', {
      confidence: analysis.confidence,
      recommendation: analysis.recommendation,
      risk_level: analysis.risk_level
    });

    return analysis;
  } catch (error) {
    console.error('Analysis Error:', error);
    throw error;
  }
}