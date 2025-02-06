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

interface APIError {
  error: string;
  code?: string;
}

function formatOdds(price: number): string {
  if (price > 0) return `+${price}`;
  return price.toString();
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

      // Ensure each event has a bookmakers array, even if empty
      const eventsWithBookmakers = data.map(event => ({
        ...event,
        bookmakers: event.bookmakers || []
      }));

      setEvents(eventsWithBookmakers);
      setTotalPages(total);
      
      if (data.length === 0) {
        setError('No events found for this sport in the selected date range');
      }
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
    if (selectedSport) {
      fetchEvents(selectedSport, currentPage);
    }
  }, [selectedSport, currentPage, fetchEvents]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-[120px] w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-destructive">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-6 hover:bg-accent/5 transition-colors">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {event.home_team} vs {event.away_team}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.commence_time), 'PPP p')}
                  </p>
                </div>
                <Badge variant="secondary" className="text-blue-500 bg-blue-50">
                  {event.sport_title}
                </Badge>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px]">Bookmaker</TableHead>
                    <TableHead className="text-right">{event.home_team}</TableHead>
                    <TableHead className="text-right">{event.away_team}</TableHead>
                    <TableHead className="text-right w-[150px]">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(event.bookmakers || []).map((bookmaker) => {
                    const market = bookmaker.markets?.find(m => m.key === 'h2h');
                    if (!market) return null;

                    const homeOdds = market.outcomes?.find(o => o.name === event.home_team)?.price;
                    const awayOdds = market.outcomes?.find(o => o.name === event.away_team)?.price;

                    return (
                      <TableRow key={bookmaker.key} className="hover:bg-transparent">
                        <TableCell className="font-medium">{bookmaker.title}</TableCell>
                        <TableCell className="text-right font-mono">
                          {homeOdds ? formatOdds(homeOdds) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {awayOdds ? formatOdds(awayOdds) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {format(new Date(bookmaker.last_update), 'p')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!event.bookmakers || event.bookmakers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No odds data available for this event
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
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
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