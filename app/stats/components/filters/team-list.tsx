'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  shortName: string;
  abbrev: string;
  logo: string;
  logoDark: string;
  conference: string;
  division: string;
}

interface TeamListProps {
  onTeamSelect: (teamId: string) => void;
  selectedTeamId?: string;
  selectedSport?: string;
}

export function TeamList({ onTeamSelect, selectedTeamId, selectedSport }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      if (selectedSport !== 'NBA') {
        setTeams([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/NBA-stats/player-info/team');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        if (data.status === 'success' && Array.isArray(data.response?.teamList)) {
          // Sort teams by conference and division
          const sortedTeams = [...data.response.teamList].sort((a, b) => {
            if (a.conference !== b.conference) {
              return a.conference.localeCompare(b.conference);
            }
            if (a.division !== b.division) {
              return a.division.localeCompare(b.division);
            }
            return a.name.localeCompare(b.name);
          });
          setTeams(sortedTeams);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to fetch teams');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeams();
  }, [selectedSport]);

  const handleTeamSelect = (teamId: string) => {
    // Log the selected team for debugging
    const selectedTeam = teams.find(team => team.id === teamId);
    console.log('Selected team:', selectedTeam?.name, 'ID:', teamId);
    onTeamSelect(teamId);
  };

  if (!selectedSport || selectedSport !== 'NBA') {
    return (
      <div className="text-center text-muted-foreground py-4">
        Select NBA to view teams
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen w-full p-4">
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : teams.length === 0 ? (
          <div className="text-center text-muted-foreground">No teams found</div>
        ) : (
          // Group teams by conference and division
          Object.entries(
            teams.reduce<Record<string, Record<string, Team[]>>>((acc, team) => {
              if (!acc[team.conference]) {
                acc[team.conference] = {};
              }
              if (!acc[team.conference][team.division]) {
                acc[team.conference][team.division] = [];
              }
              acc[team.conference][team.division].push(team);
              return acc;
            }, {})
          ).map(([conference, divisions]) => (
            <div key={conference} className="space-y-4">
              <h3 className="font-semibold text-lg">{conference} Conference</h3>
              {Object.entries(divisions).map(([division, divisionTeams]) => (
                <div key={division} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{division} Division</h4>
                  {divisionTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className={cn(
                        "flex items-center space-x-4 w-full p-2 rounded-lg transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedTeamId === team.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="object-contain"
                        />
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {team.shortName} ({team.id})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}