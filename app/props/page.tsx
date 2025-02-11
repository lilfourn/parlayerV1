'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/app/types/props';
import { ClientProjectionList } from './components/client-projection-list';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/spinner';

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
          <div className="absolute inset-0 bg-gray-50/90 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-lg mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 transition-all duration-200 ease-in-out hover:shadow-md">
                  <div className="text-center space-y-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-red-600">Error Loading Projections</h2>
                    <p className="text-base sm:text-lg text-gray-700">{error}</p>
                    <p className="text-sm sm:text-base text-gray-500">
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 relative overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
            <div className="flex items-center h-14 px-4">
              <SidebarTrigger />
              <div className="ml-4 flex items-center space-x-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h1 className="text-lg font-semibold">Player Props</h1>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <div id="refresh-controls" className="mb-4" />
              <ClientProjectionList initialData={initialData} />
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
