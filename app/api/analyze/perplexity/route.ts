// app/api/analyze/perplexity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProcessedProjection, AnalysisResponse, isValidAnalysisResponse } from '@/app/types/props';
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

const SYSTEM_PROMPT = `You are an expert sports analyst specializing in player projections and statistical analysis. Your task is to analyze player projections and provide insights in a strictly formatted JSON response.

CRITICAL FORMATTING REQUIREMENTS:
1. Respond ONLY with a valid JSON object
2. Do not include any text before or after the JSON
3. Do not include any explanations or notes
4. Use the exact format shown below
5. Ensure all JSON syntax is valid (quotes, commas, brackets)

REQUIRED JSON STRUCTURE:
{
  "confidence": <number between 0 and 1>,
  "recommendation": <one of: "strong_over", "lean_over", "neutral", "lean_under", "strong_under">,
  "key_factors": [
    {
      "factor": <string describing factor with stats and sources>,
      "impact": <one of: "positive", "negative", "neutral">,
      "weight": <number between 0 and 1>
    }
  ],
  "summary": <string with analysis and sources>,
  "risk_level": <one of: "low", "medium", "high">
}

Example valid response:
{
  "confidence": 0.85,
  "recommendation": "strong_over",
  "key_factors": [
    {
      "factor": "Player averaged 28.5 points in last 5 games (source: NBA.com)",
      "impact": "positive",
      "weight": 0.8
    }
  ],
  "summary": "Analysis based on recent performance trends...",
  "risk_level": "low"
}

ANALYSIS REQUIREMENTS:
1. Statistical Research:
   - Research and analyze recent player statistics
   - Find news articles about performance and status
   - Compare to expert consensus
   - Consider team factors

2. Data Integration:
   - Compare line to researched data
   - Use actual statistics in analysis
   - Note any data discrepancies

3. Context:
   - Research team dynamics
   - Check injury reports
   - Consider external factors

4. Risk Assessment:
   - Evaluate confidence level
   - Identify key factors
   - Research similar projections

Remember: Your response must be ONLY the JSON object with no additional text.`;

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
      temperature: 0.1,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('Empty response from API');
      return NextResponse.json({ success: false, data: createFallbackAnalysis('No content in API response') });
    }

    console.log('Raw API response:', content);

    // First try to parse the content directly as JSON
    try {
      const parsedData = JSON.parse(content);
      
      // Validate the parsed data using our type guard
      if (!isValidAnalysisResponse(parsedData)) {
        console.error('Invalid analysis response structure:', parsedData);
        
        // Attempt to create a valid response from the parsed data
        const sanitizedAnalysis: AnalysisResponse = {
          confidence: typeof parsedData.confidence === 'number' && parsedData.confidence >= 0 && parsedData.confidence <= 1
            ? parsedData.confidence
            : 0,
          recommendation: ['strong_over', 'lean_over', 'neutral', 'lean_under', 'strong_under'].includes(parsedData.recommendation)
            ? parsedData.recommendation
            : 'neutral',
          key_factors: Array.isArray(parsedData.key_factors)
            ? parsedData.key_factors.filter((kf: any) => 
                typeof kf === 'object' &&
                typeof kf.factor === 'string' &&
                ['positive', 'negative', 'neutral'].includes(kf.impact) &&
                typeof kf.weight === 'number' &&
                kf.weight >= 0 &&
                kf.weight <= 1
              )
            : [],
          summary: typeof parsedData.summary === 'string' ? parsedData.summary : 'Analysis completed with limited data',
          risk_level: ['low', 'medium', 'high'].includes(parsedData.risk_level)
            ? parsedData.risk_level
            : 'high'
        };

        console.log('Created sanitized analysis:', sanitizedAnalysis);
        return NextResponse.json({ success: true, data: sanitizedAnalysis });
      }

      return NextResponse.json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error('Failed to parse API response:', {
        error: parseError,
        content: content,
        timestamp: new Date().toISOString()
      });

      // Try to extract JSON using regex as a fallback
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]);
          if (isValidAnalysisResponse(extractedData)) {
            console.log('Successfully extracted JSON using regex');
            return NextResponse.json({ success: true, data: extractedData });
          }
        } catch (secondaryError) {
          console.error('Failed to parse extracted JSON:', secondaryError);
        }
      }

      return NextResponse.json({ success: false, data: createFallbackAnalysis('Failed to parse API response') });
    }

  } catch (error) {
    console.error('Error in Perplexity API:', {
      error,
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json({ 
      success: false, 
      data: createFallbackAnalysis(error instanceof Error ? error.message : 'Failed to process request')
    });
  }
}

function createFallbackAnalysis(errorMessage: string): AnalysisResponse {
  return {
    confidence: 0,
    recommendation: 'neutral',
    key_factors: [{
      factor: `Analysis failed: ${errorMessage}`,
      impact: 'neutral',
      weight: 1
    }],
    summary: 'Unable to generate analysis. Please try again.',
    risk_level: 'high'
  };
}
