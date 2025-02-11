'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { PlayerProps } from './player-props';

interface Outcome {
  name: string;
  price: number;
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface OddsData {
  bookmakers: Bookmaker[];
}

interface EventOddsProps {
  sportKey: string;
  event: {
    id: string;
    home_team: string;
    away_team: string;
  };
  oddsData: OddsData;
  isOpen: boolean;
}

export function EventOdds({ sportKey, event, oddsData, isOpen }: EventOddsProps) {
  const [activeTab, setActiveTab] = useState('game');

  if (!isOpen) return null;

  return (
    <div className={cn(
      "mt-4 px-4 overflow-x-auto",
      isOpen ? "animate-in slide-in-from-top-2" : "animate-out slide-out-to-top-2"
    )}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
          <TabsTrigger 
            value="game" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Game Odds
          </TabsTrigger>
          <TabsTrigger 
            value="props"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Player Props
          </TabsTrigger>
        </TabsList>
        
        {activeTab === 'game' && (
          <TabsContent value="game" forceMount>
            <Table className="bg-gray-900/50">
              <TableHeader>
                <TableRow>
                  <TableHead>Bookmaker</TableHead>
                  <TableHead className="text-right">{event.home_team}</TableHead>
                  <TableHead className="text-right">{event.away_team}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oddsData.bookmakers.map((bookmaker) => {
                  const market = bookmaker.markets.find(m => m.key === 'h2h');
                  if (!market) return null;

                  const homeOdds = market.outcomes.find(o => 
                    o.name.toLowerCase() === event.home_team.toLowerCase()
                  )?.price;
                  const awayOdds = market.outcomes.find(o => 
                    o.name.toLowerCase() === event.away_team.toLowerCase()
                  )?.price;

                  return (
                    <TableRow key={bookmaker.key}>
                      <TableCell className="font-medium">{bookmaker.title}</TableCell>
                      <TableCell className="text-right font-mono">
                        {typeof homeOdds === 'number' ? (homeOdds > 0 ? `+${homeOdds}` : homeOdds) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {typeof awayOdds === 'number' ? (awayOdds > 0 ? `+${awayOdds}` : awayOdds) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        )}
        
        {activeTab === 'props' && (
          <TabsContent value="props" forceMount>
            <PlayerProps
              sportKey={sportKey}
              eventId={event.id}
              isOpen={isOpen}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
