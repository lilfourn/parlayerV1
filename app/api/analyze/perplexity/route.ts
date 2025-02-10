// app/api/analyze/perplexity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProcessedProjection, AnalysisResponse } from '@/app/types/props';
import { OpenAI } from 'openai';

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not defined');
}

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

function generatePrompt(projection: ProcessedProjection): string {
  const playerName = projection.player?.attributes.display_name;
  const statType = projection.projection.attributes.stat_display_name;
  const line = projection.projection.attributes.line_score;
  const lastNAvg = projection.statAverage?.attributes.last_n_average;
  const league = projection.projection.relationships?.league?.data || { type: 'unknown', id: 'unknown' };
  const description = projection.projection.attributes.description;
  const startTime = projection.projection.attributes.start_time;
  const team = projection.player?.attributes.team || 'Unknown Team';
  const status = projection.projection.attributes.status;
  const odds = projection.projection.attributes.odds_type;
  const lineMovement = projection.projection.attributes.line_movement;
  const recentGames = projection.statAverage?.attributes.recent_games || [];
  const seasonAvg = projection.statAverage?.attributes.average;
  const trend = projection.statAverage?.attributes.trend;
  const percentageDiff = projection.percentageDiff;

  const lineMovementInfo = lineMovement 
    ? `Line Movement: ${lineMovement.original} → ${lineMovement.current} (${lineMovement.direction}, diff: ${lineMovement.difference})`
    : 'No line movement data';

  const recentGamesStr = recentGames.length > 0
    ? `Recent Games Performance:\n${recentGames.map((g, i) => `Game ${i + 1}: ${g.value}${g.opponent ? ` vs ${g.opponent}` : ''} (${g.date})`).join('\n')}`
    : 'No recent games data';

  return `Analyze this player projection in detail:

Player: ${playerName}
Team: ${team}
Stat: ${statType}
Line: ${line}
Status: ${status}
Odds Type: ${odds}
Line Comparison: *SEARCH UP BETTING WEBSITES RELATED TO ${playerName} AND SEE THEIR LINES*

Statistics:
- Season Average: ${seasonAvg || 'N/A'}
- Recent Average: *SEARCH UP STATS FOR ${playerName}*
- Performance Trend: *SEARCH UP RECENT TRENDS FOR ${playerName}*
- Percentage Difference: ${percentageDiff}%

Recent Game: Research resent games, tournaments, rankings regarding ${playerName}, I would like an average for the ${statType} of  ${playerName} for the last 5, 10, 15, 20, and 50 games/matches

League: SEARCH WHAT LEAGUE ${playerName} IS IN
Opponent: ${description}
Start Time: ${startTime}

Consider:
1. Recent performance trend and consistency
2. Line value vs averages
3. Line movement direction and significance
4. Recent games pattern
5. Historical performance
6. Current status and game context
7. Social media sentiment and post from ${playerName} and about ${playerName} from verified news sources and social media platforms
8. RESEARCH Odds data regarding ${playerName}'s Stat: ${statType}
Line: ${line} on over 5 different bookie.

Provide a detailed analysis with confidence level, recommendation, key factors, and risk assessment.`;
}

const SYSTEM_PROMPT = `You are an expert sports analyst specializing in player projections and statistical analysis. 
IMPORTANT: For each analysis, you must search the internet for the most recent statistics, news, and performance data about the player and their specific projection type. Use this data to enhance your analysis.

For each projection, analyze the following aspects:

1. Statistical Research and Analysis:
   - ACTIVELY SEARCH for and analyze the player's recent statistics from sports data websites
   - Look for news articles about the player's recent performance and status
   - Find historical performance data for similar situations
   - Compare current projection to expert consensus from various sports analytics sites
   - Research team-specific factors that might affect the projection
   

2. Data Integration:
   - Compare the provided line to your researched data
   - Use actual statistics from your web research in your analysis
   - Consider both the provided stats AND your researched data
   - Look for any discrepancies between our data and current public data

3. Contextual Factors:
   - Research current team dynamics and matchups
   - Look for recent news about injuries or other relevant factors
   - Find information about venue, weather (if relevant), and other external factors
   - Research historical performance in similar situations

4. Risk Assessment:
   - Evaluate prediction confidence based on ALL available data
   - Identify key factors from both provided and researched data
   - Research similar historical projections and their outcomes

Your response must be a VALID JSON string in the following format:
{
  "confidence": number between 0 and 1,
  "recommendation": "strong_over" | "lean_over" | "neutral" | "lean_under" | "strong_under",
  "key_factors": [
    {
      "factor": "description of the factor (include specific stats and sources)",
      "impact": "positive" | "negative" | "neutral",
      "weight": number between 0 and 1
    }
  ],
  "summary": "detailed analysis summary including researched data and sources",
  "risk_level": "low" | "medium" | "high"
}

IMPORTANT: 
1. Your response must be ONLY the JSON object, no additional text.
2. All fields are required.
3. Use the exact field names and value types specified above.
4. The JSON must be valid and parseable.
5. Include specific statistics and sources in your analysis.
6. Base your recommendation on BOTH provided data and researched data.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projection } = body as { projection: ProcessedProjection };

    if (!projection) {
      return NextResponse.json(
        { error: 'Projection data is required' },
        { status: 400 }
      );
    }

    // Log the full projection data for debugging
    console.log('Full projection data:', JSON.stringify({
      player: projection.player?.attributes,
      projection: projection.projection.attributes,
      stats: projection.statAverage?.attributes,
      league: projection.projection.relationships?.league?.data,
      percentageDiff: projection.percentageDiff
    }, null, 2));

    const userPrompt = generatePrompt(projection);
    console.log('Generated prompt:', userPrompt);

    const response = await client.chat.completions.create({
      model: 'sonar-reasoning-pro',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'text' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from content by finding the last occurrence of a JSON object
    const jsonMatch = content.match(/\{(?:[^{}]|{[^{}]*})*\}$/);
    if (!jsonMatch) {
      console.error('No valid JSON found in response:', content);
      throw new Error('No valid JSON found in API response');
    }

    // Parse the JSON portion
    try {
      const analysis = JSON.parse(jsonMatch[0]) as AnalysisResponse;
      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', content);
      
      // Fallback parsing mechanism
      const fallbackAnalysis: AnalysisResponse = {
        confidence: 0,
        recommendation: 'neutral',
        key_factors: [],
        summary: '',
        risk_level: 'high'
      };

      // Try to extract recommendation
      const recommendationMatch = content.match(/recommendation["\s:]+(strong_over|lean_over|neutral|lean_under|strong_under)/i);
      if (recommendationMatch) {
        fallbackAnalysis.recommendation = recommendationMatch[1].toLowerCase() as AnalysisResponse['recommendation'];
      }

      // Try to extract confidence
      const confidenceMatch = content.match(/confidence["\s:]+(\d+(\.\d+)?)/i);
      if (confidenceMatch) {
        fallbackAnalysis.confidence = parseFloat(confidenceMatch[1]);
      }

      // Try to extract summary
      const summaryMatch = content.match(/summary["\s:]+"([^"]+)"/i);
      if (summaryMatch) {
        fallbackAnalysis.summary = summaryMatch[1];
      }

      console.log('Using fallback parsing mechanism:', fallbackAnalysis);
      return NextResponse.json(fallbackAnalysis);
    }

  } catch (error) {
    console.error('Error in Perplexity API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
