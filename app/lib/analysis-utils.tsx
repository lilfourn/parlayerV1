import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type RecommendationType = 'strong_over' | 'lean_over' | 'neutral' | 'lean_under' | 'strong_under';
type RiskLevelType = 'low' | 'medium' | 'high';

export function getRecommendationColor(recommendation: RecommendationType): string {
  switch (recommendation) {
    case 'strong_over':
    case 'strong_under':
      return 'bg-emerald-100 text-emerald-700';
    case 'lean_over':
    case 'lean_under':
      return 'bg-emerald-50 text-emerald-600';
    case 'neutral':
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getRecommendationDisplay(recommendation: RecommendationType): string {
  switch (recommendation) {
    case 'strong_over':
      return 'Strong Over Pick';
    case 'strong_under':
      return 'Strong Under Pick';
    case 'lean_over':
      return 'Lean Over';
    case 'lean_under':
      return 'Lean Under';
    case 'neutral':
    default:
      return 'Neutral';
  }
}

export function getRecommendationIcon(recommendation: RecommendationType) {
  switch (recommendation) {
    case 'strong_over':
    case 'strong_under':
      return <TrendingUp className="h-4 w-4" />;
    case 'lean_over':
    case 'lean_under':
      return <TrendingUp className="h-4 w-4 opacity-75" />;
    case 'neutral':
    default:
      return <Minus className="h-4 w-4" />;
  }
}

export function getRiskLevelColor(riskLevel: RiskLevelType): string {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'medium':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    case 'high':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}
