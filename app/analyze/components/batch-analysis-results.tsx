'use client';

import { AnalysisResponse, ProcessedProjection } from "@/app/types/props";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface BatchAnalysisResult {
  analysis: AnalysisResponse;
  projection: ProcessedProjection;
  isError?: boolean;
}

interface BatchAnalysisResultsProps {
  results: BatchAnalysisResult[];
  isAnalyzing: boolean;
}

type RecommendationType = AnalysisResponse['recommendation'];

function getRecommendationColor(recommendation: RecommendationType | undefined): string {
  if (!recommendation) return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
  
  const colorMap: Record<string, string> = {
    'strong_over': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    'lean_over': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    'strong_under': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'lean_under': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'neutral': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
  };

  return colorMap[recommendation.toLowerCase()] || colorMap.neutral;
}

function formatRecommendation(recommendation: RecommendationType | undefined): string {
  if (!recommendation) return 'No recommendation';
  return recommendation.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getConfidenceIcon(confidence: number) {
  if (confidence >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (confidence >= 50) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export function BatchAnalysisResults({ results, isAnalyzing }: BatchAnalysisResultsProps) {
  if (results.length === 0 && !isAnalyzing) return null;

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Batch Analysis Results</h3>
            {isAnalyzing && (
              <div className="text-sm text-muted-foreground">
                Analyzing {results.length} projections...
              </div>
            )}
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-6">
                    {result.isError ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span>Analysis failed for this projection</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {result.projection.player?.attributes.display_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {result.projection.projection.attributes.stat_type} {result.projection.projection.attributes.line_score}
                            </span>
                          </div>
                          <div className={cn("px-3 py-1 rounded-full text-sm", 
                            getRecommendationColor(result.analysis?.recommendation))}>
                            {formatRecommendation(result.analysis?.recommendation)}
                          </div>
                        </div>
                        
                        {result.analysis?.key_factors && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Key Factors:</h4>
                            {result.analysis.key_factors.map((factor, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {factor.impact === 'positive' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : factor.impact === 'negative' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <div className="h-4 w-4" />
                                )}
                                <span className="text-sm">{factor.factor}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
