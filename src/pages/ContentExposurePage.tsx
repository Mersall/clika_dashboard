import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useUserContentExposure, 
  useOverexposedContent, 
  useContentExposureStats,
  useResetUserExposure 
} from '@hooks/useContentExposure';
import { useUsers } from '@hooks/useUsers';
import { 
  EyeIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

export function ContentExposurePage() {
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [exposureThreshold, setExposureThreshold] = useState(5);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users } = useUsers();
  
  // Mock users for testing
  const testUsers = [
    { user_id: 'd8a7f3e2-1234-5678-9abc-def012345678', display_name: 'Test User 1', role: '' },
    { user_id: 'e9b8f4d3-2345-6789-abcd-ef0123456789', display_name: 'Test User 2', role: '' },
  ];
  const { data: userExposure, isLoading: userLoading } = useUserContentExposure(selectedUserId);
  const { data: overexposed, isLoading: overexposedLoading } = useOverexposedContent(exposureThreshold);
  const { data: stats } = useContentExposureStats();
  const resetMutation = useResetUserExposure();

  // Filter app users only - use test users for demo
  const appUsers = useMemo(() => {
    return testUsers;
  }, []);

  // Filter user exposure based on search
  const filteredExposure = useMemo(() => {
    if (!userExposure || !searchTerm) return userExposure;
    
    return userExposure.filter(item => 
      item.content?.content_text_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.content_text_ar?.includes(searchTerm.toLowerCase()) ||
      item.game_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userExposure, searchTerm]);

  const handleResetExposure = () => {
    if (selectedUserId) {
      resetMutation.mutate(selectedUserId, {
        onSuccess: () => {
          setShowResetDialog(false);
        }
      });
    }
  };

  // Get exposure level color
  const getExposureColor = (count: number) => {
    if (count >= 10) return 'text-red-600 dark:text-red-400';
    if (count >= 7) return 'text-orange-600 dark:text-orange-400';
    if (count >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getExposureBackground = (count: number) => {
    if (count >= 10) return 'bg-red-100 dark:bg-red-900/30';
    if (count >= 7) return 'bg-orange-100 dark:bg-orange-900/30';
    if (count >= 5) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('exposure.title')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t('exposure.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('exposure.stats.totalUsers')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('exposure.stats.totalViewed')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalContentViewed || 0}
              </p>
            </div>
            <EyeIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('exposure.stats.avgPerUser')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.avgSeenPerUser || 0}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('exposure.stats.overexposed')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.overexposedContent || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-warning opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Content Exposure */}
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('exposure.userExposure')}
            </h2>
            
            <div className="mt-4 space-y-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input w-full"
              >
                <option value="">{t('exposure.selectUser')}</option>
                {appUsers.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.display_name || user.email || t('users.unknownUser')}
                  </option>
                ))}
              </select>

              {selectedUserId && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('exposure.searchContent')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input ltr:pl-10 rtl:pr-10 w-full"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="btn btn-secondary"
                    disabled={!userExposure || userExposure.length === 0}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">{t('exposure.reset')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {selectedUserId ? (
              userLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                  </div>
                </div>
              ) : filteredExposure && filteredExposure.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('exposure.tableHeaders.content')}</th>
                      <th>{t('exposure.tableHeaders.game')}</th>
                      <th>{t('exposure.tableHeaders.seenCount')}</th>
                      <th>{t('exposure.tableHeaders.lastSeen')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExposure.map((item, index) => (
                      <tr key={`${item.content_id}-${index}`}>
                        <td className="max-w-xs truncate">
                          {item.content?.content_text_en || t('common.unknown')}
                        </td>
                        <td>{t(`content.games.${item.game_type}`)}</td>
                        <td>
                          <span className={`font-medium ${getExposureColor(item.seen_count)}`}>
                            {item.seen_count}
                          </span>
                        </td>
                        <td>{new Date(item.last_seen).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? t('exposure.noResults') : t('exposure.noExposure')}
                </div>
              )
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('exposure.selectUserPrompt')}
              </div>
            )}
          </div>
        </div>

        {/* Overexposed Content */}
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('exposure.overexposedContent')}
              </h2>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  {t('exposure.threshold')}:
                </label>
                <select
                  value={exposureThreshold}
                  onChange={(e) => setExposureThreshold(Number(e.target.value))}
                  className="input w-20"
                >
                  <option value={3}>3+</option>
                  <option value={5}>5+</option>
                  <option value={7}>7+</option>
                  <option value={10}>10+</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {overexposedLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2">{t('common.loading')}</span>
                </div>
              </div>
            ) : overexposed && overexposed.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('exposure.tableHeaders.content')}</th>
                    <th>{t('exposure.tableHeaders.exposures')}</th>
                    <th>{t('exposure.tableHeaders.users')}</th>
                    <th>{t('exposure.tableHeaders.maxSeen')}</th>
                  </tr>
                </thead>
                <tbody>
                  {overexposed.map((item, index) => (
                    <tr key={`${item.content_id}-${index}`} className={getExposureBackground(item.max_seen_count)}>
                      <td className="max-w-xs">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.content?.content_text_en || t('common.unknown')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`content.games.${item.game_type}`)}
                        </div>
                      </td>
                      <td className="text-center font-medium">
                        {item.total_exposures}
                      </td>
                      <td className="text-center">
                        {item.user_count}
                      </td>
                      <td className="text-center">
                        <span className={`font-medium ${getExposureColor(item.max_seen_count)}`}>
                          {item.max_seen_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('exposure.noOverexposed')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetExposure}
        title={t('exposure.resetDialog.title')}
        message={t('exposure.resetDialog.message')}
        confirmText={t('exposure.resetDialog.confirmText')}
        type="warning"
      />
    </div>
  );
}