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
      <body className={robotoMono.className} suppressHydrationWarning>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50/90 dark:from-black dark:via-black dark:to-blue-950/30" />
          
          {/* Primary glow effects */}
          <div className="absolute -top-[40%] -left-[20%] h-[1000px] w-[1000px] animate-glow-pulse">
            <div className="absolute inset-0 bg-gradient-radial-to-br from-blue-500/30 via-blue-400/20 to-transparent blur-3xl dark:from-blue-400/20 dark:via-blue-400/10" />
          </div>
          <div className="absolute -bottom-[40%] -right-[20%] h-[1000px] w-[1000px] animate-glow-pulse [animation-delay:5s]">
            <div className="absolute inset-0 bg-gradient-radial-to-tl from-blue-500/30 via-blue-400/20 to-transparent blur-3xl dark:from-blue-400/20 dark:via-blue-400/10" />
          </div>
          
          {/* Secondary glow accents */}
          <div className="absolute top-[10%] right-[5%] h-[500px] w-[500px] animate-glow-pulse [animation-delay:2.5s]">
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/25 via-blue-300/15 to-transparent blur-2xl dark:from-blue-300/15 dark:via-blue-300/10" />
          </div>
          <div className="absolute bottom-[10%] left-[5%] h-[500px] w-[500px] animate-glow-pulse [animation-delay:7.5s]">
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/25 via-blue-300/15 to-transparent blur-2xl dark:from-blue-300/15 dark:via-blue-300/10" />
          </div>
          
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 h-[300px] w-[300px] animate-glow-pulse [animation-delay:1.25s]">
            <div className="absolute inset-0 bg-gradient-radial-to-bl from-blue-300/20 via-blue-200/10 to-transparent blur-xl dark:from-blue-200/10 dark:via-blue-200/5" />
          </div>
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] animate-glow-pulse [animation-delay:6.25s]">
            <div className="absolute inset-0 bg-gradient-radial-to-tr from-blue-300/20 via-blue-200/10 to-transparent blur-xl dark:from-blue-200/10 dark:via-blue-200/5" />
          </div>
        </div>
        <main className="relative flex min-h-screen flex-col bg-transparent transition-colors duration-300" suppressHydrationWarning>
          <Providers>
            {children}
            <Toaster 
              closeButton
              theme="system"
              position="top-right"
              className="group"
              toastOptions={{
                classNames: {
                  toast: "group-hover:opacity-100",
                  title: "font-medium",
                  description: "text-muted-foreground text-sm",
                  actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
                  cancelButton: "bg-muted hover:bg-muted/90",
                  error: "border-destructive/50 bg-destructive/10",
                  success: "border-green-500/50 bg-green-500/10",
                  loading: "border-blue-500/50 bg-blue-500/10",
                },
                duration: 4000,
              }}
            />
          </Providers>
        </main>
      </body>
    </html>
  );
}
