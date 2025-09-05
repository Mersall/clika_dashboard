import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { useAuth } from '@contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function UsersPage() {
  const { isAdmin } = useAuth();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">User Management</h1>
        <p className="mt-2 text-gray-400">Manage user accounts and permissions</p>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Display Name</th>
              <th>Country</th>
              <th>Geo Consent</th>
              <th>Personalized Ads</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user.user_id}>
                  <td className="font-mono text-xs">{user.user_id.slice(0, 8)}...</td>
                  <td>{user.display_name || '-'}</td>
                  <td>{user.country_code || '-'}</td>
                  <td>
                    <span className={`badge ${user.geo_consent ? 'badge-success' : 'badge-danger'}`}>
                      {user.geo_consent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.personalized_ads ? 'badge-success' : 'badge-danger'}`}>
                      {user.personalized_ads ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}