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
        return 'text-emerald-500';
      case 'lean_over':
        return 'text-emerald-500';
      case 'neutral':
        return 'text-amber-500';
      case 'lean_under':
        return 'text-red-500';
      case 'strong_under':
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  };
  
  const getRiskColor = () => {
    switch (analysis.risk_level) {
      case 'low':
        return 'text-emerald-500';
      case 'medium':
        return 'text-amber-500';
      case 'high':
        return 'text-red-500';
    }
  };

  return (
    <Card className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Analysis Result</h3>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium bg-gray-900/30",
            getRiskColor()
          )}>
            {analysis.risk_level.toUpperCase()} RISK
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Confidence</span>
          <span className="text-sm text-muted-foreground">{confidencePercent}%</span>
        </div>
        <Progress 
          value={confidencePercent} 
          className="bg-gray-900/30" 
          indicatorClassName="bg-amber-500" 
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Key Factors</h4>
        <div className="space-y-3">
          {analysis.key_factors.map((factor, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{factor.factor}</span>
                <span className={cn(
                  "text-sm font-medium",
                  factor.impact === 'positive' ? "text-emerald-500" : 
                  factor.impact === 'negative' ? "text-red-500" : 
                  "text-amber-500"
                )}>
                  {(factor.weight * 100).toFixed(0)}% Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Summary</h4>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Recommendation</span>
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
