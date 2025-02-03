'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
  last_update: string;
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsComparisonProps {
  eventId: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
}

const formatOddsAmerican = (decimal: number): string => {
  if (decimal >= 2) {
    return '+' + Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1)).toString();
  }
};

const calculateImpliedProbability = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100) * 100;
  } else {
    return (-americanOdds) / (-americanOdds + 100) * 100;
  }
};

const calculateValue = (bestOdds: number, avgOdds: number): number => {
  const bestProb = 1 / bestOdds;
  const avgProb = 1 / avgOdds;
  return ((avgProb - bestProb) / avgProb) * 100;
};

const BetTypeExplanation = {
  moneyline: "A straight-up bet on which team will win. +150 means bet $100 to win $150, -150 means bet $150 to win $100.",
  spread: "A bet on the margin of victory. The favorite gives points (-7.5) while the underdog gets points (+7.5).",
  totals: "A bet on the combined score of both teams. Bet over or under a set number."
};

export const OddsComparison = memo(function OddsComparison({
  eventId,
  sportKey,
  homeTeam,
  awayTeam,
}: OddsComparisonProps) {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'moneyline' | 'spread' | 'totals'>('moneyline');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchOdds = async () => {
      if (!eventId || !sportKey) return;
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/event-odds?eventId=${eventId}&sport=${sportKey}`);
        if (!response.ok) throw new Error('Failed to fetch odds');
        const data = await response.json();
        setBookmakers(data.bookmakers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load odds');
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [eventId, sportKey]);

  const oddsData = useMemo(() => {
    if (!bookmakers.length) return null;

    const marketKey = selectedBetType === 'moneyline' ? 'h2h' : 
                     selectedBetType === 'spread' ? 'spreads' : 'totals';

    const allOdds = bookmakers.map(book => {
      const market = book.markets.find(m => m.key === marketKey);
      if (!market) return null;

      return {
        bookmaker: book.title,
        odds: market.outcomes.map(outcome => ({
          name: outcome.name,
          price: outcome.price,
          point: outcome.point
        }))
      };
    }).filter((book): book is NonNullable<typeof book> => book !== null);

    const bestOdds = allOdds.reduce((best, current) => {
      current?.odds.forEach(odd => {
        if (!best[odd.name] || odd.price > best[odd.name].price) {
          best[odd.name] = {
            price: odd.price,
            bookmaker: current.bookmaker,
            point: odd.point
          };
        }
      });
      return best;
    }, {} as Record<string, { price: number; bookmaker: string; point?: number }>);

    const avgOdds = allOdds.reduce((avg, current) => {
      current?.odds.forEach(odd => {
        if (!avg[odd.name]) {
          avg[odd.name] = { sum: 0, count: 0 };
        }
        avg[odd.name].sum += odd.price;
        avg[odd.name].count++;
      });
      return avg;
    }, {} as Record<string, { sum: number; count: number }>);

    return { allOdds, bestOdds, avgOdds };
  }, [bookmakers, selectedBetType]);

  if (!eventId || !sportKey) return null;
  if (loading) return <div className="animate-pulse">Loading odds comparison...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!oddsData) return <div>No odds available</div>;

  const { allOdds, bestOdds, avgOdds } = oddsData;

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Best Available Odds</CardTitle>
            <Info 
              className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setShowExplanation(!showExplanation)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedBetType === 'moneyline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBetType('moneyline')}
              className="text-xs px-2 py-1"
            >
              Moneyline
            </Button>
            <Button
              variant={selectedBetType === 'spread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBetType('spread')}
              className="text-xs px-2 py-1"
            >
              Spread
            </Button>
            <Button
              variant={selectedBetType === 'totals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBetType('totals')}
              className="text-xs px-2 py-1"
            >
              Totals
            </Button>
          </div>
        </div>
        {showExplanation && (
          <CardDescription className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
            {BetTypeExplanation[selectedBetType]}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['away', 'home'].map((side) => {
              const team = side === 'away' ? awayTeam : homeTeam;
              const odds = bestOdds[team];
              if (!odds) return null;

              const avgOdd = avgOdds[team];
              const avgPrice = avgOdd ? avgOdd.sum / avgOdd.count : 0;
              const value = calculateValue(odds.price, avgPrice);
              const impliedProb = calculateImpliedProbability(parseFloat(formatOddsAmerican(odds.price)));

              return (
                <Card key={side} className="border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-gray-600">{team}</h3>
                        <div className="text-2xl font-bold mt-1">
                          {formatOddsAmerican(odds.price)}
                          {odds.point !== undefined && (
                            <span className="text-sm ml-1 text-gray-500">
                              ({odds.point > 0 ? '+' : ''}{odds.point})
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={value > 5 ? 'default' : 'secondary'} className="ml-2">
                        {value > 0 ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {value.toFixed(1)}% value
                          </div>
                        ) : 'Fair odds'}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span>Best odds @ {odds.bookmaker}</span>
                        <span>{impliedProb.toFixed(1)}% implied probability</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">
              {showAllBooks ? 'All available odds' : 'View all sportsbook odds'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllBooks(!showAllBooks)}
              className="text-xs"
            >
              {showAllBooks ? (
                <div className="flex items-center gap-1">
                  <span>Hide</span>
                  <ChevronUp className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Show All</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>

          {showAllBooks && (
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Sportsbook</TableHead>
                    <TableHead className="text-right font-medium">{awayTeam}</TableHead>
                    <TableHead className="text-right font-medium">{homeTeam}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOdds.map((book, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{book.bookmaker}</TableCell>
                      {book.odds.map((odd, i) => (
                        <TableCell 
                          key={i} 
                          className={`text-right ${
                            bestOdds[odd.name]?.price === odd.price ? 'font-bold text-green-600' : ''
                          }`}
                        >
                          {formatOddsAmerican(odd.price)}
                          {odd.point !== undefined && (
                            <span className="text-xs ml-1 text-gray-500">
                              ({odd.point > 0 ? '+' : ''}{odd.point})
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
