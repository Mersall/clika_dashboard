import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'danger';
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActions({ selectedCount, actions, onClear }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-300">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`btn ${
                action.variant === 'danger' ? 'btn-danger' : 'btn-secondary'
              } btn-sm`}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-1" />}
              {action.label}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <button
          onClick={onClear}
          className="text-sm text-gray-400 hover:text-gray-300"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}

export function BulkActionsDropdown({ selectedCount, actions, onClear }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-4">
      <span className="text-sm font-medium text-gray-300">
        {selectedCount} selected
      </span>
      
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="btn btn-secondary btn-sm">
          Actions
          <ChevronDownIcon className="ml-1 h-4 w-4" />
        </Menu.Button>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-700 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {actions.map((action, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <button
                      onClick={action.action}
                      className={`${
                        active ? 'bg-gray-700' : ''
                      } ${
                        action.variant === 'danger' ? 'text-red-400' : 'text-gray-300'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onClear}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } text-gray-300 group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    Clear selection
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}