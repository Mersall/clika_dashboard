import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, PlayIcon, PauseIcon, ArrowDownTrayIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, type Campaign } from '../hooks/useCampaigns';
import { format } from 'date-fns';
import { Modal } from '../components/ui/Modal';
import { CampaignForm } from '../components/campaigns/CampaignForm';
import { AdCreativeManager } from '../components/campaigns/AdCreativeManager';
import { useConfirm } from '../hooks/useConfirm';
import { Pagination } from '../components/ui/Pagination';
import { useSort } from '../hooks/useSort';
import { SortableTableHeader } from '../components/ui/SortableTableHeader';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { BulkActions } from '../components/ui/BulkActions';
import { toast } from 'react-hot-toast';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useExport } from '../hooks/useExport';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HelpTooltip } from '../components/ui/HelpTooltip';

export function CampaignsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [managingCreativesCampaign, setManagingCreativesCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch campaigns using our custom hook
  const { data: campaigns, isLoading, error } = useCampaigns();
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { exportData } = useExport();
  
  // Real-time subscriptions
  useRealtimeSubscription({
    table: 'ad_campaign',
    event: '*',
    queryKey: ['campaigns'],
    onUpdate: (payload) => {
      const action = payload.eventType;
      if (action === 'INSERT') {
        toast.success(t('campaigns.toast.created'));
      } else if (action === 'UPDATE') {
        toast.success(t('campaigns.toast.updated'));
      } else if (action === 'DELETE') {
        toast.success(t('campaigns.toast.deleted'));
      }
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'ended':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Filter campaigns based on search query
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    const filtered = campaigns.filter(campaign => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const name = campaign.name.toLowerCase();
      const status = (campaign.status || '').toLowerCase();
      const lang = (campaign.lang || '').toLowerCase();
      const geo = (campaign.geo_scope || '').toLowerCase();
      
      return name.includes(query) || status.includes(query) || lang.includes(query) || geo.includes(query);
    });
    
    return filtered;
  }, [campaigns, searchQuery]);

  // Sorting
  const { sortedData, toggleSort, getSortIcon } = useSort(filteredCampaigns, 'created_at', 'desc');
  
  // Bulk selection
  const {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    toggleAll,
    isAllSelected,
    isPartiallySelected,
    clearSelection,
    selectedCount,
  } = useBulkSelection(sortedData);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{t('campaigns.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">{t('campaigns.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const dataToExport = filteredCampaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status || 'draft',
                daily_cap: campaign.daily_cap || 0,
                sov_percentage: campaign.sov_pct || 0,
                start_date: formatDate(campaign.start_at),
                end_date: formatDate(campaign.end_at),
                geo_scope: campaign.geo_scope || 'Global',
                language: campaign.lang || 'All',
                created_at: campaign.created_at || '',
              }));
              
              exportData(
                dataToExport,
                ['id', 'name', 'status', 'daily_cap', 'sov_percentage', 'start_date', 'end_date', 'geo_scope', 'language', 'created_at'],
                { filename: 'campaigns-export' }
              );
            }}
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            {t('campaigns.export')}
          </button>
          <button
            onClick={() => {
              setEditingCampaign(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t('campaigns.create')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="w-full sm:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('campaigns.search')}
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Campaigns Table - Desktop */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={paginatedCampaigns.length > 0 && paginatedCampaigns.every(campaign => isSelected(campaign.id))}
                  ref={(el) => {
                    if (el) el.indeterminate = paginatedCampaigns.some(campaign => isSelected(campaign.id)) && !paginatedCampaigns.every(campaign => isSelected(campaign.id));
                  }}
                  onChange={() => {
                    const allPageSelected = paginatedCampaigns.every(campaign => isSelected(campaign.id));
                    paginatedCampaigns.forEach(campaign => {
                      if (allPageSelected && isSelected(campaign.id)) {
                        toggleSelection(campaign.id);
                      } else if (!allPageSelected && !isSelected(campaign.id)) {
                        toggleSelection(campaign.id);
                      }
                    });
                  }}
                  className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('campaigns.tableHeaders.campaignName')}</span>
                    <HelpTooltip helpKey="campaigns.columns.campaignName" />
                  </div>
                }
                sortKey="name"
                onSort={toggleSort}
                sortDirection={getSortIcon('name')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('campaigns.tableHeaders.status')}</span>
                    <HelpTooltip helpKey="campaigns.columns.status" />
                  </div>
                }
                sortKey="status"
                onSort={toggleSort}
                sortDirection={getSortIcon('status')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('campaigns.tableHeaders.budget')}</span>
                    <HelpTooltip helpKey="campaigns.columns.budget" />
                  </div>
                }
                sortKey="daily_cap"
                onSort={toggleSort}
                sortDirection={getSortIcon('daily_cap')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('campaigns.tableHeaders.sov')}</span>
                    <HelpTooltip helpKey="campaigns.columns.sov" />
                  </div>
                }
                sortKey="sov_pct"
                onSort={toggleSort}
                sortDirection={getSortIcon('sov_pct')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('campaigns.tableHeaders.startDate')}</span>
                    <HelpTooltip helpKey="campaigns.columns.dates" />
                  </div>
                }
                sortKey="start_at"
                onSort={toggleSort}
                sortDirection={getSortIcon('start_at')}
              />
              <th>
                <div className="flex items-center gap-1">
                  <span>{t('campaigns.tableHeaders.targeting')}</span>
                  <HelpTooltip helpKey="campaigns.columns.targeting" />
                </div>
              </th>
              <th>
                <div className="flex items-center gap-1">
                  <span>{t('campaigns.tableHeaders.actions')}</span>
                  <HelpTooltip helpKey="campaigns.columns.actions" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    <span className="ml-2">{t('campaigns.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-red-500">
                  {t('campaigns.error')}: {(error as any).message}
                </td>
              </tr>
            ) : paginatedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {searchQuery ? t('campaigns.noMatch') : t('campaigns.noCampaigns')}
                </td>
              </tr>
            ) : (
              paginatedCampaigns.map((campaign) => (
                <tr key={campaign.id} className={isSelected(campaign.id) ? 'bg-gray-800/50' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(campaign.id)}
                      onChange={() => toggleSelection(campaign.id)}
                      className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-100">{campaign.name}</div>
                      <div className="text-sm text-gray-500">ID: {campaign.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadge(campaign.status)
                    }`}>
                      {campaign.status ? t(`campaigns.statuses.${campaign.status}`) : t('campaigns.statuses.draft')}
                    </span>
                  </td>
                  <td className="text-sm">
                    {campaign.daily_cap 
                      ? `${campaign.daily_cap}/day`
                      : campaign.sov_pct
                      ? `${campaign.sov_pct}% SOV`
                      : '-'}
                  </td>
                  <td className="text-sm">
                    {campaign.sov_pct ? `${campaign.sov_pct}%` : '-'}
                  </td>
                  <td className="text-sm">
                    <div>
                      <div className="text-gray-300">{formatDate(campaign.start_at)}</div>
                      <div className="text-gray-500">{t('campaigns.targeting.to')} {formatDate(campaign.end_at)}</div>
                    </div>
                  </td>
                  <td className="text-sm">
                    <div className="max-w-xs">
                      {campaign.geo_targets ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300 mr-1">
                            {campaign.geo_scope || t('campaigns.targeting.global')}
                          </span>
                          {campaign.lang && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                              {campaign.lang}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">{t('campaigns.targeting.noTargeting')}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setManagingCreativesCampaign(campaign)}
                        className="text-gray-400 hover:text-primary-500"
                        title={t('campaigns.manageCreatives')}
                      >
                        <SparklesIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/campaigns/${campaign.id}/dayparting`)}
                        className="text-gray-400 hover:text-primary-500"
                        title="View Dayparting Analytics"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setShowModal(true);
                        }}
                        className="text-gray-400 hover:text-primary-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: t('campaigns.deleteConfirm.title'),
                            message: t('campaigns.deleteConfirm.message', { name: campaign.name }),
                            confirmText: t('campaigns.deleteConfirm.confirmText'),
                            type: 'danger',
                          });
                          if (confirmed) {
                            deleteMutation.mutate(campaign.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {filteredCampaigns.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCampaigns.length}
          />
        )}
      </div>

      {/* Campaigns Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              <span className="ml-2">{t('campaigns.loading')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {t('campaigns.error')}: {(error as any).message}
          </div>
        ) : paginatedCampaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? t('campaigns.noMatch') : t('campaigns.noCampaigns')}
          </div>
        ) : (
          <>
            {paginatedCampaigns.map((campaign) => (
              <div key={campaign.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={isSelected(campaign.id)}
                        onChange={() => toggleSelection(campaign.id)}
                        className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status ? t(`campaigns.statuses.${campaign.status}`) : t('campaigns.statuses.draft')}
                      </span>
                      <span className="text-xs text-gray-500">#{campaign.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="text-base font-medium text-gray-100 mb-2">{campaign.name}</h3>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex flex-wrap gap-x-4">
                        <div>
                          <span className="text-gray-500">{t('campaigns.tableHeaders.budget')}:</span>
                          <span className="ml-1">
                            {campaign.daily_cap 
                              ? `${campaign.daily_cap}/day`
                              : campaign.sov_pct
                              ? `${campaign.sov_pct}% SOV`
                              : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('campaigns.tableHeaders.sov')}:</span>
                          <span className="ml-1">{campaign.sov_pct ? `${campaign.sov_pct}%` : '-'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('campaigns.tableHeaders.startDate')}:</span>
                        <span className="ml-1">{formatDate(campaign.start_at)} {t('campaigns.targeting.to')} {formatDate(campaign.end_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('campaigns.tableHeaders.targeting')}:</span>
                        {campaign.geo_targets ? (
                          <span className="ml-1">
                            {campaign.geo_scope || t('campaigns.targeting.global')}
                            {campaign.lang && ` • ${campaign.lang}`}
                          </span>
                        ) : (
                          <span className="ml-1 text-gray-500">{t('campaigns.targeting.noTargeting')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button 
                      onClick={() => setManagingCreativesCampaign(campaign)}
                      className="text-gray-400 hover:text-primary-500 p-1"
                      title={t('campaigns.manageCreatives')}
                    >
                      <SparklesIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => navigate(`/campaigns/${campaign.id}/dayparting`)}
                      className="text-gray-400 hover:text-primary-500 p-1"
                      title="View Dayparting Analytics"
                    >
                      <ClockIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingCampaign(campaign);
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-primary-500 p-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t('campaigns.deleteConfirm.title'),
                          message: t('campaigns.deleteConfirm.message', { name: campaign.name }),
                          confirmText: t('campaigns.deleteConfirm.confirmText'),
                          type: 'danger',
                        });
                        if (confirmed) {
                          deleteMutation.mutate(campaign.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mobile Pagination */}
            {filteredCampaigns.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredCampaigns.length}
              />
            )}
          </>
        )}
      </div>

      {/* Campaign Stats Summary */}
      {campaigns && campaigns.length > 0 && (
        <div className="mt-6 sm:mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-medium text-gray-400">{t('campaigns.stats.total')}</h3>
              <HelpTooltip helpKey="campaigns.stats.total" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-100">{campaigns.length}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-medium text-gray-400">{t('campaigns.stats.active')}</h3>
              <HelpTooltip helpKey="campaigns.stats.active" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-100">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-medium text-gray-400">{t('campaigns.stats.dailyCap')}</h3>
              <HelpTooltip helpKey="campaigns.stats.dailyCap" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-100">
              {campaigns
                .reduce((sum, c) => sum + (c.daily_cap || 0), 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-medium text-gray-400">{t('campaigns.stats.avgSOV')}</h3>
              <HelpTooltip helpKey="campaigns.stats.avgSOV" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-100">
              {campaigns.filter(c => c.sov_pct).length > 0
                ? `${Math.round(
                    campaigns
                      .filter(c => c.sov_pct)
                      .reduce((sum, c) => sum + (c.sov_pct || 0), 0) /
                    campaigns.filter(c => c.sov_pct).length
                  )}%`
                : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCampaign(null);
        }}
        title={editingCampaign ? t('campaigns.form.editCampaign') : t('campaigns.form.createCampaign')}
        size="lg"
      >
        <CampaignForm
          initialValues={editingCampaign}
          onSubmit={async (values) => {
            try {
              if (editingCampaign) {
                await updateMutation.mutateAsync({ ...values, id: editingCampaign.id });
              } else {
                await createMutation.mutateAsync(values as any);
              }
              setShowModal(false);
              setEditingCampaign(null);
            } catch (error) {
              // Error is already handled by the mutation hook
            }
          }}
          onCancel={() => {
            setShowModal(false);
            setEditingCampaign(null);
          }}
        />
      </Modal>
      
      {/* Ad Creative Manager Modal */}
      {managingCreativesCampaign && (
        <AdCreativeManager
          campaign={managingCreativesCampaign}
          isOpen={!!managingCreativesCampaign}
          onClose={() => setManagingCreativesCampaign(null)}
        />
      )}
      
      <ConfirmDialogComponent />
      
      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedCount}
        actions={[
          {
            label: t('bulk.actions.activate'),
            icon: PlayIcon,
            action: async () => {
              const confirmed = await confirm({
                title: t('campaigns.bulkActions.activate.title'),
                message: t('campaigns.bulkActions.activate.message', { count: selectedCount }),
                confirmText: t('campaigns.bulkActions.activate.confirmText'),
              });
              if (confirmed) {
                for (const campaign of selectedItems) {
                  await updateMutation.mutateAsync({ ...campaign, status: 'active' });
                }
                clearSelection();
                toast.success(t('campaigns.toast.activated', { count: selectedCount }));
              }
            },
          },
          {
            label: t('bulk.actions.pause'),
            icon: PauseIcon,
            action: async () => {
              const confirmed = await confirm({
                title: t('campaigns.bulkActions.pause.title'),
                message: t('campaigns.bulkActions.pause.message', { count: selectedCount }),
                confirmText: t('campaigns.bulkActions.pause.confirmText'),
              });
              if (confirmed) {
                for (const campaign of selectedItems) {
                  await updateMutation.mutateAsync({ ...campaign, status: 'paused' });
                }
                clearSelection();
                toast.success(t('campaigns.toast.paused', { count: selectedCount }));
              }
            },
          },
          {
            label: t('bulk.actions.delete'),
            icon: TrashIcon,
            variant: 'danger',
            action: async () => {
              const confirmed = await confirm({
                title: t('campaigns.bulkActions.delete.title'),
                message: t('campaigns.bulkActions.delete.message', { count: selectedCount }),
                confirmText: t('campaigns.bulkActions.delete.confirmText'),
                type: 'danger',
              });
              if (confirmed) {
                for (const campaign of selectedItems) {
                  await deleteMutation.mutateAsync(campaign.id);
                }
                clearSelection();
                toast.success(t('campaigns.toast.bulkDeleted', { count: selectedCount }));
              }
            },
          },
        ]}
        onClear={clearSelection}
      />
    </div>
  );
}