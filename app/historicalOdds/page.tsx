'use client';

import React, { Suspense, useCallback, useEffect } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsFilter } from '@/app/odds/components/sports/sports-filter';
import { EventList } from './components/eventList';
import { useRouter, useSearchParams } from 'next/navigation';
import { History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CalendarComponent } from './components/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

function EventListFallback() {
  return (
    <Card className="p-8">
      <Skeleton className="h-[200px] w-full" />
    </Card>
  );
}

export default function HistoricalOdds() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSport = searchParams.get('sport');

    // Add effect to set default sport
    useEffect(() => {
        if (!selectedSport) {
            const params = new URLSearchParams(searchParams);
            params.set('sport', 'basketball_nba');
            router.push(`/historicalOdds?${params.toString()}`);
        }
    }, [selectedSport, searchParams, router]);

    const handleSportSelect = useCallback((sport: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sport', sport);
        
        // Preserve date range if it exists
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        
        router.push(`/historicalOdds?${params.toString()}`);
    }, [router, searchParams]);

    const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
        if (!range?.from) return;
        
        const params = new URLSearchParams(searchParams);
        params.set('startDate', format(range.from, 'yyyy-MM-dd'));
        if (range.to) {
            params.set('endDate', format(range.to, 'yyyy-MM-dd'));
        } else {
            params.delete('endDate');
        }
        
        router.push(`/historicalOdds?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
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

                    <div className="p-4 space-y-4">
                        <div className="space-y-4">
                            <SportsFilter 
                                onSportSelect={handleSportSelect}
                                selectedSport={selectedSport ?? undefined}
                            />
                            <CalendarComponent 
                                onDateRangeChange={handleDateRangeChange}
                                className="max-w-sm"
                            />
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