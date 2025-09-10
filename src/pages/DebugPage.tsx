import { useState } from 'react';
import { supabase } from '@services/supabase';
import { useQuery } from '@tanstack/react-query';

export function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null);
  
  // Test database connection
  const { data: stats, error: statsError, isLoading } = useQuery({
    queryKey: ['debug-stats'],
    queryFn: async () => {
      console.log('Testing Supabase connection...');
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
      
      try {
        // Test various queries
        const results: any = {};
        
        // Count queries
        const { count: userCount, error: userError } = await supabase
          .from('user_profile')
          .select('*', { count: 'exact', head: true });
        results.userCount = { count: userCount, error: userError };
        
        const { count: contentCount, error: contentError } = await supabase
          .from('content_item')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        results.contentCount = { count: contentCount, error: contentError };
        
        const today = new Date().toISOString().split('T')[0];
        const { count: sessionCount, error: sessionError } = await supabase
          .from('session')
          .select('*', { count: 'exact', head: true })
          .gte('started_at', today);
        results.sessionCount = { count: sessionCount, error: sessionError };
        
        const { count: campaignCount, error: campaignError } = await supabase
          .from('ad_campaign')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        results.campaignCount = { count: campaignCount, error: campaignError };
        
        // Test actual data fetch
        const { data: sampleContent, error: sampleError } = await supabase
          .from('content_item')
          .select('id, game_key, active')
          .limit(5);
        results.sampleContent = { data: sampleContent, error: sampleError };
        
        return results;
      } catch (error) {
        console.error('Query error:', error);
        return { error: error.message };
      }
    },
    refetchOnWindowFocus: false
  });
  
  const runManualTest = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('user_id')
        .limit(1);
      
      setTestResult({ data, error, timestamp: new Date().toISOString() });
    } catch (err) {
      setTestResult({ error: err.message, timestamp: new Date().toISOString() });
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug Page</h1>
      
      <div className="space-y-6">
        {/* Environment Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-500">VITE_SUPABASE_URL:</span>{' '}
              <span className="text-blue-500">{import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}</span>
            </div>
            <div>
              <span className="text-gray-500">Has Anon Key:</span>{' '}
              <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-500' : 'text-red-500'}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Connection Test Results */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Database Connection Test</h2>
          
          {isLoading && <p>Testing connection...</p>}
          
          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Connection Error:</p>
              <pre className="text-sm mt-2">{JSON.stringify(statsError, null, 2)}</pre>
            </div>
          )}
          
          {stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-gray-500">User Profiles</p>
                  <p className="text-2xl font-bold">
                    {stats.userCount.error ? '❌ Error' : stats.userCount.count || 0}
                  </p>
                  {stats.userCount.error && (
                    <p className="text-xs text-red-500 mt-1">{stats.userCount.error.message}</p>
                  )}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-gray-500">Active Content</p>
                  <p className="text-2xl font-bold">
                    {stats.contentCount.error ? '❌ Error' : stats.contentCount.count || 0}
                  </p>
                  {stats.contentCount.error && (
                    <p className="text-xs text-red-500 mt-1">{stats.contentCount.error.message}</p>
                  )}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-gray-500">Sessions Today</p>
                  <p className="text-2xl font-bold">
                    {stats.sessionCount.error ? '❌ Error' : stats.sessionCount.count || 0}
                  </p>
                  {stats.sessionCount.error && (
                    <p className="text-xs text-red-500 mt-1">{stats.sessionCount.error.message}</p>
                  )}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  <p className="text-2xl font-bold">
                    {stats.campaignCount.error ? '❌ Error' : stats.campaignCount.count || 0}
                  </p>
                  {stats.campaignCount.error && (
                    <p className="text-xs text-red-500 mt-1">{stats.campaignCount.error.message}</p>
                  )}
                </div>
              </div>
              
              {stats.sampleContent && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Sample Content Items:</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(stats.sampleContent, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Manual Test */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Manual Test</h2>
          <button
            onClick={runManualTest}
            className="btn btn-primary mb-4"
          >
            Run Manual Query
          </button>
          
          {testResult && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}