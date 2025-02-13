'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProjectionWithAttributes } from '@/types/props';
import debounce from 'lodash/debounce';
import cn from 'classnames';

interface PlayerSearchProps {
  projections: ProjectionWithAttributes[];
  onSearch: (searchTerm: string) => void;
  className?: string;
}

export function PlayerSearch({ projections, onSearch, className }: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search to avoid too many re-renders
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={cn("w-full bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by player name, team, or position..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 w-full bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        />
      </div>
    </div>
  );
}
