import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { ContentItem } from '../../hooks/useContent';
import { useUpdateContent } from '../../hooks/useContent';
import { toast } from 'react-hot-toast';
import { CONTENT_TAGS, POPULAR_TAGS } from '../../constants/contentTags';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export function EditContentModal({
  isOpen,
  onClose,
  item,
}: EditContentModalProps) {
  const updateMutation = useUpdateContent();

  // Form state
  const [formData, setFormData] = useState({
    payload: {} as any,
    tags: [] as string[],
    difficulty_or_depth: '',
    similarity_group: '',
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        payload: item.payload || {},
        tags: item.tags || [],
        difficulty_or_depth: item.difficulty_or_depth || '',
        similarity_group: item.similarity_group || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      await updateMutation.mutateAsync({
        ...item,
        ...formData,
      });
      toast.success('Content updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  const handlePayloadChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      payload: {
        ...prev.payload,
        [field]: value,
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  if (!item) return null;

  const renderGameSpecificFields = () => {
    switch (item.game_key) {
      case 'who_among_us':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question
            </label>
            <textarea
              value={formData.payload.question || ''}
              onChange={(e) => handlePayloadChange('question', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
              rows={3}
              required
            />
          </div>
        );

      case 'agree_disagree':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statement
            </label>
            <textarea
              value={formData.payload.statement || ''}
              onChange={(e) => handlePayloadChange('statement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
              rows={3}
              required
            />
          </div>
        );

      case 'guess_the_person':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Person Name
              </label>
              <input
                type="text"
                value={formData.payload.persona?.name || formData.payload.person_name || ''}
                onChange={(e) => {
                  if (formData.payload.persona) {
                    handlePayloadChange('persona', {
                      ...formData.payload.persona,
                      name: e.target.value,
                    });
                  } else {
                    handlePayloadChange('person_name', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clues (one per line)
              </label>
              <textarea
                value={(formData.payload.persona?.clues || formData.payload.clues || []).join('\n')}
                onChange={(e) => {
                  const clues = e.target.value.split('\n').filter(clue => clue.trim());
                  if (formData.payload.persona) {
                    handlePayloadChange('persona', {
                      ...formData.payload.persona,
                      clues,
                    });
                  } else {
                    handlePayloadChange('clues', clues);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
                rows={4}
                placeholder="Enter clues, one per line"
                required
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.payload, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, payload: parsed }));
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
              rows={6}
            />
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${item.game_key.replace('_', ' ')} Content`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game-specific fields */}
        {renderGameSpecificFields()}

        {/* Difficulty/Depth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty/Depth Level
          </label>
          <select
            value={formData.difficulty_or_depth}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty_or_depth: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Select Level</option>
            <option value="0">L0 - Icebreaker</option>
            <option value="1">L1 - Light</option>
            <option value="2">L2 - Medium</option>
            <option value="3">L3 - Deep</option>
            <option value="4">L4 - Spicy</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>

          {/* Current Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 inline-flex items-center p-0.5 text-primary hover:bg-primary hover:text-white rounded-full"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="m0 0l8 8m0-8l-8 8" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
              placeholder="Add a tag or select from suggestions below..."
            />
            <button
              type="button"
              onClick={addTag}
              className="btn btn-outline btn-sm"
            >
              Add
            </button>
          </div>

          {/* Popular Tags */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Popular Tags:</h4>
            <div className="flex flex-wrap gap-1">
              {POPULAR_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                  }}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Tag Suggestions */}
          <div className="space-y-2">
            {Object.entries(CONTENT_TAGS).map(([category, tags]) => {
              const availableTags = tags.filter(tag => !formData.tags.includes(tag)).slice(0, 8);
              if (availableTags.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {category.replace('_', ' ')}:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        }}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Similarity Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Similarity Group
          </label>
          <input
            type="text"
            value={formData.similarity_group}
            onChange={(e) => setFormData(prev => ({ ...prev, similarity_group: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
            placeholder="Optional similarity group identifier"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn btn-primary btn-sm"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}