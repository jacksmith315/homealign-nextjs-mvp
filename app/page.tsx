'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Navigation />
        <main className="flex-1 overflow-auto lg:ml-64">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🏥</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to HomeAlign
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Healthcare service management platform
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Patient Management
                    </h3>
                    <p className="text-gray-600">
                      Comprehensive patient records and healthcare data management
                    </p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">🏢</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Client Management
                    </h3>
                    <p className="text-gray-600">
                      Manage healthcare clients, organizations, and partnerships
                    </p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">⚕️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Provider Network
                    </h3>
                    <p className="text-gray-600">
                      Healthcare provider credentials and network management
                    </p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Referral Management
                    </h3>
                    <p className="text-gray-600">
                      Streamlined referral workflow and authorization tracking
                    </p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">⚙️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Service Catalog
                    </h3>
                    <p className="text-gray-600">
                      Healthcare service definitions and billing management
                    </p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Multi-Tenant
                    </h3>
                    <p className="text-gray-600">
                      Support for multiple healthcare partners and databases
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}