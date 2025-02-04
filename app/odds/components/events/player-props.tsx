'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { MARKETS_CONFIG } from '@/app/odds/constants/markets';

interface Market {
  key: string;
  outcomes: Array<{
    name: string;
    description: string;
    price: number;
    point?: number;
  }>;
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface PlayerPropsProps {
  sportKey: string;
  eventId: string;
  isOpen: boolean;
}

function formatMarketName(key: string): string {
  return key
    .replace(/^player_|^batter_|^pitcher_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function PlayerProps({ sportKey, eventId, isOpen }: PlayerPropsProps) {
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [oddsData, setOddsData] = useState<{ bookmakers: Bookmaker[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerProps() {
      if (!selectedMarket) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/playerProps?eventId=${eventId}&sportKey=${sportKey}&marketKey=${selectedMarket}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch player props');
        }
        
        const data = await response.json();
        setOddsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch player props');
        console.error('Error fetching player props:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerProps();
  }, [eventId, sportKey, selectedMarket]);
  
  if (!isOpen) return null;

  // Get available markets for this sport
  const sport = sportKey.includes('_') ? sportKey : 'soccer';
  const sportMarkets = MARKETS_CONFIG[sport];
  
  if (!sportMarkets) {
    return (
      <Card className="mt-4 p-4 text-center text-gray-600">
        No player props available for this sport
      </Card>
    );
  }

  // Combine all available markets
  const availableMarkets = [
    ...(sportMarkets.regular || []),
    ...(sportMarkets.alternate || []),
    ...(sportMarkets.other || [])
  ];

  if (loading) {
    return (
      <Card className="mt-4 p-4 text-center">
        Loading player props...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 p-4 text-center text-red-600">
        Error: {error}
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-lg font-semibold">Player Props</h3>
        <Select
          value={selectedMarket}
          onValueChange={setSelectedMarket}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a prop type" />
          </SelectTrigger>
          <SelectContent>
            {availableMarkets.map(market => (
              <SelectItem key={market} value={market}>
                {formatMarketName(market)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMarket && oddsData && (
        <div className="px-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bookmaker</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Choice</TableHead>
                <TableHead className="text-right">Line</TableHead>
                <TableHead className="text-right">Odds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oddsData.bookmakers.map((bookmaker) => {
                const market = bookmaker.markets.find(m => m.key === selectedMarket);
                if (!market) return null;

                return market.outcomes.map((outcome, index) => (
                  <TableRow key={`${bookmaker.key}-${outcome.name}-${index}`}>
                    <TableCell className="font-medium">{bookmaker.title}</TableCell>
                    <TableCell>{outcome.description}</TableCell>
                    <TableCell>{outcome.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {outcome.point !== undefined ? outcome.point : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
