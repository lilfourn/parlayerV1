import { AnalysisResponse } from "@/app/types/props";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  analysis: AnalysisResponse;
  projection: any;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export function AnalysisResult({ analysis, projection, onReanalyze, isAnalyzing }: AnalysisResultProps) {
  const confidencePercent = Math.round(analysis.confidence * 100);
  
  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case 'strong_over':
        return 'text-green-600 dark:text-green-500';
      case 'lean_over':
        return 'text-green-500 dark:text-green-400';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
      case 'lean_under':
        return 'text-red-500 dark:text-red-400';
      case 'strong_under':
        return 'text-red-600 dark:text-red-500';
      default:
        return 'text-yellow-600';
    }
  };
  
  const getRiskColor = () => {
    switch (analysis.risk_level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Analysis Result</h3>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            getRiskColor()
          )}>
            {analysis.risk_level.toUpperCase()} RISK
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Confidence</span>
          <span className="text-sm text-muted-foreground">{confidencePercent}%</span>
        </div>
        <Progress value={confidencePercent} className="h-2" />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Key Factors</h4>
        <div className="space-y-3">
          {analysis.key_factors.map((factor, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{factor.factor}</span>
                <span className={cn(
                  "text-sm font-medium",
                  factor.impact === 'positive' ? "text-green-600" : 
                  factor.impact === 'negative' ? "text-red-600" : 
                  "text-yellow-600"
                )}>
                  {(factor.weight * 100).toFixed(0)}% Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Summary</h4>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      <div className="pt-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Recommendation</span>
          <span className={cn(
            "text-lg font-semibold",
            getRecommendationColor()
          )}>
            {analysis.recommendation.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>
      </div>
    </Card>
  );
}
