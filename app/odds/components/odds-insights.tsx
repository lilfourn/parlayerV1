'use client';

import { memo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PlayerInsights } from './player-insights';

interface OddsData {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsInsightsProps {
  sportKey: string;
}

interface MarketInsight {
  bookmaker: string;
  outcomes: {
    name: string;
    price: number;
    point?: number;
    impliedProbability: number;
    marketEfficiency: number;
  }[];
}

interface BestOdd {
  name: string;
  price: string;
}

const calculateImpliedProbability = (decimal: number): number => {
  return (1 / decimal) * 100;
};

const formatOddsAmerican = (decimal: number): string => {
  if (decimal >= 2) {
    return '+' + Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1)).toString();
  }
};

const calculateMarketEfficiency = (probabilities: number[]): number => {
  return probabilities.reduce((sum, prob) => sum + prob, 0);
};

const calculateValueBet = (impliedProb: number, marketProb: number): number => {
  return ((marketProb - impliedProb) / marketProb) * 100;
};

export const OddsInsights = memo(function OddsInsights({ sportKey }: OddsInsightsProps) {
  const [oddsData, setOddsData] = useState<OddsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOdds = async () => {
      if (!sportKey) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/odds-by-sport?sport=${sportKey}`);
        if (!response.ok) throw new Error('Failed to fetch odds');
        const data = await response.json();
        setOddsData(data);
        // Initialize first event as open
        if (data.length > 0) {
          setOpenEvents({ [data[0].id]: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load odds');
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [sportKey]);

  const toggleEvent = (eventId: string) => {
    setOpenEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  if (!sportKey) return null;
  if (loading) return <div className="animate-pulse">Loading odds insights...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!oddsData.length) return <div>No odds data available</div>;

  const getMarketInsights = (event: OddsData): { [key: string]: MarketInsight[] } => {
    const insights: { [key: string]: MarketInsight[] } = {
      moneyline: [],
      spreads: [],
      totals: []
    };

    event.bookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        const marketType = market.key;
        if (!insights[marketType]) return;

        const probabilities = market.outcomes.map(outcome => calculateImpliedProbability(outcome.price));
        const marketEfficiency = calculateMarketEfficiency(probabilities);
        
        insights[marketType].push({
          bookmaker: bookmaker.title,
          outcomes: market.outcomes.map((outcome, index) => ({
            name: outcome.name,
            price: outcome.price,
            point: outcome.point,
            impliedProbability: probabilities[index],
            marketEfficiency
          }))
        });
      });
    });

    return insights;
  };

  return (
    <div className="space-y-4">
      {oddsData.map((event) => {
        const insights = getMarketInsights(event);
        const startTime = new Date(event.commence_time);
        const isOpen = openEvents[event.id];

        // Get best odds for quick view
        const bestMoneylineOdds = insights.moneyline.reduce<BestOdd[] | null>((best, current) => {
          const currentBest = current.outcomes.map(o => ({
            name: o.name,
            price: formatOddsAmerican(o.price)
          }));
          if (!best) return currentBest;
          return best;
        }, null);

        return (
          <Collapsible
            key={event.id}
            open={isOpen}
            onOpenChange={() => toggleEvent(event.id)}
          >
            <Card className={`bg-white shadow-sm transition-shadow ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {event.away_team} @ {event.home_team}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                    {!isOpen && bestMoneylineOdds && (
                      <div className="flex items-center gap-4 text-sm">
                        {bestMoneylineOdds.map((odd: BestOdd, idx: number) => (
                          <div key={idx} className="flex flex-col items-end">
                            <span className="text-gray-600">{odd.name}</span>
                            <span className="font-semibold">{odd.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent>
                  <Tabs defaultValue="moneyline" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <div className="flex items-center">
                        <TabsTrigger value="moneyline">Moneyline</TabsTrigger>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 inline-flex items-center justify-center">
                                <Info className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Straight bet on which team will win</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center">
                        <TabsTrigger value="spreads">Spread</TabsTrigger>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 inline-flex items-center justify-center">
                                <Info className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Bet on the margin of victory</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center">
                        <TabsTrigger value="totals">Totals</TabsTrigger>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 inline-flex items-center justify-center">
                                <Info className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Bet on combined score of both teams</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center">
                        <TabsTrigger value="players">Players</TabsTrigger>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 inline-flex items-center justify-center">
                                <Info className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View player statistics and props</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TabsList>

                    {(['moneyline', 'spreads', 'totals', 'players'] as const).map(marketType => (
                      <TabsContent key={marketType} value={marketType}>
                        {marketType === 'players' ? (
                          <PlayerInsights sportKey={sportKey} eventId={event.id} />
                        ) : (
                          <div className="mt-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Sportsbook</TableHead>
                                  {insights[marketType][0]?.outcomes.map((outcome: any) => (
                                    <TableHead key={outcome.name} className="text-right">
                                      {outcome.name}
                                      {outcome.point !== undefined && ` (${outcome.point > 0 ? '+' : ''}${outcome.point})`}
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Market Efficiency</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {insights[marketType].map((insight: any, idx: number) => {
                                  const marketEfficiency = insight.outcomes[0].marketEfficiency;
                                  const isEfficient = Math.abs(100 - marketEfficiency) < 2;

                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">
                                        {insight.bookmaker}
                                      </TableCell>
                                      {insight.outcomes.map((outcome: any) => (
                                        <TableCell key={outcome.name} className="text-right">
                                          <div className="flex flex-col items-end">
                                            <span className="font-semibold">
                                              {formatOddsAmerican(outcome.price)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              {outcome.impliedProbability.toFixed(1)}%
                                            </span>
                                          </div>
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-right">
                                        <Badge 
                                          variant={isEfficient ? "default" : "destructive"}
                                          className="ml-2"
                                        >
                                          <div className="flex items-center gap-1">
                                            {isEfficient ? (
                                              <TrendingUp className="h-3 w-3" />
                                            ) : (
                                              <TrendingDown className="h-3 w-3" />
                                            )}
                                            {marketEfficiency.toFixed(1)}%
                                          </div>
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>

                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                Betting Insights
                              </h4>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Market Efficiency: Shows how well-priced the market is. 100% indicates a perfectly efficient market.</li>
                                <li>• Implied Probability: The likelihood of an outcome based on the odds.</li>
                                <li>• American Odds: +150 means bet $100 to win $150, -150 means bet $150 to win $100.</li>
                                {marketType === 'spreads' && (
                                  <li>• Spread numbers indicate the points added or subtracted from a team's final score.</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
});
