'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProjectionWithAttributes } from '@/types/props';
import debounce from 'lodash/debounce';

interface PlayerSearchProps {
  projections: ProjectionWithAttributes[];
  onSearch: (searchTerm: string) => void;
}

export function PlayerSearch({ projections, onSearch }: PlayerSearchProps) {
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
    <div className="w-full bg-gray-50 p-2 rounded-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by player name, team, or position..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 w-full bg-white"
        />
      </div>
    </div>
  );
}
