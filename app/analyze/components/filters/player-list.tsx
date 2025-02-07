'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: string;
}

interface PlayerListProps {
  selectedTeamId?: string;
}

export function PlayerList({ selectedTeamId }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      if (!selectedTeamId) {
        setPlayers([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/NBA-stats/player-info/all-players?teamId=${selectedTeamId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }

        const data = await response.json();
        if (data.status === "success" && data.response?.PlayerList) {
          setPlayers(data.response.PlayerList);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        setError('Failed to fetch players');
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlayers();
  }, [selectedTeamId]);

  if (!selectedTeamId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Select a team to view players
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Team Roster</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm font-medium">
                    {player.jersey_number || '#'}
                  </div>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="secondary" className="w-fit">
                    {player.position}
                  </Badge>
                </div>
              </div>
            ))}
            {players.length === 0 && !isLoading && !error && (
              <div className="col-span-full text-center text-muted-foreground py-4">
                No players found for this team
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}