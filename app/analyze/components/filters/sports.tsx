'use client';

import { Button } from "@/components/ui/button";

interface SportsFilterProps {
  onSportSelect: (sport: string) => void;
  selectedSport?: string;
}

export function SportsFilter({ onSportSelect, selectedSport }: SportsFilterProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={selectedSport === 'NBA' ? 'default' : 'outline'}
        onClick={() => onSportSelect('NBA')}
      >
        NBA
      </Button>
      <Button
        variant={selectedSport === 'NFL' ? 'default' : 'outline'}
        onClick={() => onSportSelect('NFL')}
      >
        NFL
      </Button>
      <Button
        variant={selectedSport === 'MLB' ? 'default' : 'outline'}
        onClick={() => onSportSelect('MLB')}
      >
        MLB
      </Button>
    </div>
  );
}