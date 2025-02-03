'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/types/props';
import { ClientProjectionList } from './components/client-projection-list';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp } from 'lucide-react';

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
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 relative">
            <SidebarTrigger />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-red-600">Error Loading Projections</h1>
              <p className="mt-2">{error}</p>
              <p className="mt-2 text-sm text-gray-600">Please wait a moment and try refreshing the page.</p>
            </div>
          </main>
        </SidebarProvider>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 relative">
            <SidebarTrigger />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-600">Loading...</h1>
            </div>
          </main>
        </SidebarProvider>
      </div>
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
            <ClientProjectionList initialData={initialData} refreshInterval={30000} />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}