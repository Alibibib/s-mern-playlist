'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo/client';
import { Navbar } from '@/components/ui/navbar';
import { Notifications } from '@/components/ui/notifications';
import { AudioPlayer } from '@/components/player/audio-player';
import './globals.css';
import React from "react";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-violet-500/30 selection:text-white`}
      >
        <div className="fixed inset-0 z-[-1] bg-[#0a0a0a]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px] animate-mesh" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-fuchsia-900/10 blur-[100px] animate-mesh [animation-delay:2s]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-900/10 blur-[130px] animate-mesh [animation-delay:4s]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <ApolloProvider client={apolloClient}>
          <div className="relative z-10 min-h-screen flex flex-col pb-24">
            <Navbar />
            <Notifications />
            <main className="flex-1">
              {children}
            </main>
            <AudioPlayer />
          </div>
        </ApolloProvider>
      </body>
    </html>
  );
}
