'use client';

import { memo, useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface OddsDisplayProps {
  eventId: string;
  sportKey: string;
}

const formatOddsAmerican = (decimal: number): string => {
  if (decimal >= 2) {
    return '+' + Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1)).toString();
  }
};

const MarketDisplay = memo(function MarketDisplay({ market, title }: { market: Market, title: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Selection</TableHead>
            <TableHead>Odds</TableHead>
            {market.outcomes.some(o => o.point !== undefined) && (
              <TableHead>Line</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {market.outcomes.map((outcome) => (
            <TableRow key={outcome.name}>
              <TableCell>{outcome.name}</TableCell>
              <TableCell>{formatOddsAmerican(outcome.price)}</TableCell>
              {market.outcomes.some(o => o.point !== undefined) && (
                <TableCell>{outcome.point}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export const OddsDisplay = memo(function OddsDisplay({ 
  eventId,
  sportKey
}: OddsDisplayProps) {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!eventId || !sportKey) return null;
  if (loading) return <div>Loading odds...</div>;
  if (error) return <div>Error: {error}</div>;
  if (bookmakers.length === 0) return <div>No odds available for this event</div>;

  return (
    <div className="space-y-6">
      <Label className="text-lg font-bold">Available Odds</Label>
      
      {bookmakers.map((bookmaker) => (
        <div key={bookmaker.key} className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">{bookmaker.title}</h2>
          
          {bookmaker.markets
            .filter(market => ['h2h', 'spreads', 'totals'].includes(market.key))
            .map(market => (
              <MarketDisplay 
                key={market.key} 
                market={market}
                title={
                  market.key === 'h2h' ? 'Moneyline' :
                  market.key === 'spreads' ? 'Point Spread' :
                  market.key === 'totals' ? 'Totals' : 
                  market.key
                }
              />
            ))}
        </div>
      ))}
    </div>
  );
});
