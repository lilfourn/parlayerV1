'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { memo } from 'react';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export const SearchBar = memo(function SearchBar({
  onSearch,
  placeholder = 'Search players...',
  value = ''
}: SearchBarProps) {
  return (
    <Card>
      <div className="p-2 bg-gray-50 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>
    </Card>
  );
});