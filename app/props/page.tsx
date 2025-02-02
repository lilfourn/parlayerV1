'use server';

import React from 'react';
import { ApiResponse } from '@/types/props';
import { ClientProjectionList } from './components/client-projection-list';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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

export default async function Props() {
  let initialData: ApiResponse;
  
  try {
    initialData = await getProjections();
    
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 relative overflow-y-auto">
            <SidebarTrigger />
            <div className="p-4">
              <ClientProjectionList 
                initialData={initialData}
                refreshInterval={30000} // Refresh every 30 seconds
              />
            </div>
          </main>
        </SidebarProvider>
      </div>
    );
  } catch (error) {
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