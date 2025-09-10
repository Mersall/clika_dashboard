import { useState, useMemo } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { useUsers, useUpdateUser, type User } from '../hooks/useUsers';
import { PencilIcon, UserIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ShieldCheckIcon, UsersIcon as UsersGroupIcon } from '@heroicons/react/24/outline';
import { Pagination } from '../components/ui/Pagination';
import { useSort } from '../hooks/useSort';
import { SortableTableHeader } from '../components/ui/SortableTableHeader';
import { Modal } from '../components/ui/Modal';
import { UserForm } from '../components/users/UserForm';
import { toast } from 'react-hot-toast';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useExport } from '../hooks/useExport';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../components/ui/HelpTooltip';

export function UsersPage() {
  const { t } = useTranslation();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUserData, setEditingUserData] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'admin' | 'app'>('admin');
  const itemsPerPage = 10;
  
  // All hooks must be called before any conditional returns
  const { data: users, isLoading, error } = useUsers();
  const updateUserMutation = useUpdateUser();
  const { exportData } = useExport();
  
  // Real-time subscriptions
  useRealtimeSubscription({
    table: 'user_profile',
    event: '*',
    queryKey: ['users'],
    onUpdate: (payload) => {
      const action = payload.eventType;
      if (action === 'INSERT') {
        toast.success(t('users.toast.created'));
      } else if (action === 'UPDATE') {
        toast.success(t('users.toast.updated'));
      } else if (action === 'DELETE') {
        toast.success(t('users.toast.deleted'));
      }
    },
  });
  
  // Separate users by type
  const { adminUsers, appUsers } = useMemo(() => {
    if (!users) return { adminUsers: [], appUsers: [] };
    
    // Admin users are any users with a role (admin, editor, analyst, reviewer, advertiser)
    const admins = users.filter(user => user.role && user.role !== '');
    // App users are regular users without any role
    const apps = users.filter(user => !user.role || user.role === '');
    
    return { adminUsers: admins, appUsers: apps };
  }, [users]);
  
  // Filter users based on search query and active tab
  const filteredUsers = useMemo(() => {
    const usersList = activeTab === 'admin' ? adminUsers : appUsers;
    
    if (!searchQuery.trim()) return usersList;
    
    const query = searchQuery.toLowerCase();
    return usersList.filter(user => {
      const displayName = (user.display_name || '').toLowerCase();
      const role = (user.role || '').toLowerCase();
      return displayName.includes(query) || role.includes(query) || user.user_id.toLowerCase().includes(query);
    });
  }, [adminUsers, appUsers, searchQuery, activeTab]);

  // Sorting
  const { sortedData, toggleSort, getSortIcon } = useSort(filteredUsers, 'created_at', 'desc');

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Show loading while checking role
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

  // Redirect if not admin after loading
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }


  const getRoleBadgeClass = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'editor':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'reviewer':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'advertiser':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'analyst':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <table className="table">
      <thead>
        <tr>
          <SortableTableHeader
            label={
              <div className="flex items-center gap-1">
                <span>{t('users.tableHeaders.user')}</span>
                <HelpTooltip helpKey="users.columns.user" />
              </div>
            }
            sortKey="display_name"
            onSort={toggleSort}
            sortDirection={getSortIcon('display_name')}
          />
          <SortableTableHeader
            label={
              <div className="flex items-center gap-1">
                <span>{t('users.tableHeaders.userId')}</span>
                <HelpTooltip helpKey="users.columns.userId" />
              </div>
            }
            sortKey="user_id"
            onSort={toggleSort}
            sortDirection={getSortIcon('user_id')}
          />
          <SortableTableHeader
            label={
              <div className="flex items-center gap-1">
                <span>{t('users.tableHeaders.role')}</span>
                <HelpTooltip helpKey="users.columns.role" />
              </div>
            }
            sortKey="role"
            onSort={toggleSort}
            sortDirection={getSortIcon('role')}
          />
          <SortableTableHeader
            label={
              <div className="flex items-center gap-1">
                <span>{t('users.tableHeaders.createdAt')}</span>
                <HelpTooltip helpKey="users.columns.createdAt" />
              </div>
            }
            sortKey="created_at"
            onSort={toggleSort}
            sortDirection={getSortIcon('created_at')}
          />
          <th>
            <div className="flex items-center gap-1">
              <span>{t('users.tableHeaders.actions')}</span>
              <HelpTooltip helpKey="users.columns.actions" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
        {users.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-8 text-gray-600 dark:text-gray-500">
              {searchQuery ? t('users.noMatch') : t('users.noUsers')}
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.user_id}>
              <td>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.display_name || t('users.unnamed')}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-xs text-gray-600 dark:text-gray-500 font-mono">
                  {user.user_id}
                </span>
              </td>
              <td>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                  {t(`users.roles.${user.role || 'reviewer'}`)}
                </span>
              </td>
              <td className="text-sm text-gray-600 dark:text-gray-400">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingUserData(user);
                      setShowModal(true);
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const UserCards = ({ users }: { users: User[] }) => (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-500">
          {searchQuery ? t('users.noMatch') : t('users.noUsers')}
        </div>
      ) : (
        users.map((user) => (
          <div key={user.user_id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.display_name || t('users.unnamed')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 font-mono">
                    {user.user_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingUserData(user);
                  setShowModal(true);
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-primary p-1"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                {t(`users.roles.${user.role || 'reviewer'}`)}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-500">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('users.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('users.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const dataToExport = filteredUsers.map(user => ({
                id: user.user_id,
                display_name: user.display_name || '',
                role: user.role || 'reviewer',
                created_at: user.created_at || '',
                updated_at: user.updated_at || '',
              }));
              
              exportData(
                dataToExport,
                ['id', 'display_name', 'role', 'created_at', 'updated_at'],
                { filename: `${activeTab}-users-export` }
              );
            }}
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            {t('users.export')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'admin'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheckIcon className="inline-block h-5 w-5 mr-2 -mt-1" />
            {t('users.tabs.adminUsers')} ({adminUsers.length})
            <HelpTooltip helpKey="users.tabs.adminUsers" className="inline-block ml-1" iconSize="sm" />
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'app'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <UsersGroupIcon className="inline-block h-5 w-5 mr-2 -mt-1" />
            {t('users.tabs.appUsers')} ({appUsers.length})
            <HelpTooltip helpKey="users.tabs.appUsers" className="inline-block ml-1" iconSize="sm" />
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('users.search')}
          className="input w-full pl-10"
        />
      </div>

      {/* Content */}
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
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block card overflow-hidden">
            <UserTable users={paginatedUsers} />
            
            {/* Pagination */}
            {filteredUsers.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <UserCards users={paginatedUsers} />
            
            {/* Mobile Pagination */}
            {filteredUsers.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
              />
            )}
          </div>
        </>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUserData(null);
        }}
        title={t('users.form.editUser')}
        size="md"
      >
        {editingUserData && (
          <UserForm
            initialValues={editingUserData}
            onSubmit={async (values) => {
              await updateUserMutation.mutateAsync({ id: editingUserData.user_id, ...values });
              setShowModal(false);
              setEditingUserData(null);
            }}
            onCancel={() => {
              setShowModal(false);
              setEditingUserData(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}