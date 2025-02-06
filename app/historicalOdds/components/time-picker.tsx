'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import * as React from 'react';

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerProps) {
  // Create hours and minutes options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Get current hours and minutes
  const currentHours = date.getHours();
  const currentMinutes = date.getMinutes();

  // Update time
  const handleHourChange = (hour: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour));
    setDate(newDate);
  };

  const handleMinuteChange = (minute: string) => {
    const newDate = new Date(date);
    newDate.setMinutes(parseInt(minute));
    setDate(newDate);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">Hours</Label>
        <Select value={currentHours.toString()} onValueChange={handleHourChange}>
          <SelectTrigger id="hours" className="w-[70px]">
            <SelectValue placeholder="Hours" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">Minutes</Label>
        <Select value={currentMinutes.toString()} onValueChange={handleMinuteChange}>
          <SelectTrigger id="minutes" className="w-[70px]">
            <SelectValue placeholder="Minutes" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute.toString()}>
                {minute.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
