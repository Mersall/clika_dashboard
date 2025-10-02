import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  StarIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

interface UserPurchase {
  id: string;
  user_id: string;
  pack_id: string;
  purchased_at: string;
  purchase_price: string;
  currency: string;
  questions_played: number;
  last_played_at: string | null;
  rating: number | null;
  review: string | null;
  transaction_id: string | null;
  reviewed_at: string | null;
  // Joined fields
  user?: {
    email: string;
    raw_user_meta_data?: any;
  };
  pack?: {
    pack_name: string;
    pack_name_ar: string;
    game_key: string;
    question_count: number;
    pack_code: string;
  };
}

export function UserPurchasesPage() {
  const { t } = useTranslation();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [viewingPurchase, setViewingPurchase] = useState<UserPurchase | null>(null);

  // Fetch purchases with user and pack data
  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ['user-purchases'],
    queryFn: async () => {
      // First get purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('user_purchased_packs')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (purchaseError) throw purchaseError;
      if (!purchaseData) return [];

      // Get unique user IDs and pack IDs
      const userIds = [...new Set(purchaseData.map(p => p.user_id))];
      const packIds = [...new Set(purchaseData.map(p => p.pack_id))];

      // Fetch users
      const { data: userData, error: userError } = await supabase
        .auth.admin.listUsers();

      const userMap = new Map();
      if (!userError && userData?.users) {
        userData.users.forEach(user => {
          userMap.set(user.id, {
            email: user.email,
            raw_user_meta_data: user.user_metadata
          });
        });
      }

      // Fetch packs
      const { data: packData, error: packError } = await supabase
        .from('content_pack_store')
        .select('id, pack_name, pack_name_ar, game_key, question_count, pack_code')
        .in('id', packIds);

      const packMap = new Map();
      if (!packError && packData) {
        packData.forEach(pack => {
          packMap.set(pack.id, pack);
        });
      }

      // Combine data
      return purchaseData.map(purchase => ({
        ...purchase,
        user: userMap.get(purchase.user_id),
        pack: packMap.get(purchase.pack_id)
      }));
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!purchases) return null;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const purchases24h = purchases.filter(p => new Date(p.purchased_at) > last24h);
    const purchases7d = purchases.filter(p => new Date(p.purchased_at) > last7d);
    const purchases30d = purchases.filter(p => new Date(p.purchased_at) > last30d);

    const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.purchase_price), 0);
    const revenue24h = purchases24h.reduce((sum, p) => sum + parseFloat(p.purchase_price), 0);
    const revenue7d = purchases7d.reduce((sum, p) => sum + parseFloat(p.purchase_price), 0);
    const revenue30d = purchases30d.reduce((sum, p) => sum + parseFloat(p.purchase_price), 0);

    const uniqueUsers = new Set(purchases.map(p => p.user_id)).size;
    const avgPurchaseValue = totalRevenue / purchases.length;

    return {
      totalPurchases: purchases.length,
      purchases24h: purchases24h.length,
      purchases7d: purchases7d.length,
      purchases30d: purchases30d.length,
      totalRevenue,
      revenue24h,
      revenue7d,
      revenue30d,
      uniqueUsers,
      avgPurchaseValue
    };
  }, [purchases]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];

    let filtered = purchases;

    // Filter by game
    if (selectedGame !== 'all') {
      filtered = filtered.filter(p => p.pack?.game_key === selectedGame);
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (selectedDateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(p => new Date(p.purchased_at) > startDate);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.user?.email?.toLowerCase().includes(query) ||
        p.pack?.pack_name?.toLowerCase().includes(query) ||
        p.pack?.pack_name_ar?.toLowerCase().includes(query) ||
        p.transaction_id?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [purchases, selectedGame, selectedDateRange, searchQuery]);

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

  const getGameBadgeClass = (gameKey: string) => {
    switch (gameKey) {
      case 'who_among_us':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
      case 'agree_disagree':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      case 'guess_the_person':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShoppingCartIcon className="h-8 w-8 text-primary" />
              User Purchases
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Track and manage all user pack purchases
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalRevenue.toFixed(0)} EGP
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Last 24h: {stats.revenue24h.toFixed(0)} EGP
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Purchases</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalPurchases}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Last 7d: {stats.purchases7d}
                  </p>
                </div>
                <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Unique Buyers</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.uniqueUsers}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Avg per user: {(stats.totalPurchases / stats.uniqueUsers).toFixed(1)}
                  </p>
                </div>
                <UserIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Avg Purchase</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.avgPurchaseValue.toFixed(0)} EGP
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    30d revenue: {stats.revenue30d.toFixed(0)} EGP
                  </p>
                </div>
                <CheckBadgeIcon className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, pack name, or transaction ID..."
            className="input w-full pl-10"
          />
        </div>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="all">All Games</option>
          <option value="who_among_us">Who Among Us</option>
          <option value="agree_disagree">Agree/Disagree</option>
          <option value="guess_the_person">Guess The Person</option>
        </select>
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="all">All Time</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {t('common.error')}: {(error as any).message}
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No purchases match your search' : 'No purchases found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pack
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {purchase.user?.email || 'Unknown User'}
                      </p>
                      {purchase.user?.raw_user_meta_data?.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {purchase.user.raw_user_meta_data.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {purchase.pack?.pack_name || 'Unknown Pack'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {purchase.pack?.pack_code}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {purchase.pack && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGameBadgeClass(purchase.pack.game_key)}`}>
                        {purchase.pack.game_key.replace(/_/g, ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {purchase.purchase_price} {purchase.currency}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {purchase.questions_played}/{purchase.pack?.question_count || 0}
                      </p>
                      {purchase.pack && (
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (purchase.questions_played / purchase.pack.question_count) * 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(purchase.purchased_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewingPurchase(purchase)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        title="Purchase Details"
        size="lg"
      >
        {viewingPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User Email</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPurchase.user?.email || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pack Name</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPurchase.pack?.pack_name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</label>
                <p className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {viewingPurchase.transaction_id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(viewingPurchase.purchased_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Paid</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {viewingPurchase.purchase_price} {viewingPurchase.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {viewingPurchase.questions_played} / {viewingPurchase.pack?.question_count || 0} questions played
                </p>
              </div>
              {viewingPurchase.last_played_at && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Played</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(viewingPurchase.last_played_at).toLocaleString()}
                  </p>
                </div>
              )}
              {viewingPurchase.rating && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= viewingPurchase.rating!
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {viewingPurchase.review && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Review</label>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {viewingPurchase.review}
                </p>
                {viewingPurchase.reviewed_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Reviewed on {new Date(viewingPurchase.reviewed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setViewingPurchase(null)}
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