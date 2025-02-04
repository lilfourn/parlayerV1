'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EventOdds } from './event-odds';
import { Skeleton } from '@/components/ui/skeleton';

interface Event {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
}

interface EventsListProps {
  selectedSport?: string;
}

export function EventsList({ selectedSport }: EventsListProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [oddsData, setOddsData] = useState<{ [key: string]: any }>({});
  const [loadingOdds, setLoadingOdds] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events${selectedSport ? `?sport=${selectedSport}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [selectedSport]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  if (!events.length) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-500">No events found{selectedSport ? ` for ${selectedSport}` : ''}.</p>
      </Card>
    );
  }

  const toggleEvent = async (eventId: string, sportKey: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    setExpandedEventId(eventId);

    // Only fetch if we don't have the odds data yet
    if (!oddsData[eventId]) {
      try {
        setLoadingOdds(prev => ({ ...prev, [eventId]: true }));
        setErrors(prev => ({ ...prev, [eventId]: '' }));

        const response = await fetch(`/api/eventOdds?eventId=${eventId}&sportKey=${sportKey}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch odds');
        }

        setOddsData(prev => ({ ...prev, [eventId]: data }));
      } catch (error) {
        console.error('Error fetching odds:', error);
        setErrors(prev => ({
          ...prev,
          [eventId]: error instanceof Error ? error.message : 'Failed to fetch odds'
        }));
      } finally {
        setLoadingOdds(prev => ({ ...prev, [eventId]: false }));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isExpanded = expandedEventId === event.id;
        const isLoading = loadingOdds[event.id];
        const error = errors[event.id];
        const currentOddsData = oddsData[event.id];

        return (
          <Card key={event.id} className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-between font-normal"
              onClick={() => toggleEvent(event.id, event.sport_key)}
            >
              <div className="flex flex-col items-start text-left">
                <div className="font-semibold">
                  {event.home_team} vs {event.away_team}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(event.commence_time)}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {isLoading && (
              <div className="mt-4 px-4">
                <Skeleton className="h-[150px] w-full" />
              </div>
            )}

            {error && (
              <div className="mt-4 px-4 text-center text-red-600">
                {error}
              </div>
            )}

            {!isLoading && !error && currentOddsData && (
              <EventOdds
                sportKey={event.sport_key}
                event={event}
                oddsData={currentOddsData}
                isOpen={isExpanded}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
