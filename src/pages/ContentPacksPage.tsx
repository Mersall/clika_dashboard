import { useState, Fragment, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { Database } from '@services/supabase';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@components/ui/Modal';
import toast from 'react-hot-toast';

type ContentPack = Database['public']['Tables']['content_pack']['Row'];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'badge-warning' },
  { value: 'in_review', label: 'In Review', color: 'badge-info' },
  { value: 'approved', label: 'Approved', color: 'badge-success' },
  { value: 'live', label: 'Live', color: 'badge-primary' },
  { value: 'paused', label: 'Paused', color: 'badge-secondary' },
  { value: 'archived', label: 'Archived', color: 'badge-error' },
];

const gameOptions = [
  { value: 'who_among_us', label: 'Who Among Us?' },
  { value: 'agree_disagree', label: 'Agree/Disagree' },
  { value: 'guess_the_person', label: 'Guess the Person' },
];

export function ContentPacksPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPack, setEditingPack] = useState<ContentPack | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');

  // Fetch content packs
  const { data: packs, isLoading } = useQuery({
    queryKey: ['content-packs', statusFilter, gameFilter],
    queryFn: async () => {
      let query = supabase
        .from('content_pack')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('state', statusFilter);
      }

      if (gameFilter !== 'all') {
        query = query.eq('game_key', gameFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentPack[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (pack: Partial<ContentPack>) => {
      if (editingPack) {
        const { error } = await supabase
          .from('content_pack')
          .update(pack)
          .eq('id', editingPack.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_pack')
          .insert(pack);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success(editingPack ? 'Content pack updated' : 'Content pack created');
      setShowCreateModal(false);
      setEditingPack(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save content pack');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_pack')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success('Content pack deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete content pack');
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, state }: { id: string; state: string }) => {
      const { error } = await supabase
        .from('content_pack')
        .update({ state })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-packs'] });
      toast.success('Status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const pack = {
      name: formData.get('name') as string,
      game_key: formData.get('game_key') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      state: formData.get('state') as any,
    };
    
    saveMutation.mutate(pack);
  };

  const getNextStatus = (currentStatus: string) => {
    const workflow: Record<string, string> = {
      draft: 'in_review',
      in_review: 'approved',
      approved: 'live',
      live: 'paused',
      paused: 'live',
    };
    return workflow[currentStatus] || currentStatus;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Content Packs</h1>
          <p className="mt-2 text-gray-400">Manage content packs and their workflow</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Pack
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Games</option>
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Packs Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Pack Name</th>
              <th>Game</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Updated</th>
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
            ) : packs?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No content packs found
                </td>
              </tr>
            ) : (
              packs?.map((pack) => (
                <tr key={pack.id}>
                  <td className="font-medium">{pack.name}</td>
                  <td>
                    <span className="badge badge-info">
                      {gameOptions.find(g => g.value === pack.game_key)?.label}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {pack.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge-secondary text-xs">
                          {tag}
                        </span>
                      ))}
                      {pack.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{pack.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        statusOptions.find(s => s.value === pack.state)?.color || 'badge-info'
                      }`}>
                        {statusOptions.find(s => s.value === pack.state)?.label}
                      </span>
                      {pack.state !== 'archived' && pack.state !== 'live' && (
                        <button
                          onClick={() => statusMutation.mutate({
                            id: pack.id,
                            state: getNextStatus(pack.state),
                          })}
                          className="text-primary-500 hover:text-primary-400"
                          title={`Move to ${getNextStatus(pack.state)}`}
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-gray-400">
                    {new Date(pack.updated_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPack(pack);
                          setShowCreateModal(true);
                        }}
                        className="text-gray-400 hover:text-primary-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this pack?')) {
                            deleteMutation.mutate(pack.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500"
                        disabled={pack.state === 'live'}
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
      <Transition appear show={showCreateModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {
          setShowCreateModal(false);
          setEditingPack(null);
        }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-100 mb-4"
                  >
                    {editingPack ? 'Edit Content Pack' : 'Create New Content Pack'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pack Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingPack?.name || ''}
                        className="input w-full"
                        required
                        placeholder="Summer 2024 Collection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Game
                      </label>
                      <select
                        name="game_key"
                        defaultValue={editingPack?.game_key || ''}
                        className="input w-full"
                        required
                      >
                        <option value="">Select a game</option>
                        {gameOptions.map((game) => (
                          <option key={game.value} value={game.value}>
                            {game.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        defaultValue={editingPack?.tags?.join(', ') || ''}
                        className="input w-full"
                        placeholder="summer, fun, egyptian"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        name="state"
                        defaultValue={editingPack?.state || 'draft'}
                        className="input w-full"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setEditingPack(null);
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="btn btn-primary"
                      >
                        {saveMutation.isPending ? 'Saving...' : editingPack ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}