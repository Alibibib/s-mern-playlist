'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo/client';
import { Navbar } from '@/components/ui/navbar';
import { Notifications } from '@/components/ui/notifications';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloProvider client={apolloClient}>
          <Navbar />
          <Notifications />
          {children}
        </ApolloProvider>
      </body>
    </html>
  );
}
