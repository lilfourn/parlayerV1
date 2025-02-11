'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EventOdds } from './event-odds';
import { TopPlayerOdds } from './top-player-odds';
import { Spinner } from '@/components/ui/spinner';

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
  onLoadingChange?: (isLoading: boolean) => void;
}

export function EventsList({ selectedSport, onLoadingChange }: EventsListProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [oddsData, setOddsData] = useState<{ [key: string]: any }>({});
  const [loadingOdds, setLoadingOdds] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      if (!selectedSport) return;
      
      setIsLoading(true);
      onLoadingChange?.(true);
      try {
        const response = await fetch(`/api/events?sport=${selectedSport}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]); 
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }

    fetchEvents();
  }, [selectedSport, onLoadingChange]);

  if (!selectedSport) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-slow blur-xl bg-amber-500/20 rounded-full" />
          <Spinner size="lg" className="relative" />
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <Card className="p-8 bg-gray-900/50">
        <p className="text-center text-gray-500">No events found for {selectedSport}.</p>
      </Card>
    );
  }

  const toggleEvent = async (eventId: string, sportKey: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    setExpandedEventId(eventId);

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
      {events.map((event) => (
        <Card key={event.id} className="p-4 bg-gray-900/50">
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
            {expandedEventId === event.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {loadingOdds[event.id] && (
            <div className="flex items-center justify-center p-4">
              <Spinner size="md" />
            </div>
          )}

          {errors[event.id] && (
            <div className="mt-4 px-4 text-center text-red-600">
              {errors[event.id]}
            </div>
          )}

          {!loadingOdds[event.id] && !errors[event.id] && oddsData[event.id] && (
            <div className="space-y-2">
              <EventOdds
                sportKey={event.sport_key}
                event={event}
                oddsData={oddsData[event.id]}
                isOpen={expandedEventId === event.id}
              />
              {expandedEventId === event.id && (
                <TopPlayerOdds
                  eventId={event.id}
                  sportKey={event.sport_key}
                />
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
