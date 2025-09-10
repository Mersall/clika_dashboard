import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useSort<T>(
  data: T[],
  defaultSortKey?: keyof T | string,
  defaultDirection: SortDirection = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    defaultSortKey ? { key: defaultSortKey, direction: defaultDirection } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig || !data || data.length === 0) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key as string);
      const bValue = getNestedValue(b, sortConfig.key as string);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const toggleSort = (key: keyof T | string) => {
    setSortConfig((prevConfig) => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      // Reset sort
      return null;
    });
  };

  const getSortIcon = (key: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'none';
    }
    return sortConfig.direction;
  };

  return {
    sortedData,
    sortConfig,
    toggleSort,
    getSortIcon,
  };
}

// Helper function to get nested values using dot notation
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return null;
    }
    value = value[key];
  }
  
  return value;
}