'use client';

import { memo, useState, useMemo, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { type ProjectionWithAttributes } from '@/types/props';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerAvatar } from './player-avatar';
import { LeagueNav } from './league-nav';
import { PlayerSearch } from './player-search';

// League configuration with icons and display names
const LEAGUE_CONFIG = [
  // Basketball
  { id: 'NBA', name: 'NBA', icon: '🏀' },
  { id: 'NBA2H', name: 'NBA 2H', icon: '🏀' },
  { id: 'NBA1H', name: 'NBA 1H', icon: '🏀' },
  { id: 'NBA1Q', name: 'NBA 1Q', icon: '🏀' },
  { id: 'NBA4Q', name: 'NBA 4Q', icon: '🏀' },
  { id: 'CBB', name: 'CBB', icon: '🏀' },
  { id: 'CBB1H', name: 'CBB 1H', icon: '🏀' },
  { id: 'AUSNBL', name: 'NBL', icon: '🏀' },

  // Football
  { id: 'NFL', name: 'NFL', icon: '🏈' },
  { id: 'NFL1H', name: 'NFL 1H', icon: '🏈' },
  { id: 'NFL1Q', name: 'NFL 1Q', icon: '🏈' },

  // Hockey
  { id: 'NHL', name: 'NHL', icon: '🏒' },

  // Soccer
  { id: 'SOCCER', name: 'SOCCER', icon: '⚽' },

  // Golf
  { id: 'PGA', name: 'PGA', icon: '⛳' },
  { id: 'TGL', name: 'TGL', icon: '⛳' },
  { id: 'EUROGOLF', name: 'EURO', icon: '⛳' },

  // Tennis
  { id: 'TENNIS', name: 'TENNIS', icon: '🎾' },

  // Baseball
  { id: 'MLBSZN', name: 'MLB', icon: '⚾' },

  // Esports
  { id: 'CS2', name: 'CS2', icon: '🎮' },
  { id: 'VAL', name: 'VALORANT', icon: '🎮' },
  { id: 'LoL', name: 'LoL', icon: '🎮' },
  { id: 'Dota2', name: 'DOTA 2', icon: '🎮' },
  { id: 'COD', name: 'COD', icon: '🎮' },
  { id: 'RL', name: 'RL', icon: '🎮' },
  { id: 'R6', name: 'R6', icon: '🎮' },

  // Combat Sports
  { id: 'BOXING', name: 'BOXING', icon: '🥊' },

  // Racing
  { id: 'APEX', name: 'APEX', icon: '🏎️' },

  // Special Events
  { id: 'SPECIALS', name: 'SPECIALS', icon: '🎯' }
];

interface ProjectionDisplayProps {
  projectionData: ProjectionWithAttributes[];
}

// Helper function to sanitize player data
function sanitizePlayerData(player: ProjectionWithAttributes['player']) {
  if (!player) return null;
  
  return {
    ...player,
    attributes: {
      ...player.attributes,
      image_url: player.attributes.image_url || '/placeholder-avatar.png',
    },
  };
}

// Helper function to get stat types for a specific league
function getLeagueStatTypes(projections: ProjectionWithAttributes[], league: string) {
  const statTypes = new Set<string>();
  
  projections.forEach(({ projection, player }) => {
    if (!projection || !player) return;
    if (player.attributes.league !== league) return;
    statTypes.add(projection.attributes.stat_type);
  });
  
  return Array.from(statTypes).sort();
}

// Get a friendly display name for a stat type
function getStatTypeDisplayName(statType: string): string {
  const displayNames: Record<string, string> = {
    // Basketball
    'points': 'Points',
    'rebounds': 'Rebounds',
    'assists': 'Assists',
    'threes': '3-Pointers Made',
    'blocks': 'Blocks',
    'steals': 'Steals',
    'turnovers': 'Turnovers',
    'fantasy_points': 'Fantasy Points',
    // Football
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'receiving_yards': 'Receiving Yards',
    'touchdowns': 'Touchdowns',
    'receptions': 'Receptions',
    'interceptions': 'Interceptions',
    'completions': 'Completions',
    'attempts': 'Attempts',
    // Hockey
    'goals': 'Goals',
    'assists_hockey': 'Assists',
    'saves': 'Saves',
    'shots_on_goal': 'Shots on Goal',
    'points_hockey': 'Points',
    // Golf
    'birdies': 'Birdies',
    'bogeys': 'Bogeys',
    'pars': 'Pars',
    'score': 'Score',
  };
  
  return displayNames[statType] || statType;
}

export const ProjectionDisplay = memo(function ProjectionDisplay({ 
  projectionData,
}: ProjectionDisplayProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('NBA');
  const [selectedStatType, setSelectedStatType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all stat types for the selected league
  const statTypes = useMemo(() => {
    return getLeagueStatTypes(projectionData, selectedLeague);
  }, [projectionData, selectedLeague]);

  // Split filtering into search results and league/stat type filters
  const searchResults = useMemo(() => {
    if (!searchTerm) return projectionData;

    const searchLower = searchTerm.toLowerCase();
    return projectionData.filter(item => {
      if (!item.player) return false;

      // Search in player name, team, position, and league
      const playerMatches = 
        item.player.attributes.name.toLowerCase().includes(searchLower) ||
        (item.player.attributes.team?.toLowerCase() || '').includes(searchLower) ||
        (item.player.attributes.position?.toLowerCase() || '').includes(searchLower) ||
        item.player.attributes.league.toLowerCase().includes(searchLower);

      // Search in stat type and description
      const statMatches = 
        item.projection.attributes.stat_type.toLowerCase().includes(searchLower) ||
        item.projection.attributes.description.toLowerCase().includes(searchLower);

      // Search in line score
      const lineScoreMatches = 
        item.projection.attributes.line_score.toString().includes(searchTerm);

      return playerMatches || statMatches || lineScoreMatches;
    });
  }, [projectionData, searchTerm]);

  // Apply league and stat type filters only if there's no search term
  const filteredData = useMemo(() => {
    if (searchTerm) return searchResults;

    return searchResults.filter(item => {
      const matchesLeague = item.player?.attributes.league === selectedLeague;
      const matchesStatType = !selectedStatType || item.projection.attributes.stat_type === selectedStatType;
      return matchesLeague && matchesStatType;
    });
  }, [searchResults, selectedLeague, selectedStatType, searchTerm]);

  // Set initial stat type when league changes
  useEffect(() => {
    const types = getLeagueStatTypes(projectionData, selectedLeague);
    if (types.length > 0 && !types.includes(selectedStatType)) {
      setSelectedStatType(types[0]);
    }
  }, [selectedLeague, projectionData, selectedStatType]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const columns = useMemo<ColumnDef<ProjectionWithAttributes>[]>(() => [
    {
      accessorKey: 'player',
      header: 'Player',
      cell: ({ row }) => {
        const player = row.original.player?.attributes;
        if (!player) return null;
        
        return (
          <div className="flex items-center space-x-3">
            <PlayerAvatar
              name={player.name}
              imageUrl={player.image_url || ''}
              size={32}
            />
            <div>
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-gray-500">{player.team}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'projection.attributes.stat_type',
      header: 'Stat Type',
      cell: ({ row }) => {
        const statType = row.original.projection?.attributes.stat_type;
        return statType ? (
          <div className="font-medium">{getStatTypeDisplayName(statType)}</div>
        ) : null;
      },
    },
    {
      accessorKey: 'projection.attributes.line_score',
      header: 'Line',
      cell: ({ row }) => {
        const projection = row.original.projection;
        const lineScore = projection.attributes.line_score;
        const lineMovement = projection.attributes.line_movement;

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{lineScore}</span>
            {lineMovement && (
              <div 
                className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded ${
                  lineMovement.direction === 'up' 
                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                }`}
              >
                <span className="flex items-center">
                  {lineMovement.direction === 'up' ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
                <span className="text-xs font-medium">
                  {lineMovement.difference.toFixed(1)}
                </span>
                <span className="text-xs opacity-75">
                  from {lineMovement.original}
                </span>
              </div>
            )}
          </div>
        );
      },
      sortingFn: 'datetime',
    },
    // Add Average Stat column
    {
      id: 'average',
      header: 'AVG',
      cell: ({ row }) => {
        const stats = row.original.stats;
        const lineScore = row.original.projection.attributes.line_score;
        if (!stats?.attributes) return null;
        
        const { average, count, max_value } = stats.attributes;
        if (typeof average !== 'number') return null;

        // Calculate if the current line is above or below the average
        const diff = lineScore - average;
        const diffPercentage = (diff / average) * 100;
        
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{average.toFixed(1)}</span>
              <span className="text-xs text-gray-500">
                ({count} games)
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={`font-medium ${diff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {diff > 0 ? '↑' : '↓'} {Math.abs(diffPercentage).toFixed(1)}%
              </span>
              <span className="text-gray-500">
                vs line
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Max: {max_value}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const aAvg = rowA.original.stats?.attributes.average ?? 0;
        const bAvg = rowB.original.stats?.attributes.average ?? 0;
        return aAvg - bAvg;
      },
    },
    {
      accessorKey: 'projection.attributes.start_time',
      header: 'Start Time',
      cell: ({ row }) => {
        const startTime = row.original.projection?.attributes.start_time;
        if (!startTime) return null;
        
        const date = new Date(startTime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateDisplay;
        if (date.toDateString() === today.toDateString()) {
          dateDisplay = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
          dateDisplay = 'Tomorrow';
        } else {
          dateDisplay = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric'
          });
        }
        
        const timeDisplay = date.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        return (
          <div className="space-y-0.5">
            <div className="font-medium">{timeDisplay}</div>
            <div className="text-sm text-gray-500">{dateDisplay}</div>
          </div>
        );
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'projection.attributes.status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.projection?.attributes.status;
        return (
          <div className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${status === 'pre_game' ? 'bg-green-100 text-green-800' :
              status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              status === 'final' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'}
          `}>
            {status === 'pre_game' ? 'Upcoming' :
             status === 'in_progress' ? 'Live' :
             status === 'final' ? 'Final' :
             status}
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <PlayerSearch 
        projections={projectionData}
        onSearch={handleSearch}
      />

      {/* League Navigation - Hide when searching */}
      {!searchTerm && (
        <>
          <LeagueNav
            leagues={LEAGUE_CONFIG}
            selectedLeague={selectedLeague}
            onLeagueSelect={setSelectedLeague}
          />

          {/* Stat Type Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Label>Stat Type:</Label>
            <select
              value={selectedStatType}
              onChange={(e) => setSelectedStatType(e.target.value)}
              className="p-2 border rounded-md"
            >
              {Array.from(statTypes).map((type) => (
                <option key={type} value={type}>
                  {getStatTypeDisplayName(type)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 mb-2">
        Showing {filteredData.length} {filteredData.length === 1 ? 'projection' : 'projections'}
        {searchTerm && (
          <>
            {' '}matching "{searchTerm}"
            {filteredData.length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 text-primary hover:text-primary/80 underline"
              >
                Clear search
              </button>
            )}
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No projections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

ProjectionDisplay.displayName = 'ProjectionDisplay';
