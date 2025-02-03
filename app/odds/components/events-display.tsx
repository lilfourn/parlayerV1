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

  useEffect(() => {
    const fetchEvents = async () => {
      if (!sportKey) return;
      
      setLoading(true);
      setError(null);
      
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
  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-bold">Events for {events[0]?.sport_title || sportKey}</Label>
      </div>

      {events.length === 0 ? (
        <div>No events found for this sport</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teams</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">
                  {event.away_team} @ {event.home_team}
                </TableCell>
                <TableCell>
                  {new Date(event.commence_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    event.completed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {event.completed ? 'Completed' : 'Upcoming'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
});
