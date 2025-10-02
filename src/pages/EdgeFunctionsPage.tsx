import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import {
  ServerIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

interface EdgeFunction {
  id: string;
  slug: string;
  name: string;
  version: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: number;
  updated_at: number;
  entrypoint_path: string;
  verify_jwt: boolean;
}

interface FunctionLog {
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  metadata?: any;
}

export function EdgeFunctionsPage() {
  const { t } = useTranslation();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<EdgeFunction | null>(null);
  const [viewingCode, setViewingCode] = useState<EdgeFunction | null>(null);

  // Mock data for edge functions (in production, this would come from Supabase API)
  const edgeFunctions: EdgeFunction[] = [
    {
      id: '41308640-405c-4aea-9f35-218b00167ca6',
      slug: 'get-next-item-enhanced',
      name: 'get-next-item-enhanced',
      version: 2,
      status: 'ACTIVE',
      created_at: 1758936990674,
      updated_at: 1759005466713,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    },
    {
      id: '893459a5-1c58-4092-9f04-7637f0d7b610',
      slug: 'purchase-pack',
      name: 'purchase-pack',
      version: 1,
      status: 'ACTIVE',
      created_at: 1758815632117,
      updated_at: 1758815632117,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    },
    {
      id: '0b25a8f0-3c6e-45fb-a195-7e2e43a10567',
      slug: 'get-pack-preview',
      name: 'get-pack-preview',
      version: 1,
      status: 'ACTIVE',
      created_at: 1758815609876,
      updated_at: 1758815609876,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    },
    {
      id: '586ae615-d4e2-45c4-adaf-ef7cf4dd7ab7',
      slug: 'serve-ad',
      name: 'serve-ad',
      version: 4,
      status: 'ACTIVE',
      created_at: 1756978688998,
      updated_at: 1758206850858,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    },
    {
      id: '5c079d8d-dc5d-4837-a26e-8c9172b45fa7',
      slug: 'config',
      name: 'config',
      version: 2,
      status: 'ACTIVE',
      created_at: 1756978688998,
      updated_at: 1757000447084,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    },
    {
      id: '35e76d50-95c8-493b-82e7-68b318a71940',
      slug: 'end-round',
      name: 'end-round',
      version: 2,
      status: 'ACTIVE',
      created_at: 1756978688998,
      updated_at: 1757000542340,
      entrypoint_path: 'index.ts',
      verify_jwt: true
    }
  ];

  // Mock logs data
  const mockLogs: FunctionLog[] = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Function invoked successfully',
      metadata: { duration: 145, user_id: 'abc123' }
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'error',
      message: 'Failed to fetch content item',
      metadata: { error: 'Database connection timeout' }
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'warning',
      message: 'High response time detected',
      metadata: { duration: 2500 }
    }
  ];

  // Filter functions
  const filteredFunctions = useMemo(() => {
    if (!searchQuery.trim()) return edgeFunctions;

    const query = searchQuery.toLowerCase();
    return edgeFunctions.filter(func =>
      func.name.toLowerCase().includes(query) ||
      func.slug.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Calculate stats
  const stats = {
    totalFunctions: edgeFunctions.length,
    activeFunctions: edgeFunctions.filter(f => f.status === 'ACTIVE').length,
    totalVersions: edgeFunctions.reduce((sum, f) => sum + f.version, 0),
    recentlyUpdated: edgeFunctions.filter(f => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return f.updated_at > dayAgo;
    }).length
  };

  if (roleLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ServerIcon className="h-8 w-8 text-primary" />
              Edge Functions Monitor
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Monitor and manage Supabase Edge Functions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Functions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalFunctions}
                </p>
              </div>
              <CodeBracketIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.activeFunctions}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="card p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Versions</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.totalVersions}
                </p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="card p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Recently Updated</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {stats.recentlyUpdated}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search functions..."
          className="input w-full pl-10"
        />
      </div>

      {/* Functions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Function Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Version
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                JWT
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filteredFunctions.map((func) => (
              <tr key={func.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {func.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {func.slug}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100">v{func.version}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(func.status)}`}>
                    {func.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(func.created_at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(func.updated_at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {func.verify_jwt ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingLogs(func)}
                      className="text-primary hover:text-primary-dark"
                      title="View Logs"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewingCode(func)}
                      className="text-primary hover:text-primary-dark"
                      title="View Code"
                    >
                      <CodeBracketIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Logs Modal */}
      <Modal
        isOpen={!!viewingLogs}
        onClose={() => setViewingLogs(null)}
        title={`Logs: ${viewingLogs?.name}`}
        size="lg"
      >
        {viewingLogs && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Function: {viewingLogs.name} (v{viewingLogs.version})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Note: Showing mock logs. In production, this would fetch real logs from Supabase.
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockLogs.map((log, index) => (
                <div key={index} className="border dark:border-gray-700 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${getLogLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {log.message}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.metadata && (
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setViewingLogs(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => toast.success('Logs refreshed')}
                className="btn btn-primary"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Code Modal */}
      <Modal
        isOpen={!!viewingCode}
        onClose={() => setViewingCode(null)}
        title={`Code: ${viewingCode?.name}`}
        size="xl"
      >
        {viewingCode && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Function: {viewingCode.name} (v{viewingCode.version})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Entry: {viewingCode.entrypoint_path}
              </p>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
              <pre className="text-xs">
{`import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Function logic here
    console.log('Function ${viewingCode.name} invoked');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});`}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingCode(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}