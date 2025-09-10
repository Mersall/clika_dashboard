import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ContentPackItemsProps {
  pack: {
    id: string;
    name: string;
    game_key: string;
  };
  onClose: () => void;
}

interface ContentItem {
  id: string;
  game_key: string;
  difficulty_or_depth: string | null;
  tags: string[] | null;
  payload: any;
}

export function ContentPackItems({ pack, onClose }: ContentPackItemsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [addingItems, setAddingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch items in this pack
  const { data: packItems, isLoading: packItemsLoading } = useQuery({
    queryKey: ['pack-items', pack.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pack_item')
        .select(`
          content_item_id,
          sort_order,
          content_item (
            id,
            game_key,
            difficulty_or_depth,
            tags,
            payload
          )
        `)
        .eq('pack_id', pack.id)
        .order('sort_order');

      if (error) throw error;
      return data?.map(item => item.content_item).filter(Boolean) || [];
    }
  });

  // Fetch available items not in pack
  const { data: availableItems, isLoading: availableItemsLoading } = useQuery({
    queryKey: ['available-items', pack.game_key, pack.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_item')
        .select('id, game_key, difficulty_or_depth, tags, payload')
        .eq('game_key', pack.game_key)
        .eq('active', true);

      if (error) throw error;

      // Filter out items already in pack
      const packItemIds = packItems?.map(item => item.id) || [];
      return data?.filter(item => !packItemIds.includes(item.id)) || [];
    },
    enabled: addingItems && !!packItems
  });

  // Add items mutation
  const addItemsMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const packItemsToInsert = itemIds.map((itemId, index) => ({
        pack_id: pack.id,
        content_item_id: itemId,
        sort_order: (packItems?.length || 0) + index
      }));

      const { error } = await supabase
        .from('pack_item')
        .insert(packItemsToInsert);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-items', pack.id] });
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(t('contentPacks.toast.itemsAdded'));
      setAddingItems(false);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('pack_item')
        .delete()
        .eq('pack_id', pack.id)
        .eq('content_item_id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pack-items', pack.id] });
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(t('contentPacks.toast.itemRemoved'));
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    }
  });

  // Filter available items by search
  const filteredAvailableItems = useMemo(() => {
    if (!availableItems || !searchQuery.trim()) return availableItems || [];
    
    const query = searchQuery.toLowerCase();
    return availableItems.filter(item => {
      const content = getContentText(item);
      return content.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query));
    });
  }, [availableItems, searchQuery]);

  const getContentText = (item: ContentItem) => {
    switch (item.game_key) {
      case 'who_among_us':
        return item.payload?.question || '';
      case 'agree_disagree':
        return item.payload?.statement || '';
      case 'guess_the_person':
        return item.payload?.clues?.[0] || '';
      default:
        return '';
    }
  };

  const getDifficultyBadgeClass = (difficulty: string | null) => {
    switch (difficulty) {
      case '0': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case '1': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case '2': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case '3': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case '4': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('contentPacks.itemsInPack', { count: packItems?.length || 0 })}
        </h3>
        {!addingItems && (
          <button
            onClick={() => setAddingItems(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t('contentPacks.addItems')}
          </button>
        )}
      </div>

      {addingItems ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {t('contentPacks.selectItemsToAdd')}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAddingItems(false);
                  setSelectedItems([]);
                }}
                className="btn btn-secondary btn-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => addItemsMutation.mutate(selectedItems)}
                disabled={selectedItems.length === 0 || addItemsMutation.isPending}
                className="btn btn-primary btn-sm"
              >
                {addItemsMutation.isPending ? t('common.saving') : t('contentPacks.addSelected', { count: selectedItems.length })}
              </button>
            </div>
          </div>

          {/* Search available items */}
          <div className="relative">
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

          {/* Available items list */}
          <div className="max-h-96 overflow-y-auto space-y-2 border dark:border-gray-700 rounded-lg p-2">
            {availableItemsLoading ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2">{t('common.loading')}</span>
                </div>
              </div>
            ) : filteredAvailableItems?.length === 0 ? (
              <p className="text-center py-4 text-gray-600 dark:text-gray-400">
                {t('contentPacks.noAvailableItems')}
              </p>
            ) : (
              filteredAvailableItems?.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getContentText(item)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeClass(item.difficulty_or_depth)}`}>
                        {t(`content.levels.${item.difficulty_or_depth || '0'}`)}
                      </span>
                      {item.tags?.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {packItemsLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            </div>
          ) : packItems?.length === 0 ? (
            <p className="text-center py-8 text-gray-600 dark:text-gray-400">
              {t('contentPacks.noItemsInPack')}
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {packItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getContentText(item)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeClass(item.difficulty_or_depth)}`}>
                        {t(`content.levels.${item.difficulty_or_depth || '0'}`)}
                      </span>
                      {item.tags?.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                    className="ml-3 text-red-500 hover:text-red-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}