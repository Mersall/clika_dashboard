import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface SortableTableHeaderProps {
  label: string | React.ReactNode;
  sortKey: string;
  onSort: (key: string) => void;
  sortDirection: 'asc' | 'desc' | 'none';
  className?: string;
}

export function SortableTableHeader({
  label,
  sortKey,
  onSort,
  sortDirection,
  className = '',
}: SortableTableHeaderProps) {
  return (
    <th className={className}>
      <div
        className="group inline-flex items-center gap-1 text-left font-medium text-gray-300 hover:text-gray-100 cursor-pointer"
        onClick={() => onSort(sortKey)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSort(sortKey);
          }
        }}
      >
        {label}
        <span className="ml-1 flex-none">
          {sortDirection === 'none' && (
            <ChevronUpDownIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
          )}
          {sortDirection === 'asc' && (
            <ChevronUpIcon className="h-4 w-4 text-primary-500" />
          )}
          {sortDirection === 'desc' && (
            <ChevronDownIcon className="h-4 w-4 text-primary-500" />
          )}
        </span>
      </div>
    </th>
  );
}