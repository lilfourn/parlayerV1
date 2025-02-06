'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimePickerDemo } from './time-picker';
import { formatDateForAPI } from '../utils/date';

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(date);

  // Update parent when date changes
  React.useEffect(() => {
    // Ensure the date is in UTC
    const utcDate = new Date(selectedDate);
    utcDate.setMinutes(Math.floor(utcDate.getMinutes() / 5) * 5); // Round to nearest 5 minutes
    utcDate.setSeconds(0);
    utcDate.setMilliseconds(0);
    
    setDate(utcDate);
  }, [selectedDate, setDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(selectedDate, 'PPP p')} UTC
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          initialFocus
        />
        <div className="p-3 border-t">
          <TimePickerDemo 
            date={selectedDate} 
            setDate={setSelectedDate}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
