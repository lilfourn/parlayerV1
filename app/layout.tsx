import './globals.css';
import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
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
      <body className={cn('min-h-screen bg-background font-mono antialiased')} suppressHydrationWarning>
        <main className="relative flex min-h-screen flex-col" suppressHydrationWarning>
          {children}
        </main>
      </body>
    </html>
  );
}
