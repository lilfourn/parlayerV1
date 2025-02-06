'use client';

import React, { Suspense } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsFilter } from '@/app/odds/components/sports/sports-filter';
import { EventList } from './components/eventList';
import { History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CalendarComponent } from './components/calendar';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { useQueryState } from 'next-usequerystate';

function EventListFallback() {
  return (
    <Card className="p-8">
      <Skeleton className="h-[200px] w-full" />
    </Card>
  );
}

export default function HistoricalOdds() {
    const [sport, setSport] = useQueryState('sport', { defaultValue: 'basketball_nba' });
    const [startDate, setStartDate] = useQueryState('startDate');
    const [endDate, setEndDate] = useQueryState('endDate');

    const handleSportSelect = async (newSport: string) => {
        await setSport(newSport);
    };

    const handleDateRangeChange = async (range: DateRange | undefined) => {
        if (!range?.from) {
            await Promise.all([
                setStartDate(null),
                setEndDate(null)
            ]);
            return;
        }
        
        await Promise.all([
            setStartDate(format(range.from, 'yyyy-MM-dd')),
            setEndDate(range.to ? format(range.to, 'yyyy-MM-dd') : null)
        ]);
    };

    // Convert URL dates back to DateRange for calendar
    const dateRange: DateRange | undefined = startDate ? {
        from: parseISO(startDate),
        to: endDate ? parseISO(endDate) : undefined
    } : undefined;

    return (
        <div className="flex min-h-screen flex-col lg:flex-row overflow-hidden bg-gray-50">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                        <div className="flex items-center h-14 px-4">
                            <SidebarTrigger />
                            <div className="ml-4 flex items-center space-x-4">
                                <History className="h-5 w-5 text-blue-500" />
                                <h1 className="text-lg font-semibold">Historical Odds</h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium text-muted-foreground">Sport</h2>
                                <SportsFilter 
                                    onSportSelect={handleSportSelect}
                                    selectedSport={sport}
                                />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium text-muted-foreground">Date Range</h2>
                                <CalendarComponent 
                                    onDateRangeChange={handleDateRangeChange}
                                    className="max-w-sm"
                                    initialDateRange={dateRange}
                                />
                            </div>
                        </div>
                        <Suspense fallback={<EventListFallback />}>
                            <EventList />
                        </Suspense>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}