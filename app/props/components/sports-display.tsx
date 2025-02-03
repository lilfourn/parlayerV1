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

interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

interface SportsDisplayProps {
  onSportSelect?: (sportKey: string) => void;
  selectedSport?: string | null;
}

// Sport configuration with icons
const SPORT_ICONS: Record<string, string> = {
  'americanfootball': '🏈',
  'basketball': '🏀',
  'baseball': '⚾',
  'icehockey': '🏒',
  'soccer': '⚽',
  'mma': '🥊',
  'golf': '⛳',
  'tennis': '🎾',
  'motorracing': '🏎️',
};

const getSportIcon = (sportKey: string): string => {
  const sportType = sportKey.split('_')[0];
  return SPORT_ICONS[sportType] || '🎮';
};

export const SportsDisplay = memo(function SportsDisplay({ 
  onSportSelect,
  selectedSport 
}: SportsDisplayProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('/api/sports');
        if (!response.ok) throw new Error('Failed to fetch sports');
        const data = await response.json();
        setSports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sports');
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  if (loading) return <div>Loading sports...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-bold">Available Sports</Label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sport</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sports.map((sport) => (
            <TableRow 
              key={sport.key}
              className={`${onSportSelect ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                selectedSport === sport.key ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSportSelect?.(sport.key)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{getSportIcon(sport.key)}</span>
                  <span>{sport.key}</span>
                </div>
              </TableCell>
              <TableCell>{sport.title}</TableCell>
              <TableCell>{sport.group}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  sport.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {sport.active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
