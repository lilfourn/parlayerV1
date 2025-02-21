'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/app/types/props';
import { ClientProjectionList } from './components/client-projection-list';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

async function getProjections(): Promise<ApiResponse> {
  const response = await fetch('http://localhost:3000/api/projections', {
    cache: 'no-store', // This ensures we get fresh data on each server render
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projections');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch projections');
  }

  return result.data;
}

export default function Props() {
  const [initialData, setInitialData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjections() {
      try {
        const data = await getProjections();
        setInitialData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    }
    fetchProjections();
  }, []);

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 relative">
          <div className="sticky top-0 z-10 m-4">
            <div className="rounded-lg bg-white/85 dark:bg-gray-900/75 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Error Loading Projections
                    </h1>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-lg mx-auto">
                <div className="bg-white/85 dark:bg-gray-900/75 rounded-lg shadow-sm p-6 sm:p-8 transition-all duration-200 ease-in-out hover:shadow-md backdrop-blur-md">
                  <div className="text-center space-y-4">
                    <p className="text-base sm:text-lg text-foreground">{error}</p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Please wait a moment and try refreshing the page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!initialData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <LoadingScreen />
      </SidebarProvider>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 relative overflow-y-auto">
          <div className="sticky top-0 z-10 m-4">
            <div className="rounded-lg bg-white/85 dark:bg-gray-900/75 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Props
                    </h1>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <ClientProjectionList initialData={initialData} />
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
