'use client';

import { BetSlip } from '@/components/dashboard/bet-slip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only show BetSlip on props, analyze, and odds pages
  const showBetSlip = ['/props', '/analyze', '/odds'].some(path => 
    pathname.startsWith(path)
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-screen">
        {children}
        {showBetSlip && <BetSlip />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
