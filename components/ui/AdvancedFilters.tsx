'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filterOptions: FilterOption[];
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export default function AdvancedFilters({
  filterOptions,
  filters,
  onFiltersChange,
  onReset
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-150"
      >
        <Filter className="w-4 h-4 mr-1" />
        Advanced Filters
        {hasActiveFilters && (
          <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {Object.keys(filters).length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterOptions.map((option) => (
              <div key={option.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.label}
                </label>
                {option.type === 'select' && option.options ? (
                  <select
                    value={filters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="form-select text-sm"
                  >
                    <option value="">All</option>
                    {option.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : option.type === 'date' ? (
                  <input
                    type="date"
                    value={filters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="form-input text-sm"
                    placeholder={option.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={filters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="form-input text-sm"
                    placeholder={option.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onReset}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-150"
              >
                <X className="w-4 h-4 mr-1" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}