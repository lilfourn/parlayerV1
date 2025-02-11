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

async function analyzeProjectionWithPerplexity(projection: ProcessedProjection): Promise<AnalysisResponse> {
  const userPrompt = generatePrompt(projection);
  
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
    throw new Error('Empty response from Perplexity API');
  }

  try {
    const parsedData = JSON.parse(content);
    if (isValidAnalysisResponse(parsedData)) {
      return parsedData;
    }
    
    // Try OpenAI format conversion
    const openaiParsed = await tryParseWithOpenAI(content);
    if (openaiParsed) {
      return openaiParsed;
    }

    throw new Error('Invalid analysis response format');
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try OpenAI format conversion for unparseable content
      const openaiParsed = await tryParseWithOpenAI(content);
      if (openaiParsed) {
        return openaiParsed;
      }
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projections } = body as { projections: ProcessedProjection[] };

    if (!Array.isArray(projections) || projections.length === 0) {
      return NextResponse.json(
        { error: 'Projections array is required' },
        { status: 400 }
      );
    }

    // Process all projections in parallel
    const analysisPromises = projections.map(async (projection) => {
      try {
        return await analyzeProjectionWithPerplexity(projection);
      } catch (error) {
        console.error('Analysis failed for projection:', {
          player: projection.player?.attributes.display_name,
          error
        });
        return createFallbackAnalysis('Analysis failed for this projection');
      }
    });

    // Wait for all analyses to complete
    const results = await Promise.all(analysisPromises);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Batch analysis failed:', error);
    return NextResponse.json(
      { error: 'Failed to process batch analysis request' },
      { status: 500 }
    );
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
Line Comparison: *SEARCH UP BETTING WEBSITES RELATED TO ${playerName} AND SEE THEIR LINES*

Statistics:
- Season Average: ${seasonAvg || 'N/A'}
- Recent Average (Last ${recentGames.length} games): ${lastNAvg || 'N/A'}
- Trend: ${trend || 'N/A'}
- Percentage Difference: ${percentageDiff !== undefined ? `${percentageDiff}%` : 'N/A'}

${lineMovementInfo}

${recentGamesStr}

Game Info:
- Description: ${description}
- Start Time: ${startTime}
- League: ${league.type}

Analyze the following aspects:
1. Compare the line to season and recent averages
2. Evaluate recent performance trend
3. Consider line movement
4. Factor in game context and matchup
5. Assess injury impacts if any
6. Review team rotation/usage patterns
7. Check weather impacts if relevant
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

2. Line Analysis:
   - Compare to historical performance
   - Evaluate line movement
   - Research market consensus
   - Check injury reports

3. Context Evaluation:
   - Game importance
   - Team matchups
   - Weather impacts
   - Schedule factors

4. Risk Assessment:
   - Evaluate confidence level
   - Identify key factors
   - Research similar projections

Remember: Your response must be ONLY the JSON object with no additional text.`;

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

function createFallbackAnalysis(errorMessage: string): AnalysisResponse {
  return {
    confidence: 0,
    recommendation: 'neutral',
    key_factors: [{
      factor: errorMessage,
      impact: 'neutral',
      weight: 1
    }],
    summary: 'Analysis failed to complete',
    risk_level: 'high'
  };
}
