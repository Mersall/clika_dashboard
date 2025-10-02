import { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, ClipboardDocumentCheckIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContent, useCreateContent, useUpdateContent, useDeleteContent, type ContentItem } from '../hooks/useContent';
import { Modal } from '../components/ui/Modal';
import { SimpleContentForm } from '../components/content/SimpleContentForm';
import { useConfirm } from '../hooks/useConfirm';
import { Pagination } from '../components/ui/Pagination';
import { useSort } from '../hooks/useSort';
import { SortableTableHeader } from '../components/ui/SortableTableHeader';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { BulkActions } from '../components/ui/BulkActions';
import { toast } from 'react-hot-toast';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useExport } from '../hooks/useExport';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { FootballLogo } from '../components/ui/FootballLogo';

export function ContentPage() {
  const { t } = useTranslation();

  const gameOptions = [
    { value: 'who_among_us', label: t('content.games.who_among_us') },
    { value: 'agree_disagree', label: t('content.games.agree_disagree') },
    { value: 'guess_the_person', label: t('content.games.guess_the_person') },
    { value: 'football_trivia', label: t('content.games.football_trivia') },
    { value: 'football_logos', label: t('content.games.football_logos') },
    { value: 'football_players', label: t('content.games.football_players') },
    { value: 'football_moments', label: t('content.games.football_moments') },
  ];
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch content items using our custom hook
  const { data: items, isLoading, error } = useContent(selectedGame);
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();
  const deleteMutation = useDeleteContent();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // Handle Go Live action
  const handleGoLive = async (item: ContentItem) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        status: 'live',
        active: true,
      });
      toast.success(t('content.publishSuccess') || 'Content published successfully');
    } catch (error) {
      toast.error(t('content.publishError') || 'Failed to publish content');
      console.error('Go live error:', error);
    }
  };
  const { exportData } = useExport();
  
  // Real-time subscriptions - temporarily disabled to debug loading issue
  // useRealtimeSubscription({
  //   table: 'content_item',
  //   event: '*',
  //   queryKey: ['content', selectedGame],
  //   onUpdate: (payload) => {
  //     const action = payload.eventType;
  //     if (action === 'INSERT') {
  //       toast.success(t('content.toast.created'));
  //     } else if (action === 'UPDATE') {
  //       toast.success(t('content.toast.updated'));
  //     } else if (action === 'DELETE') {
  //       toast.success(t('content.toast.deleted'));
  //     }
  //   },
  // });

  const getDepthLabel = (depth: string | null) => {
    if (!depth) return t('common.unknown') || 'Unknown';
    if (t(`content.levels.${depth}`)) {
      return t(`content.levels.${depth}`);
    }
    return `Level ${depth}`;
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    const filtered = items.filter(item => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const content = (
        item.payload?.question ||
        item.payload?.statement ||
        item.payload?.persona?.name ||
        item.payload?.persona?.name_en ||
        item.payload?.person_name ||
        ''
      ).toLowerCase();
      const tags = item.tags?.join(' ').toLowerCase() || '';
      const gameType = item.game_key.toLowerCase();

      return content.includes(query) || tags.includes(query) || gameType.includes(query);
    });
    
    return filtered;
  }, [items, searchQuery]);

  // Sorting
  const { sortedData, toggleSort, getSortIcon } = useSort(filteredItems, 'created_at', 'desc');
  
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
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedGame, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('content.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('content.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/content/review"
            className="btn btn-secondary"
          >
            <ClipboardDocumentCheckIcon className="mr-2 h-4 w-4" />
            {t('content.reviewQueue')}
          </Link>
          <div className="relative inline-block">
            <button
              className="btn btn-secondary"
              onClick={() => {
                const dataToExport = filteredItems.map(item => ({
                  id: item.id,
                  game: gameOptions.find(g => g.value === item.game_key)?.label || item.game_key,
                  content: item.payload?.question || item.payload?.statement || item.payload?.persona?.name || item.payload?.persona?.name_en || item.payload?.person_name || '',
                  difficulty: getDepthLabel(item.difficulty_or_depth),
                  tags: item.tags?.join(', ') || '',
                  status: item.active ? t('content.status.active') : t('content.status.inactive'),
                  created_at: item.created_at || '',
                  updated_at: item.updated_at || '',
                }));
                
                exportData(
                  dataToExport,
                  ['id', 'game', 'content', 'difficulty', 'tags', 'status', 'created_at', 'updated_at'],
                  { filename: `content-export-${selectedGame === 'all' ? 'all' : selectedGame}` }
                );
              }}
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              {t('content.export')}
            </button>
            <HelpTooltip helpKey="content.export" className="absolute -top-1 -right-2" iconSize="sm" />
          </div>
          <div className="relative inline-block">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {t('content.addContent')}
            </button>
            <HelpTooltip helpKey="content.addContent" className="absolute -top-1 -right-2" iconSize="sm" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="input select w-full sm:w-64"
        >
          <option value="all">{t('content.allGames')}</option>
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1 sm:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('content.search')}
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Content Table - Desktop */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={paginatedItems.length > 0 && paginatedItems.every(item => isSelected(item.id))}
                  ref={(el) => {
                    if (el) el.indeterminate = paginatedItems.some(item => isSelected(item.id)) && !paginatedItems.every(item => isSelected(item.id));
                  }}
                  onChange={() => {
                    const allPageSelected = paginatedItems.every(item => isSelected(item.id));
                    paginatedItems.forEach(item => {
                      if (allPageSelected && isSelected(item.id)) {
                        toggleSelection(item.id);
                      } else if (!allPageSelected && !isSelected(item.id)) {
                        toggleSelection(item.id);
                      }
                    });
                  }}
                  className="rounded border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </th>
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('content.tableHeaders.content')}</span>
                    <HelpTooltip helpKey="content.columns.content" />
                  </div>
                }
                sortKey="payload"
                onSort={toggleSort}
                sortDirection={getSortIcon('payload')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('content.tableHeaders.game')}</span>
                    <HelpTooltip helpKey="content.columns.game" />
                  </div>
                }
                sortKey="game_key"
                onSort={toggleSort}
                sortDirection={getSortIcon('game_key')}
              />
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('content.tableHeaders.difficulty')}</span>
                    <HelpTooltip helpKey="content.columns.difficulty" />
                  </div>
                }
                sortKey="difficulty_or_depth"
                onSort={toggleSort}
                sortDirection={getSortIcon('difficulty_or_depth')}
              />
              <th>
                <div className="flex items-center gap-1">
                  <span>{t('content.tableHeaders.tags')}</span>
                  <HelpTooltip helpKey="content.columns.tags" />
                </div>
              </th>
              <SortableTableHeader
                label={
                  <div className="flex items-center gap-1">
                    <span>{t('content.tableHeaders.status')}</span>
                    <HelpTooltip helpKey="content.columns.status" />
                  </div>
                }
                sortKey="active"
                onSort={toggleSort}
                sortDirection={getSortIcon('active')}
              />
              <th>
                <div className="flex items-center gap-1">
                  <span>{t('content.tableHeaders.actions')}</span>
                  <HelpTooltip helpKey="content.columns.actions" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    <span className="ml-2">{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-red-500">
                  {t('common.error')}: {(error as any).message}
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600 dark:text-gray-500">
                  {searchQuery ? t('content.noMatch') : t('content.noContent')}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className={isSelected(item.id) ? 'bg-gray-100 dark:bg-gray-800/50' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="rounded border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                  </td>
                  <td className="max-w-md">
                    <div className="flex items-center gap-2">
                      {item.game_key === 'football_logos' && (
                        <FootballLogo
                          logoUrl={item.payload?.logo_url}
                          teamName={item.payload?.answer_en || item.payload?.answer}
                          className="h-10 w-10"
                        />
                      )}
                      <div className="truncate text-gray-800 dark:text-gray-300">
                        {item.payload?.question ||
                         item.payload?.statement ||
                         item.payload?.persona?.name ||
                         item.payload?.persona?.name_en ||
                         item.payload?.team_name ||
                         item.payload?.club_name ||
                         item.payload?.player_name ||
                         item.payload?.name ||
                         item.payload?.moment_description ||
                         item.payload?.description ||
                         item.payload?.question_en ||
                         t('common.na')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {gameOptions.find((g) => g.value === item.game_key)?.label || item.game_key}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {getDepthLabel(item.difficulty_or_depth)}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                      {item.tags && item.tags.length > 3 && (
                        <span className="text-xs text-gray-600 dark:text-gray-500">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'live'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {item.status === 'live' ? t('content.status.live') || 'Live' : t('content.status.draft') || 'Draft'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.active ? t('content.status.active') : t('content.status.inactive')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {(item.status !== 'live' || !item.active) && (
                        <button
                          onClick={() => handleGoLive(item)}
                          className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                          title={t('content.goLive') || 'Go Live'}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: t('content.deleteConfirm.title'),
                            message: t('content.deleteConfirm.message', { game: item.game_key.replace(/_/g, ' ') }),
                            confirmText: t('content.deleteConfirm.confirmText'),
                            type: 'danger',
                          });
                          if (confirmed) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-secondary"
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
        {filteredItems.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredItems.length}
          />
        )}
      </div>

      {/* Content Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              <span className="ml-2">{t('common.loading')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {t('common.error')}: {(error as any).message}
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-500">
            {searchQuery ? t('content.noMatch') : t('content.noContent')}
          </div>
        ) : (
          <>
            {paginatedItems.map((item) => (
              <div key={item.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="rounded border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        {gameOptions.find((g) => g.value === item.game_key)?.label || item.game_key}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'live'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {item.status === 'live' ? 'Live' : 'Draft'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.active ? t('common.active') : t('common.inactive')}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      {item.game_key === 'football_logos' && (
                        <FootballLogo
                          logoUrl={item.payload?.logo_url}
                          teamName={item.payload?.answer_en || item.payload?.answer}
                          className="h-16 w-16"
                        />
                      )}
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {item.payload?.question ||
                         item.payload?.statement ||
                         item.payload?.persona?.name ||
                         item.payload?.persona?.name_en ||
                         item.payload?.team_name ||
                         item.payload?.club_name ||
                         item.payload?.player_name ||
                         item.payload?.name ||
                         item.payload?.moment_description ||
                         item.payload?.description ||
                         item.payload?.question_en ||
                         t('common.na')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {getDepthLabel(item.difficulty_or_depth)}
                      </span>
                      {item.tags?.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {(item.status !== 'live' || !item.active) && (
                      <button
                        onClick={() => handleGoLive(item)}
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors p-1"
                        title={t('content.goLive') || 'Go Live'}
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowModal(true);
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary p-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: t('content.deleteConfirm.title'),
                          message: t('content.deleteConfirm.message', { game: item.game_key.replace(/_/g, ' ') }),
                          confirmText: t('content.deleteConfirm.confirmText'),
                          type: 'danger',
                        });
                        if (confirmed) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-secondary p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mobile Pagination */}
            {filteredItems.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredItems.length}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? t('content.form.editContent') : t('content.form.createContent')}
        size="lg"
      >
        <SimpleContentForm
          initialValues={editingItem}
          onSubmit={async (values) => {
            try {
              if (editingItem) {
                await updateMutation.mutateAsync({ ...values, id: editingItem.id });
              } else {
                await createMutation.mutateAsync(values as any);
              }
              setShowModal(false);
              setEditingItem(null);
            } catch (error) {
              // Error is already handled by the mutation hook
            }
          }}
          onCancel={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>
      
      <ConfirmDialogComponent />
      
      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedCount}
        actions={[
          {
            label: t('bulk.actions.activate'),
            icon: CheckCircleIcon,
            action: async () => {
              const confirmed = await confirm({
                title: t('content.bulkActions.activate.title'),
                message: t('content.bulkActions.activate.message', { count: selectedCount }),
                confirmText: t('content.bulkActions.activate.confirmText'),
              });
              if (confirmed) {
                for (const item of selectedItems) {
                  await updateMutation.mutateAsync({ ...item, active: true });
                }
                clearSelection();
                toast.success(t('content.toast.activated', { count: selectedCount }));
              }
            },
          },
          {
            label: t('bulk.actions.deactivate'),
            icon: XCircleIcon,
            action: async () => {
              const confirmed = await confirm({
                title: t('content.bulkActions.deactivate.title'),
                message: t('content.bulkActions.deactivate.message', { count: selectedCount }),
                confirmText: t('content.bulkActions.deactivate.confirmText'),
              });
              if (confirmed) {
                for (const item of selectedItems) {
                  await updateMutation.mutateAsync({ ...item, active: false });
                }
                clearSelection();
                toast.success(t('content.toast.deactivated', { count: selectedCount }));
              }
            },
          },
          {
            label: t('bulk.actions.delete'),
            icon: TrashIcon,
            variant: 'danger',
            action: async () => {
              const confirmed = await confirm({
                title: t('content.bulkActions.delete.title'),
                message: t('content.bulkActions.delete.message', { count: selectedCount }),
                confirmText: t('content.bulkActions.delete.confirmText'),
                type: 'danger',
              });
              if (confirmed) {
                for (const item of selectedItems) {
                  await deleteMutation.mutateAsync(item.id);
                }
                clearSelection();
                toast.success(t('content.toast.bulkDeleted', { count: selectedCount }));
              }
            },
          },
        ]}
        onClear={clearSelection}
      />
    </div>
  );
}