import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArchiveBoxIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

interface ContentPackStore {
  id: string;
  pack_code: string;
  game_key: string;
  pack_name: string;
  pack_name_ar: string;
  pack_description: string | null;
  pack_description_ar: string | null;
  question_count: number;
  price: string;
  original_price: string | null;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sample_questions: any;
  difficulty_distribution: any;
  tags: string[] | null;
  purchase_count: number;
  sort_order: number;
  rating: string | null;
  launch_date: string | null;
  created_at: string;
  updated_at: string;
}

export function ContentPackStorePage() {
  const { t } = useTranslation();
  const { isAdmin, isEditor, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPack, setEditingPack] = useState<ContentPackStore | null>(null);
  const [deletingPack, setDeletingPack] = useState<ContentPackStore | null>(null);
  const [viewingPack, setViewingPack] = useState<ContentPackStore | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('all');

  // Fetch premium packs
  const { data: packs, isLoading, error } = useQuery({
    queryKey: ['content-pack-store'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pack_store')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('content_pack_store')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pack-store'] });
      toast.success(t('common.updated'));
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('content_pack_store')
        .update({ is_featured, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pack-store'] });
      toast.success(t('common.updated'));
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Delete pack
  const deletePackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_pack_store')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pack-store'] });
      toast.success(t('common.deleted'));
      setDeletingPack(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Filter packs
  const filteredPacks = useMemo(() => {
    if (!packs) return [];

    let filtered = packs;

    // Filter by game
    if (selectedGame !== 'all') {
      filtered = filtered.filter(p => p.game_key === selectedGame);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.pack_name.toLowerCase().includes(query) ||
        p.pack_name_ar?.toLowerCase().includes(query) ||
        p.pack_code.toLowerCase().includes(query) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [packs, selectedGame, searchQuery]);

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
      case 'football_trivia':
      case 'football_logos':
      case 'football_players':
      case 'football_moments':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const formatPrice = (price: string, originalPrice: string | null, currency: string) => {
    const priceNum = parseFloat(price);
    const originalNum = originalPrice ? parseFloat(originalPrice) : null;

    if (originalNum && originalNum > priceNum) {
      const discount = Math.round((1 - priceNum / originalNum) * 100);
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {priceNum} {currency}
          </span>
          <span className="text-sm line-through text-gray-400">
            {originalNum} {currency}
          </span>
          <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-1 py-0.5 rounded">
            -{discount}%
          </span>
        </div>
      );
    }

    return (
      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {priceNum} {currency}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShoppingBagIcon className="h-8 w-8 text-primary" />
              Premium Pack Store
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage premium content packs for in-app purchases
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            disabled={true}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Pack
          </button>
        </div>

        {/* Stats Cards */}
        {packs && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Packs</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {packs.length}
                  </p>
                </div>
                <ArchiveBoxIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active Packs</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {packs.filter(p => p.is_active).length}
                  </p>
                </div>
                <SparklesIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Featured</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {packs.filter(p => p.is_featured).length}
                  </p>
                </div>
                <StarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Total Sales</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {packs.reduce((sum, p) => sum + p.purchase_count, 0)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
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
            placeholder="Search packs..."
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
          <option value="football_trivia">Football Trivia</option>
          <option value="football_logos">Football Logos</option>
          <option value="football_players">Football Players</option>
          <option value="football_moments">Football Moments</option>
        </select>
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
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No packs match your search' : 'No premium packs available'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map((pack) => (
            <div
              key={pack.id}
              className={`card p-6 hover:shadow-xl transition-all ${
                !pack.is_active ? 'opacity-60' : ''
              } ${
                pack.is_featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {pack.is_featured && (
                      <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGameBadgeClass(pack.game_key)}`}>
                      {pack.game_key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {pack.pack_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pack.pack_name_ar}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Code: {pack.pack_code}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setViewingPack(pack)}
                    className="p-1 text-primary hover:text-primary-dark"
                    title="View Details"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingPack(pack)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary"
                    disabled={true}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {pack.pack_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {pack.pack_description}
                </p>
              )}

              {/* Tags */}
              {pack.tags && pack.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {pack.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <TagIcon className="mr-1 h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  {pack.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{pack.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pack.question_count} questions
                  </span>
                  {formatPrice(pack.price, pack.original_price, pack.currency)}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {pack.purchase_count} purchases
                  </span>
                  {pack.rating && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{parseFloat(pack.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleActiveMutation.mutate({
                      id: pack.id,
                      is_active: !pack.is_active
                    })}
                    className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                      pack.is_active
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pack.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => toggleFeaturedMutation.mutate({
                      id: pack.id,
                      is_featured: !pack.is_featured
                    })}
                    className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                      pack.is_featured
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/70'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pack.is_featured ? 'Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingPack}
        onClose={() => setViewingPack(null)}
        title="Pack Details"
        size="lg"
      >
        {viewingPack && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pack Code</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.pack_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Game</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.game_key}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">English Name</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.pack_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Arabic Name</label>
                <p className="text-gray-900 dark:text-gray-100" dir="rtl">{viewingPack.pack_name_ar}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.question_count}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {viewingPack.price} {viewingPack.currency}
                  {viewingPack.original_price && ` (was ${viewingPack.original_price})`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchases</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.purchase_count}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
                <p className="text-gray-900 dark:text-gray-100">{viewingPack.sort_order}</p>
              </div>
            </div>

            {viewingPack.pack_description && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">English Description</label>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{viewingPack.pack_description}</p>
              </div>
            )}

            {viewingPack.pack_description_ar && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Arabic Description</label>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap" dir="rtl">{viewingPack.pack_description_ar}</p>
              </div>
            )}

            {viewingPack.sample_questions && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sample Questions</label>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(viewingPack.sample_questions, null, 2)}
                </pre>
              </div>
            )}

            {viewingPack.difficulty_distribution && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Distribution</label>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(viewingPack.difficulty_distribution, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setViewingPack(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPack}
        onClose={() => setDeletingPack(null)}
        onConfirm={() => deletingPack && deletePackMutation.mutate(deletingPack.id)}
        title="Delete Pack"
        message={`Are you sure you want to delete "${deletingPack?.pack_name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
}