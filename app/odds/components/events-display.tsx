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
import { OddsComparison } from './odds-comparison';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from 'lucide-react';

interface Event {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed: boolean;
}

interface EventsDisplayProps {
  sportKey: string | null;
}

export const EventsDisplay = memo(function EventsDisplay({ sportKey }: EventsDisplayProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!sportKey) return;
      
      setLoading(true);
      setError(null);
      setSelectedEvent(null);
      
      try {
        const response = await fetch(`/api/events?sport=${sportKey}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sportKey]);

  if (!sportKey) return null;
  if (loading) return <div className="animate-pulse">Loading events...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (events.length === 0) return <div>No events found for this sport</div>;

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => {
          const { date, time } = formatEventDate(event.commence_time);
          const isSelected = selectedEvent?.id === event.id;
          
          return (
            <Card 
              key={event.id}
              className={`transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-200'
              }`}
            >
              <CardHeader className="cursor-pointer" onClick={() => setSelectedEvent(isSelected ? null : event)}>
                <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {event.away_team} @ {event.home_team}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        event.completed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.completed ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isSelected && (
                <CardContent className="pt-4 pb-6">
                  <OddsComparison 
                    eventId={event.id}
                    sportKey={sportKey}
                    homeTeam={event.home_team}
                    awayTeam={event.away_team}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
});
