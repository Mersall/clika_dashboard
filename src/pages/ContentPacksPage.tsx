import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { 
  ArchiveBoxIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { ContentPackForm } from '../components/content/ContentPackForm';
import { ContentPackItems } from '../components/content/ContentPackItems';

interface ContentPack {
  id: string;
  name: string;
  game_key: 'who_among_us' | 'agree_disagree' | 'guess_the_person';
  tags: string[] | null;
  state: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
}


export function ContentPacksPage() {
  const { t } = useTranslation();
  const { isAdmin, isEditor, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPack, setEditingPack] = useState<ContentPack | null>(null);
  const [deletingPack, setDeletingPack] = useState<ContentPack | null>(null);
  const [managingItemsPack, setManagingItemsPack] = useState<ContentPack | null>(null);

  // Fetch content packs with item counts
  const { data: packs, isLoading, error } = useQuery({
    queryKey: ['content-packs'],
    queryFn: async () => {
      const { data: packs, error: packsError } = await supabase
        .from('content_pack')
        .select('*')
        .order('created_at', { ascending: false });

      if (packsError) throw packsError;

      // Get item counts for each pack
      const { data: counts, error: countsError } = await supabase
        .from('pack_item')
        .select('pack_id')
        .in('pack_id', packs?.map(p => p.id) || []);

      if (countsError) throw countsError;

      const countMap = counts?.reduce((acc, item) => {
        acc[item.pack_id] = (acc[item.pack_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return packs?.map(pack => ({
        ...pack,
        item_count: countMap?.[pack.id] || 0
      })) || [];
    }
  });

  // Create pack mutation
  const createPackMutation = useMutation({
    mutationFn: async (data: Partial<ContentPack>) => {
      const { error } = await supabase
        .from('content_pack')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(t('contentPacks.toast.created'));
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Update pack mutation
  const updatePackMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContentPack>) => {
      const { error } = await supabase
        .from('content_pack')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(t('contentPacks.toast.updated'));
      setEditingPack(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Delete pack mutation
  const deletePackMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete all pack items
      const { error: itemsError } = await supabase
        .from('pack_item')
        .delete()
        .eq('pack_id', id);
      if (itemsError) throw itemsError;

      // Then delete the pack
      const { error } = await supabase
        .from('content_pack')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(t('contentPacks.toast.deleted'));
      setDeletingPack(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Filter packs based on search query
  const filteredPacks = useMemo(() => {
    if (!packs || !searchQuery.trim()) return packs || [];
    
    const query = searchQuery.toLowerCase();
    return packs.filter(pack => 
      pack.name.toLowerCase().includes(query) ||
      pack.game_key.toLowerCase().includes(query) ||
      pack.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [packs, searchQuery]);

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

  if (!isAdmin && !isEditor) {
    return <Navigate to="/" replace />;
  }

  const getGameBadgeClass = (gameKey: string) => {
    switch (gameKey) {
      case 'who_among_us':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'agree_disagree':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'guess_the_person':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('contentPacks.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('contentPacks.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {t('contentPacks.create')}
        </button>
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
          placeholder={t('contentPacks.search')}
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
      ) : filteredPacks.length === 0 ? (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchQuery ? t('contentPacks.noMatch') : t('contentPacks.noPacks')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map((pack) => (
            <div key={pack.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {pack.name}
                  </h3>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGameBadgeClass(pack.game_key)}`}>
                      {t(`content.games.${pack.game_key}`)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setManagingItemsPack(pack)}
                    className="p-1 text-primary hover:text-primary-dark"
                    title={t('contentPacks.manageItems')}
                  >
                    <CubeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingPack(pack)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingPack(pack)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {pack.tags && pack.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {pack.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <TagIcon className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{t('contentPacks.itemCount', { count: pack.item_count || 0 })}</span>
                <span>{new Date(pack.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('contentPacks.createPack')}
        size="md"
      >
        <ContentPackForm
          onSubmit={(data) => createPackMutation.mutate(data)}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createPackMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingPack}
        onClose={() => setEditingPack(null)}
        title={t('contentPacks.editPack')}
        size="md"
      >
        {editingPack && (
          <ContentPackForm
            pack={editingPack}
            onSubmit={(data) => updatePackMutation.mutate({ id: editingPack.id, ...data })}
            onCancel={() => setEditingPack(null)}
            isLoading={updatePackMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPack}
        onClose={() => setDeletingPack(null)}
        onConfirm={() => deletingPack && deletePackMutation.mutate(deletingPack.id)}
        title={t('contentPacks.deleteConfirm.title')}
        message={t('contentPacks.deleteConfirm.message', { name: deletingPack?.name })}
        confirmText={t('contentPacks.deleteConfirm.confirmText')}
        confirmButtonClass="btn-danger"
      />

      {/* Manage Items Modal */}
      <Modal
        isOpen={!!managingItemsPack}
        onClose={() => setManagingItemsPack(null)}
        title={t('contentPacks.manageItems')}
        size="lg"
      >
        {managingItemsPack && (
          <ContentPackItems
            pack={managingItemsPack}
            onClose={() => setManagingItemsPack(null)}
          />
        )}
      </Modal>
    </div>
  );
}