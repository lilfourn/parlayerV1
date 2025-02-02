'use client';

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ProjectionWithAttributes } from '@/types/props';

interface StatTypeNavProps {
  projectionData: ProjectionWithAttributes[];
  selectedStatType: string;
  onStatTypeChange: (statType: string) => void;
}

// Helper function to get all unique stat types
function getAllStatTypes(projections: ProjectionWithAttributes[]) {
  const statTypes = new Set<string>();
  
  projections.forEach(({ projection }) => {
    if (!projection) return;
    statTypes.add(projection.attributes.stat_type);
  });
  
  return Array.from(statTypes).sort();
}

// Helper function to get unique stat types by league
function getStatTypesByLeague(projections: ProjectionWithAttributes[]) {
  const statTypesByLeague = new Map<string, Set<string>>();
  
  projections.forEach(({ projection }) => {
    if (!projection) return;
    
    const league = projection.relationships.league.data.id;
    const statType = projection.attributes.stat_type;
    
    if (!statTypesByLeague.has(league)) {
      statTypesByLeague.set(league, new Set());
    }
    
    statTypesByLeague.get(league)?.add(statType);
  });
  
  return statTypesByLeague;
}

// Get a friendly display name for a stat type
function getStatTypeDisplayName(statType: string): string {
  const displayNames: Record<string, string> = {
    'points': 'Points',
    'rebounds': 'Rebounds',
    'assists': 'Assists',
    'threes': '3-Pointers Made',
    'blocks': 'Blocks',
    'steals': 'Steals',
    'turnovers': 'Turnovers',
    'fantasy_points': 'Fantasy Points',
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'receiving_yards': 'Receiving Yards',
    'touchdowns': 'Touchdowns',
    'receptions': 'Receptions',
    'goals': 'Goals',
    'saves': 'Saves',
    'shots_on_goal': 'Shots on Goal',
    'birdies': 'Birdies',
    'bogeys': 'Bogeys',
    'pars': 'Pars',
  };
  
  return displayNames[statType] || statType;
}

export const StatTypeNav = memo(function StatTypeNav({
  projectionData,
  selectedStatType,
  onStatTypeChange,
}: StatTypeNavProps) {
  const allStatTypes = getAllStatTypes(projectionData);
  const statTypesByLeague = getStatTypesByLeague(projectionData);
  
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={selectedStatType}
        onValueChange={onStatTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Stat Types">
            {selectedStatType ? getStatTypeDisplayName(selectedStatType) : 'All Stat Types'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Stat Types</SelectItem>
          {allStatTypes.map(statType => (
            <SelectItem key={statType} value={statType}>
              {getStatTypeDisplayName(statType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

StatTypeNav.displayName = 'StatTypeNav';
