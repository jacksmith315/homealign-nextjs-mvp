'use client';

import React from 'react';
import { Download, Trash2 } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedItems: any[];
  onBulkDelete: (items: any[]) => void;
  onExport: () => void;
  entityName: string;
}

export default function BulkActionToolbar({
  selectedItems,
  onBulkDelete,
  onExport,
  entityName
}: BulkActionToolbarProps) {
  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
      <span className="text-sm text-blue-800">
        {selectedItems.length} {entityName}(s) selected
      </span>
      <div className="flex gap-2">
        <button
          onClick={onExport}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center transition-colors duration-150"
        >
          <Download size={14} className="mr-1" />
          Export
        </button>
        <button
          onClick={() => onBulkDelete(selectedItems)}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center transition-colors duration-150"
        >
          <Trash2 size={14} className="mr-1" />
          Delete Selected
        </button>
      </div>
    </div>
  );
}