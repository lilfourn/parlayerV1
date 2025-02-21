// app/api/analyze/perplexity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProcessedProjection, AnalysisResponse, isValidAnalysisResponse } from '@/app/types/props';
import { OpenAI } from 'openai';

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not defined');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined');
}

const perplexityClient = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function tryParseWithOpenAI(rawContent: string): Promise<AnalysisResponse | null> {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        {
          role: 'system',
          content: `You are a JSON format converter. DO NOT analyze or modify the content - your only job is to take the input and format it correctly as a valid AnalysisResponse JSON.

If the input contains an analysis, use those EXACT values - do not modify them.
If a field is missing or invalid, only then use a reasonable default.

The output MUST follow this structure:
{
  "confidence": number between 0 and 1,
  "recommendation": one of ["strong_over", "lean_over", "neutral", "lean_under", "strong_under"],
  "key_factors": array of {
    "factor": string description,
    "impact": one of ["positive", "negative", "neutral"],
    "weight": number between 0 and 1
  },
  "summary": string,
  "risk_level": one of ["low", "medium", "high"]
}

IMPORTANT: DO NOT re-analyze or change the meaning of the content. Only fix the format.
Respond ONLY with the valid JSON object.`
        },
        {
          role: 'user',
          content: `Convert this content into a valid AnalysisResponse format WITHOUT changing its meaning:\n${rawContent}`
        }
      ],
      temperature: 0,  // Set to 0 for most deterministic formatting
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsedData = JSON.parse(content);
    if (!isValidAnalysisResponse(parsedData)) {
      console.error('OpenAI format conversion failed validation:', parsedData);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('OpenAI format conversion failed:', error);
    return null;
  }
}

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
Line Comparison: *SEARCH UP BETTING WEBSITES RELATED TO ${playerName} on fanduel bet365, etc. AND SEE THEIR LINES*

Statistics:
- Season Average: Please search up for ${playerName}
- Recent Average: *SEARCH UP STATS FOR ${playerName}*
- Performance Trend: *SEARCH UP RECENT TRENDS FOR ${playerName}*


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
9. venue statistics for ${playerName} , do they play better at home or away?
10. Opponent difficulty, is their oponent good or bad? Is it expected to be a blow out or crushing?

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

    const response = await perplexityClient.chat.completions.create({
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
      
      if (!isValidAnalysisResponse(parsedData)) {
        console.log('Invalid response, attempting OpenAI parsing...');
        const openaiParsed = await tryParseWithOpenAI(content);
        if (openaiParsed) {
          console.log('Successfully parsed with OpenAI');
          return NextResponse.json({ success: true, data: openaiParsed });
        }
        
        console.error('Invalid analysis response structure:', parsedData);
        // Fall back to sanitized version if OpenAI fails
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

      // Try OpenAI parsing first
      console.log('Attempting OpenAI parsing for unparseable content...');
      const openaiParsed = await tryParseWithOpenAI(content);
      if (openaiParsed) {
        console.log('Successfully parsed unparseable content with OpenAI');
        return NextResponse.json({ success: true, data: openaiParsed });
      }

      // Then try regex as a last resort
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]);
          if (isValidAnalysisResponse(extractedData)) {
            console.log('Successfully extracted JSON using regex');
            return NextResponse.json({ success: true, data: extractedData });
          }
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }

      return NextResponse.json({ 
        success: false, 
        data: createFallbackAnalysis('Failed to parse API response') 
      });
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
