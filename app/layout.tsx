import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
