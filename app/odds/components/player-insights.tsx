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
import { UserRound, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerProp {
  name: string;
  value: number;
  bookmakerOdds: {
    bookmaker: string;
    price: number;
  }[];
}

interface PlayerData {
  id: string;
  name: string;
  position?: string;
  team: string;
  statistics?: {
    [key: string]: number | string;
  };
  props?: PlayerProp[];
}

interface PlayerInsightsProps {
  sportKey: string;
  eventId: string;
}

export const PlayerInsights = memo(function PlayerInsights({ sportKey, eventId }: PlayerInsightsProps) {
  const [playerData, setPlayerData] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!sportKey || !eventId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/players?sport=${sportKey}&eventId=${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch player data');
        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [sportKey, eventId]);

  if (!sportKey || !eventId) return null;
  if (loading) return <div className="animate-pulse">Loading player insights...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!playerData.length) return null;

  const formatOddsAmerican = (decimal: number): string => {
    if (decimal >= 2) {
      return '+' + Math.round((decimal - 1) * 100);
    } else {
      return Math.round(-100 / (decimal - 1)).toString();
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg font-semibold">Player Insights</CardTitle>
        </div>
        <CardDescription>
          View player statistics and proposition bets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {playerData.map((player) => (
              <div key={player.id} className="pb-4 border-b last:border-0">
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                  {player.name}
                  {player.position && (
                    <Badge variant="secondary" className="text-xs">
                      {player.position}
                    </Badge>
                  )}
                </h3>

                {player.statistics && Object.keys(player.statistics).length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Season Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Object.entries(player.statistics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-2 rounded-md">
                          <div className="text-xs text-gray-500">{key}</div>
                          <div className="text-sm font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {player.props && player.props.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Available Props</h4>
                    {player.props.map((prop, propIdx) => (
                      <div key={propIdx} className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{prop.name}</span>
                          <Badge variant="outline">Line: {prop.value}</Badge>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sportsbook</TableHead>
                              <TableHead className="text-right">Over</TableHead>
                              <TableHead className="text-right">Under</TableHead>
                              <TableHead className="text-right">Best Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prop.bookmakerOdds.map((odds, idx) => {
                              const americanOver = formatOddsAmerican(odds.price);
                              const americanUnder = formatOddsAmerican(odds.price);
                              const isBestOver = Math.max(...prop.bookmakerOdds.map(o => o.price)) === odds.price;
                              const isBestUnder = Math.min(...prop.bookmakerOdds.map(o => o.price)) === odds.price;

                              return (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {odds.bookmaker}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge 
                                      variant={isBestOver ? "default" : "secondary"}
                                      className={isBestOver ? "bg-green-500" : ""}
                                    >
                                      {americanOver}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge 
                                      variant={isBestUnder ? "default" : "secondary"}
                                      className={isBestUnder ? "bg-green-500" : ""}
                                    >
                                      {americanUnder}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {(isBestOver || isBestUnder) && (
                                      <TrendingUp className="inline-block h-4 w-4 text-green-500" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
