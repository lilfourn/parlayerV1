'use client';

import React from 'react';
import { ApiResponse } from '@/types/props';
import { ProjectionList } from './projection-list';
import { fetchProjections } from './api/fetch-projections';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function Props() {
    try {
        const apiResponse: ApiResponse = await fetchProjections();
        
        // Debug the included items
        const includedTypes = apiResponse.included.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('Breakdown of included items by type:', includedTypes);
        console.log('Total projections:', apiResponse.data.length);
        
        return (
            <div className="flex h-screen overflow-hidden">
                <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1 relative overflow-y-auto">
                        <SidebarTrigger />
                        <div className="p-4">
                            <ProjectionList apiResponse={apiResponse} />
                        </div>
                    </main>
                </SidebarProvider>
            </div>
        );
    } catch (error) {
        console.error('Error in Props component:', error);
        return (
            <div className="flex h-screen overflow-hidden">
                <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1 relative">
                        <SidebarTrigger />
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-red-600">Error Loading Projections</h1>
                            <p className="mt-2">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
                            <p className="mt-2 text-sm text-gray-600">Please wait a moment and try refreshing the page.</p>
                        </div>
                    </main>
                </SidebarProvider>
            </div>
        );
    }
}