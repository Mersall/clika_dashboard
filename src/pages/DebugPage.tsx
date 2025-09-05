import { useState } from 'react';
import { supabase } from '@services/supabase';
import { useAuth } from '@contexts/AuthContext';

export function DebugPage() {
  const { user, session, isAdmin } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, time: new Date().toISOString() }]);
  };

  const testAuth = async () => {
    setTestResults([]);
    
    // Test 1: Current session
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    addResult('Current Session', { 
      hasSession: !!currentSession,
      user: currentSession?.user?.email,
      role: currentSession?.user?.user_metadata?.role,
      error: sessionError?.message 
    });

    // Test 2: Direct table access
    const tables = ['user_profile', 'content_item', 'content_pack', 'ad_campaign'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      addResult(`Fetch ${table}`, { 
        success: !error, 
        count: data?.length || 0,
        error: error?.message,
        hint: error?.hint
      });
    }

    // Test 3: Check RLS context
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_auth_context');
    addResult('RLS Context', { data: rlsData, error: rlsError?.message });
  };

  const testLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'dashboard@clika.com',
      password: 'Dashboard2024!'
    });
    addResult('Login Test', { 
      success: !error,
      user: data?.user?.email,
      role: data?.user?.user_metadata?.role,
      error: error?.message 
    });
  };

  const clearSession = async () => {
    await supabase.auth.signOut();
    setTestResults([]);
    window.location.reload();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <h2 className="font-bold mb-2">Current State</h2>
        <pre className="text-sm">
          {JSON.stringify({
            user: user?.email,
            userRole: user?.user_metadata?.role,
            isAdmin,
            hasSession: !!session,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL
          }, null, 2)}
        </pre>
      </div>

      <div className="space-x-4 mb-6">
        <button onClick={testAuth} className="btn btn-primary">Test Auth & Fetch</button>
        <button onClick={testLogin} className="btn btn-secondary">Test Login</button>
        <button onClick={clearSession} className="btn btn-danger">Clear Session</button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, i) => (
          <div key={i} className="p-4 bg-gray-800 rounded">
            <h3 className="font-bold text-sm text-gray-400">{result.time} - {result.test}</h3>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}