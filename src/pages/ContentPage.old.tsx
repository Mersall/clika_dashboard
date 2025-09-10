import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { Database } from '@services/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Modal } from '@components/ui/Modal';
import { ContentForm } from '@components/content/ContentForm';

type ContentItem = Database['public']['Tables']['content_item']['Row'];

const gameOptions = [
  { value: 'who_among_us', label: 'Who Among Us?' },
  { value: 'agree_disagree', label: 'Agree/Disagree' },
  { value: 'guess_the_person', label: 'Guess the Person' },
];

export function ContentPage() {
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
  // Debug mounting
  console.log('ContentPage mounted');

  // Fetch content items
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['content', selectedGame],
    queryFn: async () => {
      console.log('Fetching content items...');
      let query = supabase.from('content_item').select('*').order('created_at', { ascending: false });
      
      if (selectedGame !== 'all') {
        query = query.eq('game_key', selectedGame);
      }
      
      const { data, error } = await query;
      console.log('Query response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data as ContentItem[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (item: Partial<ContentItem>) => {
      if (editingItem) {
        const { error } = await supabase
          .from('content_item')
          .update(item)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_item')
          .insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success(editingItem ? 'Content updated' : 'Content created');
      setShowCreateModal(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save content');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_item')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete content');
    },
  });

  const getDepthLabel = (depth: string | null) => {
    if (!depth) return 'Unknown';
    const depthNum = parseInt(depth, 10);
    if (isNaN(depthNum)) return depth;
    const labels = ['L0 - Icebreaker', 'L1 - Light', 'L2 - Medium', 'L3 - Deep', 'L4 - Spicy'];
    return labels[depthNum] || `Level ${depthNum}`;
  };
  
  console.log('Render - isLoading:', isLoading, 'error:', error, 'items:', items?.length);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Content Management</h1>
          <p className="mt-2 text-gray-400">Manage game content and questions</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowCreateModal(true);
          }}
          className="btn btn-primary"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="input w-64"
        >
          <option value="all">All Games</option>
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Game</th>
              <th>Depth/Difficulty</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Actions</th>
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
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-red-500">
                  Error loading content: {error.message}
                </td>
              </tr>
            ) : items?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No content found
                </td>
              </tr>
            ) : (
              items?.map((item) => (
                <tr key={item.id}>
                  <td className="max-w-md">
                    <div className="truncate">
                      {item.payload.question || item.payload.statement || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {gameOptions.find((g) => g.value === item.game_key)?.label}
                    </span>
                  </td>
                  <td>{getDepthLabel(item.difficulty_or_depth)}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge-info text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.tags && item.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowCreateModal(true);
                        }}
                        className="text-gray-400 hover:text-primary-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this content?')) {
                            deleteMutation.mutate(item.id);
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
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Content' : 'Create Content'}
        size="lg"
      >
        <ContentForm
          initialValues={editingItem || undefined}
          onSubmit={(values) => {
            saveMutation.mutate(values as any);
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>
    </div>
  );
}