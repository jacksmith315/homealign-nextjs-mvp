'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';

export default function UserMenu() {
  const { logout, user } = useAuth();
  console.log('UserMenu user', user);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="space-y-3">
      {/* User Profile Display */}
      <div className="bg-gray-50 rounded-lg p-3 border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'Current User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role ? `${user.role} • Signed in` : 'Signed in'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="relative" ref={menuRef}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="py-1">
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                Account: {user?.email || 'Unknown'}
                {user?.role && (
                  <div className="text-xs text-gray-400 mt-1">
                    Role: {user.role}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add settings functionality here if needed
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 transition-colors duration-150"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Logout Button (Always Visible) */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 shadow-sm"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </button>
    </div>
  );
}