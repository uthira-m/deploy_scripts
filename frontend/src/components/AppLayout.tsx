"use client";
import React from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar';

export default function AppLayout({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-emerald-200">
      <AppBar pageTitle={pageTitle} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 