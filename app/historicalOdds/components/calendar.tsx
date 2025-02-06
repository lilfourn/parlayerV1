'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format, startOfMonth, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

interface CalendarComponentProps {
  onDateRangeChange: (range: DateRange | undefined) => void;
  initialDateRange?: DateRange;
  className?: string;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];

export function CalendarComponent({
  onDateRangeChange,
  initialDateRange,
  className,
}: CalendarComponentProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange || {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  );
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialDateRange && 
        (initialDateRange.from?.toISOString() !== date?.from?.toISOString() || 
         initialDateRange.to?.toISOString() !== date?.to?.toISOString())) {
      setDate(initialDateRange);
    }
  }, [initialDateRange]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from !== date?.from || newDate?.to !== date?.to) {
      onDateRangeChange(newDate);
    }
    if (newDate?.from && newDate?.to) {
      setIsOpen(false);
    }
  };

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    const newRange = { from, to };
    setDate(newRange);
    onDateRangeChange(newRange);
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full max-w-[600px]", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.days)}
            className="h-8 text-xs bg-white hover:bg-gray-50"
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white hover:bg-gray-50 border-gray-200",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yyyy")} -{" "}
                  {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-3 bg-white shadow-lg rounded-lg border border-gray-200" 
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-3",
              caption: "flex justify-center relative items-center h-9 px-6",
              caption_label: "text-sm font-semibold text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-full transition-colors",
                "text-gray-500 hover:text-gray-900"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex mb-1",
              head_cell: "text-gray-500 w-9 font-medium text-[0.8rem] uppercase",
              row: "flex w-full",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                "[&:has([aria-selected])]:bg-blue-50",
                "[&:has(>.day-range-start)]:rounded-l-md [&:has(>.day-range-end)]:rounded-r-md"
              ),
              day: cn(
                "h-9 w-9 p-0 font-normal rounded-full",
                "aria-selected:opacity-100",
                "hover:bg-gray-100 focus:bg-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              ),
              day_range_start: "day-range-start bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
              day_range_end: "day-range-end bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
              day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
