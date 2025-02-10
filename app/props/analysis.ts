import { ProcessedProjection } from '@/app/types/props';

export interface AnalysisRequest {
  projection: ProcessedProjection;
}

export interface AnalysisFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface AnalysisResponse {
  confidence: number;
  recommendation: 'strong_over' | 'lean_over' | 'neutral' | 'lean_under' | 'strong_under';
  key_factors: AnalysisFactor[];
  summary: string;
  risk_level: 'low' | 'medium' | 'high';
}

export const RECOMMENDATION_VALUES = [
  'strong_over',
  'lean_over',
  'neutral',
  'lean_under',
  'strong_under'
] as const;

export const IMPACT_VALUES = ['positive', 'negative', 'neutral'] as const;
export const RISK_LEVEL_VALUES = ['low', 'medium', 'high'] as const;

export interface AnalysisError {
  error: string;
  status?: number;
}

// Type guard for AnalysisResponse validation
export function isValidAnalysisResponse(response: any): response is AnalysisResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.confidence === 'number' &&
    response.confidence >= 0 &&
    response.confidence <= 1 &&
    RECOMMENDATION_VALUES.includes(response.recommendation) &&
    Array.isArray(response.key_factors) &&
    response.key_factors.length > 0 &&
    response.key_factors.every((factor: { factor: any; impact: any; weight: number; }) => 
      typeof factor.factor === 'string' &&
      (factor.impact === 'positive' || factor.impact === 'negative' || factor.impact === 'neutral') &&
      typeof factor.weight === 'number' &&
      factor.weight >= 0 &&
      factor.weight <= 1
    ) &&
    typeof response.summary === 'string' &&
    RISK_LEVEL_VALUES.includes(response.risk_level)
  );
}

// Helper function to create a fallback analysis response
export function createFallbackAnalysis(error: Error | string): AnalysisResponse {
  return {
    confidence: 0.5,
    recommendation: 'neutral',
    key_factors: [{
      factor: 'Analysis Error',
      impact: 'neutral',
      weight: 1
    }],
    summary: typeof error === 'string' ? error : error.message,
    risk_level: 'medium'
  };
}

// Constants for analysis configuration
export const ANALYSIS_CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  },
  WEIGHT_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
  }
} as const;
