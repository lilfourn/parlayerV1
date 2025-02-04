'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Clock } from 'lucide-react';

interface Event {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: any[];
}

interface EventsListProps {
  selectedSport?: string;
}

export const EventsList = memo(function EventsList({ selectedSport }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (sport: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/events?sport=${sport}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchEvents(selectedSport);
    } else {
      setEvents([]);
    }
  }, [selectedSport, fetchEvents]);

  if (!selectedSport) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-600">
          Select a sport to view available events
        </h3>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium text-red-600">
          Error loading events
        </h3>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-600">
          No events available for this sport
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Check back later for upcoming events
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{event.sport_title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(event.commence_time).toLocaleDateString()}
                </span>
                <Clock className="h-4 w-4 ml-2" />
                <span>
                  {new Date(event.commence_time).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">Home: {event.home_team}</p>
                <p className="text-sm font-medium">Away: {event.away_team}</p>
              </div>
              {event.bookmakers && event.bookmakers.length > 0 && (
                <div className="text-sm text-gray-500">
                  {event.bookmakers.length} bookmaker{event.bookmakers.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});
