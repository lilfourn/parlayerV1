'use client';

import { memo, useState, useMemo, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
  type Row,
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
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { PlayerAvatar } from './player-avatar';
import { LeagueNav } from './league-nav';
import { PlayerSearch } from './player-search';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import cn from 'classnames';

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
  onProjectionSelect?: (projection: ProjectionWithAttributes) => void;
  selectedProjectionId?: string;
  isSelectionMode?: boolean;
  selectedProjections?: Set<string>;
  onStatTypeChange?: (statType: string | null) => void;
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
  onProjectionSelect,
  selectedProjectionId,
  isSelectionMode = false,
  selectedProjections = new Set(),
  onStatTypeChange
}: ProjectionDisplayProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>('NBA');
  const [selectedStatType, setSelectedStatType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to check if any projections have analysis data
  const hasAnalysisData = useCallback((data: ProjectionWithAttributes[]) => {
    return data.some(item => {
      const stats = item.stats;
      const projection = item.projection;
      return stats?.attributes?.average && projection?.attributes?.line_score;
    });
  }, []);

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

  const [sorting, setSorting] = useState<SortingState>([]);

  // Handle search term updates
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Set initial stat type when league changes
  useEffect(() => {
    const types = getLeagueStatTypes(projectionData, selectedLeague);
    if (types.length > 0 && !types.includes(selectedStatType)) {
      setSelectedStatType(types[0]);
    }
  }, [selectedLeague, projectionData, selectedStatType]);

  // Notify parent of stat type changes
  useEffect(() => {
    onStatTypeChange?.(selectedStatType);
  }, [selectedStatType, onStatTypeChange]);

  // Memoize the column definitions to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<ProjectionWithAttributes>[]>(() => [
    {
      id: 'select',
      enableSorting: false,
      size: 40,
      cell: ({ row }) => {
        if (!isSelectionMode) return null;
        return (
          <Checkbox
            checked={selectedProjections.has(row.original.projection.id)}
            onCheckedChange={(checked) => {
              onProjectionSelect?.(row.original);
            }}
          />
        );
      },
    },
    {
      id: 'player',
      header: 'Player',
      accessorFn: (row) => row.player?.attributes.name,
      cell: ({ row }) => {
        const player = row.original.player;
        if (!player) return null;
        return (
          <div className="flex items-center gap-2">
            <PlayerAvatar 
              imageUrl={player.attributes.image_url || undefined}
              name={player.attributes.name}
            />
            <div className="flex flex-col">
              <span className="font-medium">{player.attributes.name}</span>
              <span className="text-xs text-muted-foreground">
                {player.attributes.team} • {player.attributes.position}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'stat_type',
      header: 'Stat',
      accessorFn: (row) => row.projection.attributes.stat_type,
      cell: ({ row }) => {
        return getStatTypeDisplayName(row.original.projection.attributes.stat_type);
      },
    },
    {
      id: 'line_score',
      header: 'Line',
      accessorFn: (row) => row.projection.attributes.line_score,
      cell: ({ row }) => {
        return row.original.projection.attributes.line_score.toFixed(1);
      },
    },
    {
      id: 'average',
      header: 'Analysis',
      accessorFn: (row) => row.stats?.attributes?.average || 0,
      cell: ({ row }) => {
        const stats = row.original.stats?.attributes;
        if (!stats?.average) return null;
        
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{stats.average.toFixed(1)}</span>
            {stats.max_value && (
              <span className="text-xs text-muted-foreground">
                (max: {stats.max_value.toFixed(1)})
              </span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.stats?.attributes?.average || 0;
        const b = rowB.original.stats?.attributes?.average || 0;
        return a - b;
      },
    },
    {
      id: 'start_time',
      header: 'Start',
      accessorFn: (row) => row.projection.attributes.start_time,
      cell: ({ row }) => {
        const startTime = row.original.projection.attributes.start_time;
        if (!startTime) return null;
        
        const date = new Date(startTime);
        return (
          <div className="flex flex-col min-w-[100px]">
            <span className="text-sm font-medium">{format(date, 'h:mm a')}</span>
            <span className="text-[10px] text-gray-500 tracking-tight">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
      sortingFn: 'datetime',
    },
    {
      id: 'updated_at',
      header: 'Updated',
      accessorFn: (row) => row.projection.attributes.updated_at,
      cell: ({ row }) => {
        const updatedAt = row.original.projection.attributes.updated_at;
        if (!updatedAt) return null;
        
        const date = new Date(updatedAt);
        return (
          <div className="flex flex-col min-w-[100px]">
            <span className="text-sm font-medium">{format(date, 'h:mm a')}</span>
            <span className="text-[10px] text-gray-500 tracking-tight">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
      sortingFn: 'datetime',
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.projection.attributes.status,
      cell: ({ row }) => {
        const status = row.original.projection.attributes.status;
        return (
          <div className="flex items-center gap-2">
            {status}
          </div>
        );
      },
    },
  ], [isSelectionMode, selectedProjections, onProjectionSelect]);

  // Filter visible columns based on whether analysis data exists
  const visibleColumns = useMemo(() => {
    const hasAnalysis = hasAnalysisData(filteredData);
    return columns.filter(column => column.id !== 'average' || hasAnalysis);
  }, [columns, filteredData, hasAnalysisData]);

  // Create table instance with error handling
  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Add debug mode to help identify issues
    debugTable: process.env.NODE_ENV === 'development',
    // Add error boundary
    debugAll: process.env.NODE_ENV === 'development',
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <PlayerSearch 
        projections={projectionData}
        onSearch={handleSearch}
        className="bg-gray-900/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg"
      />

      {/* League Navigation */}
      <div className="bg-gray-900/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
        <LeagueNav
          leagues={LEAGUE_CONFIG}
          selectedLeague={selectedLeague}
          onLeagueSelect={(league: string) => {
            setSelectedLeague(league);
            const types = getLeagueStatTypes(projectionData, league);
            if (types.length > 0) {
              setSelectedStatType(types[0]);
            } else {
              setSelectedStatType('');
            }
          }}
        />
      </div>

      {/* Stat Type Selection */}
      {statTypes.length > 0 && (
        <div className="bg-gray-900/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {statTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                onClick={() => setSelectedStatType(type)}
                className={cn(
                  "transition-colors duration-200",
                  selectedStatType === type
                    ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                    : "bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-black dark:text-white"
                )}
              >
                {getStatTypeDisplayName(type)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Projections Table */}
      <div className="bg-gray-900/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-900/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-foreground/70"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {header.column.getIsSorted() && (
                            <span>
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-900/60 transition-colors",
                    selectedProjectionId === row.original.projection.id && "bg-amber-500/20"
                  )}
                  onClick={() => onProjectionSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground/90">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
});

ProjectionDisplay.displayName = 'ProjectionDisplay';
