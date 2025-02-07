'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { memo, useEffect, useState } from 'react';

interface Team {
  id: string;
  name: string;
  abbreviation: string;
  conference: string;
  division: string;
}

export interface TeamListProps {
  onTeamSelect?: (teamId: string) => void;
  selectedTeamId?: string;
  selectedSport?: string;
}

export const TeamList = memo(function TeamList({
  onTeamSelect,
  selectedTeamId,
  selectedSport
}: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/NBA-stats/player-info/team');
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data.teams);
        setError(null);
      } catch (err) {
        setError('Failed to load teams');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedSport === 'basketball_nba') {
      fetchTeams();
    } else {
      setTeams([]);
      setLoading(false);
    }
  }, [selectedSport]);

  // If not NBA, don't show anything
  if (selectedSport !== 'basketball_nba') {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select NBA to view teams
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="space-y-2">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          {/* Eastern Conference */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Eastern Conference</h3>
            <div className="space-y-1">
              {teams
                .filter(team => team.conference === 'Eastern')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(team => (
                  <button
                    key={team.id}
                    onClick={() => onTeamSelect?.(team.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors
                      ${selectedTeamId === team.id 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    <span className="font-medium">{team.abbreviation}</span>
                    <span className="ml-2 text-xs opacity-80">{team.name}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Western Conference */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Western Conference</h3>
            <div className="space-y-1">
              {teams
                .filter(team => team.conference === 'Western')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(team => (
                  <button
                    key={team.id}
                    onClick={() => onTeamSelect?.(team.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors
                      ${selectedTeamId === team.id 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    <span className="font-medium">{team.abbreviation}</span>
                    <span className="ml-2 text-xs opacity-80">{team.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
});