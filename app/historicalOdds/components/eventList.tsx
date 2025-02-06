'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Outcome {
  name: string;
  price: number;
}

interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

interface Event {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface PaginatedResponse {
  data: Event[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalEvents: number;
  timestamp: string;
}

interface TeamAbbreviations {
  [key: string]: string;
}

const CITY_ABBREVIATIONS: TeamAbbreviations = {
  'Los Angeles': 'LA',
  'New York': 'NY',
  'San Francisco': 'SF',
  'Golden State': 'GS',
  'Oklahoma City': 'OKC',
  'Portland Trail': 'POR',
  'New Orleans': 'NO',
} as const;

function formatOdds(price: number): string {
  return price > 0 ? `+${price}` : price.toString();
}

function abbreviateTeamName(name: string): string {
  const cityMatch = Object.entries(CITY_ABBREVIATIONS).find(([city]) => name.startsWith(city));
  if (cityMatch) return name.replace(cityMatch[0], cityMatch[1]).trim();

  const words = name.split(' ');
  return words.length === 1 
    ? name.slice(0, 3).toUpperCase() 
    : words.map(word => word[0]).join('').toUpperCase();
}

function EventLoadingSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-[100px] w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EventError({ message }: { message: string }) {
  return (
    <Card className="p-4">
      <div className="text-center">
        <p className="text-sm font-medium text-destructive">{message}</p>
      </div>
    </Card>
  );
}

function EventTableRow({ bookmaker, homeTeam, awayTeam }: { 
  bookmaker: Bookmaker; 
  homeTeam: string; 
  awayTeam: string;
}) {
  const market = bookmaker.markets?.find(m => m.key === 'h2h');
  if (!market) return null;

  const homeOdds = market.outcomes?.find(o => o.name === homeTeam)?.price;
  const awayOdds = market.outcomes?.find(o => o.name === awayTeam)?.price;

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-1.5 font-medium text-sm">{bookmaker.title}</TableCell>
      <TableCell className="py-1.5 text-right font-mono text-sm">
        {homeOdds ? formatOdds(homeOdds) : '-'}
      </TableCell>
      <TableCell className="py-1.5 text-right font-mono text-sm">
        {awayOdds ? formatOdds(awayOdds) : '-'}
      </TableCell>
      <TableCell className="py-1.5 text-right text-xs text-muted-foreground">
        {format(new Date(bookmaker.last_update), 'h:mm a')}
      </TableCell>
    </TableRow>
  );
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectedSport = searchParams.get('sport');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const fetchEvents = useCallback(async (sport: string, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        sport,
        page: page.toString()
      });

      if (startDate) queryParams.set('startDate', startDate);
      if (endDate) queryParams.set('endDate', endDate);
      
      const response = await axios.get<PaginatedResponse>(`/api/historicalEvents?${queryParams.toString()}`);
      const { data, totalPages: total } = response.data;

      setEvents(data.map(event => ({ ...event, bookmakers: event.bookmakers || [] })));
      setTotalPages(total);
      
      if (!data.length) setError('No events found for this sport in the selected date range');
    } catch (error) {
      console.error('Error fetching events:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch events';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedSport) fetchEvents(selectedSport, currentPage);
  }, [selectedSport, currentPage, fetchEvents]);

  if (isLoading) return <EventLoadingSkeleton />;
  if (error) return <EventError message={error} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {events.map((event) => (
          <Card key={event.id} className="p-4 hover:bg-accent/5 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {event.home_team} vs {event.away_team}
                    </h3>
                    <Badge variant="secondary" className="text-xs text-blue-500 bg-blue-50">
                      {event.sport_title}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.commence_time), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 w-[120px]">Book</TableHead>
                    <TableHead className="py-2 text-right w-[80px]">{abbreviateTeamName(event.home_team)}</TableHead>
                    <TableHead className="py-2 text-right w-[80px]">{abbreviateTeamName(event.away_team)}</TableHead>
                    <TableHead className="py-2 text-right w-[100px]">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.bookmakers.map((bookmaker) => (
                    <EventTableRow 
                      key={bookmaker.key}
                      bookmaker={bookmaker}
                      homeTeam={event.home_team}
                      awayTeam={event.away_team}
                    />
                  ))}
                  {!event.bookmakers.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-4">
                        No odds data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}