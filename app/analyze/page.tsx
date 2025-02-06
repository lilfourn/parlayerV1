'use client';
import React from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LineChart } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                        <div className="flex items-center h-14 px-4">
                            <SidebarTrigger />
                            <div className="ml-4 flex items-center space-x-4">
                                <LineChart className="h-5 w-5 text-blue-500" />
                                <h1 className="text-lg font-semibold">Analytics</h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Content will go here */}
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}