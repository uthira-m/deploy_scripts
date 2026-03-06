"use client";
import React from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto overscroll-contain transition-all duration-300 relative z-0 pl-14 lg:pl-0 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-[255px]'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 