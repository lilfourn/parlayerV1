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
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-gradient-to-r from-amber-500 to-amber-600 opacity-20 blur-[128px]" />
          <div className="absolute bottom-0 left-0 right-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-gradient-to-r from-amber-500 to-amber-600 opacity-20 blur-[128px]" />
        </div>
        <main className="relative flex min-h-screen flex-col bg-gray-900/50 dark:bg-gray-900/50 transition-colors duration-300" suppressHydrationWarning>
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
