import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  ClockIcon,
  ServerIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EndpointTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  table?: string;
  description: string;
  testFn: () => Promise<any>;
}

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error' | 'testing';
  responseTime?: number;
  error?: string;
  data?: any;
  timestamp?: string;
}

export function ApiTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define all endpoints to test
  const endpoints: EndpointTest[] = [
    // ========== CONTENT ENDPOINTS ==========
    {
      name: 'Get Content',
      endpoint: 'content',
      method: 'GET',
      table: 'content',
      description: 'Fetch all content items',
      testFn: async () => {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Insert Content',
      endpoint: 'content',
      method: 'POST',
      table: 'content',
      description: 'Create new content item',
      testFn: async () => {
        const { data, error } = await supabase
          .from('content')
          .insert({
            game: 'who_among_us',
            content_text: { en: 'Test Question', ar: 'سؤال اختبار' },
            level: 1,
            tags: ['test'],
            active: true
          })
          .select()
          .single();
        if (error) throw error;
        // Clean up
        if (data) {
          await supabase.from('content').delete().eq('id', data.id);
        }
        return data;
      }
    },
    {
      name: 'Update Content',
      endpoint: 'content',
      method: 'PUT',
      table: 'content',
      description: 'Update content item',
      testFn: async () => {
        const { data: items } = await supabase
          .from('content')
          .select('id')
          .limit(1);
        if (!items || items.length === 0) throw new Error('No content to update');
        
        const { data, error } = await supabase
          .from('content')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', items[0].id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    
    // ========== CONTENT PACK ENDPOINTS ==========
    {
      name: 'Get Content Packs',
      endpoint: 'content_pack',
      method: 'GET',
      table: 'content_pack',
      description: 'Fetch content packs',
      testFn: async () => {
        const { data, error } = await supabase
          .from('content_pack')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Pack Items',
      endpoint: 'pack_item',
      method: 'GET',
      table: 'pack_item',
      description: 'Fetch pack items',
      testFn: async () => {
        const { data, error } = await supabase
          .from('pack_item')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Pack Items with Relations',
      endpoint: 'pack_item',
      method: 'GET',
      table: 'pack_item',
      description: 'Fetch pack items with content and pack details',
      testFn: async () => {
        const { data, error } = await supabase
          .from('pack_item')
          .select(`
            *,
            content (*),
            content_pack (*)
          `)
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    
    // ========== CAMPAIGN ENDPOINTS ==========
    {
      name: 'Get Campaigns',
      endpoint: 'ad_campaign',
      method: 'GET',
      table: 'ad_campaign',
      description: 'Fetch ad campaigns',
      testFn: async () => {
        const { data, error } = await supabase
          .from('ad_campaign')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Active Campaigns',
      endpoint: 'ad_campaign',
      method: 'GET',
      table: 'ad_campaign',
      description: 'Fetch only active campaigns',
      testFn: async () => {
        const { data, error } = await supabase
          .from('ad_campaign')
          .select('*')
          .eq('status', 'active')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Ad Creatives',
      endpoint: 'ad_creative',
      method: 'GET',
      table: 'ad_creative',
      description: 'Fetch ad creatives',
      testFn: async () => {
        const { data, error } = await supabase
          .from('ad_creative')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Creatives with Campaign',
      endpoint: 'ad_creative',
      method: 'GET',
      table: 'ad_creative',
      description: 'Fetch ad creatives with campaign details',
      testFn: async () => {
        const { data, error } = await supabase
          .from('ad_creative')
          .select(`
            *,
            ad_campaign (*)
          `)
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    
    // ========== USER ENDPOINTS ==========
    {
      name: 'Get User Profiles',
      endpoint: 'user_profile',
      method: 'GET',
      table: 'user_profile',
      description: 'Fetch user profiles',
      testFn: async () => {
        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Current User Profile',
      endpoint: 'user_profile',
      method: 'GET',
      table: 'user_profile',
      description: 'Fetch current authenticated user profile',
      testFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Count Total Users',
      endpoint: 'user_profile',
      method: 'GET',
      table: 'user_profile',
      description: 'Count total user profiles',
      testFn: async () => {
        const { count, error } = await supabase
          .from('user_profile')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        return { count };
      }
    },
    
    // ========== SESSION ENDPOINTS ==========
    {
      name: 'Get Sessions',
      endpoint: 'session',
      method: 'GET',
      table: 'session',
      description: 'Fetch game sessions',
      testFn: async () => {
        const { data, error } = await supabase
          .from('session')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Sessions with User',
      endpoint: 'session',
      method: 'GET',
      table: 'session',
      description: 'Fetch sessions with user details',
      testFn: async () => {
        const { data, error } = await supabase
          .from('session')
          .select(`
            *,
            user_profile (*)
          `)
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Active Sessions',
      endpoint: 'session',
      method: 'GET',
      table: 'session',
      description: 'Fetch only active sessions',
      testFn: async () => {
        const { data, error } = await supabase
          .from('session')
          .select('*')
          .is('ended_at', null)
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    
    // ========== ROUND ENDPOINTS ==========
    {
      name: 'Get Rounds',
      endpoint: 'round',
      method: 'GET',
      table: 'round',
      description: 'Fetch game rounds',
      testFn: async () => {
        const { data, error } = await supabase
          .from('round')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Rounds with Session',
      endpoint: 'round',
      method: 'GET',
      table: 'round',
      description: 'Fetch rounds with session details',
      testFn: async () => {
        const { data, error } = await supabase
          .from('round')
          .select(`
            *,
            session (*)
          `)
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Count Rounds by Game',
      endpoint: 'round',
      method: 'GET',
      table: 'round',
      description: 'Count rounds grouped by game type',
      testFn: async () => {
        const { data, error } = await supabase
          .from('round')
          .select('game')
          .limit(100);
        if (error) throw error;
        
        // Group by game
        const counts = data?.reduce((acc: Record<string, number>, round) => {
          acc[round.game] = (acc[round.game] || 0) + 1;
          return acc;
        }, {});
        
        return counts;
      }
    },
    
    // ========== ANALYTICS ENDPOINTS ==========
    {
      name: 'Get User Seen Today',
      endpoint: 'user_seen_today',
      method: 'GET',
      table: 'user_seen_today',
      description: 'Fetch user content exposure',
      testFn: async () => {
        const { data, error } = await supabase
          .from('user_seen_today')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Exposure by User',
      endpoint: 'user_seen_today',
      method: 'GET',
      table: 'user_seen_today',
      description: 'Get content exposure for specific user',
      testFn: async () => {
        const { data: users } = await supabase
          .from('user_profile')
          .select('id')
          .limit(1);
        if (!users || users.length === 0) throw new Error('No users found');
        
        const { data, error } = await supabase
          .from('user_seen_today')
          .select('*')
          .eq('user_id', users[0].id);
        if (error) throw error;
        return data;
      }
    },
    
    // ========== FEATURE FLAGS ENDPOINTS ==========
    {
      name: 'Get Feature Flags',
      endpoint: 'feature_flag',
      method: 'GET',
      table: 'feature_flag',
      description: 'Fetch feature flags',
      testFn: async () => {
        const { data, error } = await supabase
          .from('feature_flag')
          .select('*')
          .limit(5);
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Get Active Feature Flags',
      endpoint: 'feature_flag',
      method: 'GET',
      table: 'feature_flag',
      description: 'Fetch only active feature flags',
      testFn: async () => {
        const { data, error } = await supabase
          .from('feature_flag')
          .select('*')
          .eq('active', true);
        if (error) throw error;
        return data;
      }
    },
    
    // ========== RPC FUNCTIONS ==========
    {
      name: 'Daily Active Users (7d)',
      endpoint: 'rpc/get_daily_active_users',
      method: 'POST',
      description: 'Get daily active users for last 7 days',
      testFn: async () => {
        const { data, error } = await supabase
          .rpc('get_daily_active_users', { days: 7 });
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Daily Active Users (30d)',
      endpoint: 'rpc/get_daily_active_users',
      method: 'POST',
      description: 'Get daily active users for last 30 days',
      testFn: async () => {
        const { data, error } = await supabase
          .rpc('get_daily_active_users', { days: 30 });
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Retention Cohorts (Weekly)',
      endpoint: 'rpc/get_retention_cohorts',
      method: 'POST',
      description: 'Get weekly retention cohorts',
      testFn: async () => {
        const { data, error } = await supabase
          .rpc('get_retention_cohorts', { cohort_size: 'week' });
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Retention Cohorts (Monthly)',
      endpoint: 'rpc/get_retention_cohorts',
      method: 'POST',
      description: 'Get monthly retention cohorts',
      testFn: async () => {
        const { data, error } = await supabase
          .rpc('get_retention_cohorts', { cohort_size: 'month' });
        if (error) throw error;
        return data;
      }
    },
    
    // ========== REALTIME SUBSCRIPTIONS ==========
    {
      name: 'Realtime Channel',
      endpoint: 'realtime/channel',
      method: 'GET',
      description: 'Test realtime subscription capability',
      testFn: async () => {
        const channel = supabase.channel('test-channel');
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            channel.unsubscribe();
            reject(new Error('Realtime connection timeout'));
          }, 5000);
          
          channel
            .on('system', { event: '*' }, (payload) => {
              clearTimeout(timeout);
              channel.unsubscribe();
              resolve({ status: 'connected', payload });
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(timeout);
                channel.unsubscribe();
                resolve({ status: 'subscribed' });
              } else if (status === 'CHANNEL_ERROR') {
                clearTimeout(timeout);
                channel.unsubscribe();
                reject(new Error('Channel error'));
              }
            });
        });
      }
    },
    
    // ========== AUTH ENDPOINTS ==========
    {
      name: 'Auth Status',
      endpoint: 'auth/user',
      method: 'GET',
      description: 'Check authentication status',
      testFn: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
      }
    },
    {
      name: 'Auth Session',
      endpoint: 'auth/session',
      method: 'GET',
      description: 'Get current session details',
      testFn: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      }
    },
    
    // ========== STORAGE ENDPOINTS ==========
    {
      name: 'Storage Buckets',
      endpoint: 'storage/buckets',
      method: 'GET',
      description: 'List storage buckets',
      testFn: async () => {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'Create Test Bucket',
      endpoint: 'storage/buckets',
      method: 'POST',
      description: 'Test bucket creation permissions',
      testFn: async () => {
        const bucketName = `test-${Date.now()}`;
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: false
        });
        if (error) throw error;
        
        // Clean up
        if (data) {
          await supabase.storage.deleteBucket(bucketName);
        }
        return { created: bucketName, cleaned: true };
      }
    },
    
    // ========== EDGE FUNCTIONS ==========
    {
      name: 'Edge Functions List',
      endpoint: 'functions/v1',
      method: 'GET',
      description: 'List available edge functions',
      testFn: async () => {
        // This is a mock test since edge functions list API might not be available
        return { status: 'Edge functions require specific endpoints' };
      }
    }
  ];

  const testEndpoint = async (endpoint: EndpointTest) => {
    setResults(prev => ({
      ...prev,
      [endpoint.endpoint]: {
        endpoint: endpoint.endpoint,
        status: 'testing',
        timestamp: new Date().toISOString()
      }
    }));

    const startTime = Date.now();
    
    try {
      const data = await endpoint.testFn();
      const responseTime = Date.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [endpoint.endpoint]: {
          endpoint: endpoint.endpoint,
          status: 'success',
          responseTime,
          data,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [endpoint.endpoint]: {
          endpoint: endpoint.endpoint,
          status: 'error',
          responseTime,
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    
    // Test endpoints sequentially to avoid rate limiting
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTestingAll(false);
  };

  const testCategoryEndpoints = async () => {
    setIsTestingAll(true);
    
    // Test only filtered endpoints
    for (const endpoint of filteredEndpoints) {
      await testEndpoint(endpoint);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTestingAll(false);
  };

  const toggleExpanded = (endpoint: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(endpoint)) {
      newExpanded.delete(endpoint);
    } else {
      newExpanded.add(endpoint);
    }
    setExpandedResults(newExpanded);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'testing':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  // Get categories from endpoints
  const categories = {
    all: 'All Endpoints',
    content: 'Content',
    campaigns: 'Campaigns',
    users: 'Users',
    sessions: 'Sessions & Rounds',
    analytics: 'Analytics',
    features: 'Feature Flags',
    rpc: 'RPC Functions',
    realtime: 'Realtime',
    auth: 'Authentication',
    storage: 'Storage',
    edge: 'Edge Functions'
  };

  // Filter endpoints by category
  const filteredEndpoints = selectedCategory === 'all' 
    ? endpoints 
    : endpoints.filter(endpoint => {
        const ep = endpoint.endpoint.toLowerCase();
        switch (selectedCategory) {
          case 'content':
            return ep.includes('content') || ep.includes('pack');
          case 'campaigns':
            return ep.includes('campaign') || ep.includes('creative');
          case 'users':
            return ep.includes('user_profile');
          case 'sessions':
            return ep.includes('session') || ep.includes('round');
          case 'analytics':
            return ep.includes('seen_today');
          case 'features':
            return ep.includes('feature_flag');
          case 'rpc':
            return ep.includes('rpc/');
          case 'realtime':
            return ep.includes('realtime');
          case 'auth':
            return ep.includes('auth/');
          case 'storage':
            return ep.includes('storage/');
          case 'edge':
            return ep.includes('functions/');
          default:
            return true;
        }
      });

  // Calculate summary stats
  const stats = {
    total: endpoints.length,
    tested: Object.keys(results).length,
    success: Object.values(results).filter(r => r.status === 'success').length,
    failed: Object.values(results).filter(r => r.status === 'error').length,
    pending: endpoints.length - Object.keys(results).length,
    categoryTotal: filteredEndpoints.length,
    categoryTested: filteredEndpoints.filter(e => results[e.endpoint]).length,
    categorySuccess: filteredEndpoints.filter(e => results[e.endpoint]?.status === 'success').length,
    categoryFailed: filteredEndpoints.filter(e => results[e.endpoint]?.status === 'error').length
  };

  useEffect(() => {
    // Test auth endpoint on mount
    const authEndpoint = endpoints.find(e => e.endpoint === 'auth/user');
    if (authEndpoint) {
      testEndpoint(authEndpoint);
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">API Endpoint Tester</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">
            Test all Supabase endpoints to identify issues
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testAllEndpoints}
            disabled={isTestingAll}
            className="btn btn-primary"
          >
            {isTestingAll ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <ServerIcon className="h-4 w-4 mr-2" />
                Test All Endpoints
              </>
            )}
          </button>
          {selectedCategory !== 'all' && (
            <button
              onClick={testCategoryEndpoints}
              disabled={isTestingAll}
              className="btn btn-secondary"
            >
              Test {categories[selectedCategory as keyof typeof categories]}
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({endpoints.filter(e => {
                    const ep = e.endpoint.toLowerCase();
                    switch (key) {
                      case 'content': return ep.includes('content') || ep.includes('pack');
                      case 'campaigns': return ep.includes('campaign') || ep.includes('creative');
                      case 'users': return ep.includes('user_profile');
                      case 'sessions': return ep.includes('session') || ep.includes('round');
                      case 'analytics': return ep.includes('seen_today');
                      case 'features': return ep.includes('feature_flag');
                      case 'rpc': return ep.includes('rpc/');
                      case 'realtime': return ep.includes('realtime');
                      case 'auth': return ep.includes('auth/');
                      case 'storage': return ep.includes('storage/');
                      case 'edge': return ep.includes('functions/');
                      default: return true;
                    }
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">
            {selectedCategory === 'all' ? 'Total' : categories[selectedCategory as keyof typeof categories]} Endpoints
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">
            {selectedCategory === 'all' ? stats.total : stats.categoryTotal}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Tested</h3>
          <p className="mt-2 text-2xl font-bold text-gray-100">
            {selectedCategory === 'all' ? stats.tested : stats.categoryTested}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Successful</h3>
          <p className="mt-2 text-2xl font-bold text-green-500">
            {selectedCategory === 'all' ? stats.success : stats.categorySuccess}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Failed</h3>
          <p className="mt-2 text-2xl font-bold text-red-500">
            {selectedCategory === 'all' ? stats.failed : stats.categoryFailed}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400">Pending</h3>
          <p className="mt-2 text-2xl font-bold text-gray-500">
            {selectedCategory === 'all' 
              ? stats.pending 
              : stats.categoryTotal - stats.categoryTested}
          </p>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Description</th>
              <th>Response Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredEndpoints.map((endpoint) => {
              const result = results[endpoint.endpoint];
              const isExpanded = expandedResults.has(endpoint.endpoint);
              
              return (
                <>
                  <tr key={endpoint.endpoint}>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result?.status || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusBadge(result?.status || 'pending')
                        }`}>
                          {result?.status || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-100">{endpoint.name}</div>
                        <div className="text-sm text-gray-500">{endpoint.endpoint}</div>
                        {endpoint.table && (
                          <div className="text-xs text-gray-600">Table: {endpoint.table}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        endpoint.method === 'GET' ? 'bg-blue-900 text-blue-200' :
                        endpoint.method === 'POST' ? 'bg-green-900 text-green-200' :
                        endpoint.method === 'PUT' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="text-sm text-gray-400">{endpoint.description}</td>
                    <td className="text-sm">
                      {result?.responseTime ? (
                        <span className={`${
                          result.responseTime < 200 ? 'text-green-500' :
                          result.responseTime < 500 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {result.responseTime}ms
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => testEndpoint(endpoint)}
                          disabled={result?.status === 'testing'}
                          className="text-gray-400 hover:text-primary-500 disabled:opacity-50"
                          title="Test endpoint"
                        >
                          <ArrowPathIcon className={`h-4 w-4 ${
                            result?.status === 'testing' ? 'animate-spin' : ''
                          }`} />
                        </button>
                        {result && (result.data || result.error) && (
                          <button
                            onClick={() => toggleExpanded(endpoint.endpoint)}
                            className="text-gray-400 hover:text-primary-500"
                            title="Toggle details"
                          >
                            <svg className={`h-4 w-4 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded details row */}
                  {isExpanded && result && (
                    <tr>
                      <td colSpan={6} className="bg-gray-900 p-4">
                        <div className="space-y-2">
                          {result.timestamp && (
                            <div className="text-sm text-gray-500">
                              Tested at: {format(new Date(result.timestamp), 'PPpp')}
                            </div>
                          )}
                          
                          {result.error && (
                            <div className="bg-red-900/20 border border-red-800 rounded p-3">
                              <div className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-medium text-red-400">Error:</div>
                                  <div className="text-sm text-red-300 mt-1">{result.error}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {result.data && (
                            <div className="bg-gray-800 rounded p-3">
                              <div className="font-medium text-gray-300 mb-2">Response Data:</div>
                              <pre className="text-xs text-gray-400 overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Help Section */}
      <div className="mt-6 card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Common Issues & Solutions</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300 font-medium">RLS (Row Level Security) Errors</p>
              <p className="text-sm text-gray-500 mt-1">
                Check RLS policies for the table. May need to add policies for authenticated users.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300 font-medium">Function Not Found</p>
              <p className="text-sm text-gray-500 mt-1">
                RPC functions may not exist or have incorrect permissions. Check database functions.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300 font-medium">Authentication Required</p>
              <p className="text-sm text-gray-500 mt-1">
                Ensure user is logged in and session is valid. Check auth status endpoint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}