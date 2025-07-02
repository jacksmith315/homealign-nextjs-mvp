'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { DATABASES } from '@/lib/constants';

interface DatabaseSelectorProps {
  className?: string;
}

export default function DatabaseSelector({ className = '' }: DatabaseSelectorProps) {
  const { selectedDb, setSelectedDb } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDb(e.target.value);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="database-select" className="text-sm font-medium text-gray-700">
        Database:
      </label>
      <select
        id="database-select"
        value={selectedDb}
        onChange={handleChange}
        className="form-select text-sm py-1 px-2 min-w-0"
      >
        {DATABASES.map((db) => (
          <option key={db.id} value={db.id}>
            {db.name}
          </option>
        ))}
      </select>
    </div>
  );
}