import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import './globals.css';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

const inter = Roboto_Mono({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Parlayer',
  description: 'Transform your picks with Parlayer - Enterprise platform for business growth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={robotoMono.variable} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-mono antialiased transition-colors duration-300')} suppressHydrationWarning>
        <main className="relative flex min-h-screen flex-col transition-colors duration-300" suppressHydrationWarning>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </main>
      </body>
    </html>
  );
}
