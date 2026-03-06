"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function AppBar({ pageTitle }: { pageTitle: string }) {
  const { user, logout } = useAuth();
  const { appName } = useAppSettings();

  return (
    <header className="w-full h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center px-8 shadow-sm z-20 justify-between">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {appName}
        </span>
        <span className="text-lg font-semibold text-gray-700 hidden sm:inline">{pageTitle}</span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-gray-700 font-medium text-sm flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-lg">
              {user.name?.charAt(0) || 'U'}
            </span>
            {user.name} <span className="text-xs text-gray-400">({user.rank})</span>
          </span>
        )}
        <button
          onClick={logout}
          className="ml-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
} 