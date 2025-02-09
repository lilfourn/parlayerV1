'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import type { AnalysisResponse, ProcessedProjection } from '@/app/types/props';
import { getRecommendationColor, getRecommendationIcon, getRiskLevelColor, getRecommendationDisplay } from '@/app/lib/analysis-utils';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
  projection: ProcessedProjection;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export function AnalysisResults({ analysis, projection, onReanalyze, isAnalyzing }: AnalysisResultsProps) {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header with Reanalyze Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onReanalyze}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Analyzing..." : "Reanalyze"}
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent pr-4">
            {/* Recommendation and Risk Level */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
                getRecommendationColor(analysis.recommendation)
              )}>
                {getRecommendationIcon(analysis.recommendation)}
                <span className="font-medium">
                  {getRecommendationDisplay(analysis.recommendation)}
                </span>
              </div>
              {analysis.risk_level && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-7 px-3",
                    getRiskLevelColor(analysis.risk_level)
                  )}
                >
                  {analysis.risk_level.toUpperCase()} RISK
                </Badge>
              )}
            </div>

            {/* Confidence */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Confidence</h4>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={cn(
                    "rounded-full h-2 transition-all duration-500",
                    analysis.confidence >= 0.7 ? "bg-emerald-500" :
                    analysis.confidence >= 0.4 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${analysis.confidence * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round(analysis.confidence * 100)}% confidence in this analysis
              </p>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Summary</h4>
                <p className="text-sm leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Key Factors */}
            {analysis.key_factors && analysis.key_factors.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Key Factors</h4>
                <div className="space-y-3">
                  {analysis.key_factors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "shrink-0",
                          factor.impact === 'positive' && "border-emerald-500 text-emerald-500",
                          factor.impact === 'negative' && "border-red-500 text-red-500",
                          factor.impact === 'neutral' && "border-yellow-500 text-yellow-500"
                        )}
                      >
                        {factor.weight}%
                      </Badge>
                      <p className="text-sm">{factor.factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
