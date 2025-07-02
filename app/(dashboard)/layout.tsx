'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Navigation />
        <main className="flex-1 overflow-auto lg:ml-64">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}