import { useState, useEffect } from 'react';
import { ContentItem } from '../../hooks/useContent';

interface SimpleContentFormProps {
  initialValues?: ContentItem | null;
  onSubmit: (values: Partial<ContentItem>) => void | Promise<void>;
  onCancel: () => void;
}

const gameOptions = [
  { value: 'who_among_us', label: 'Who Among Us?' },
  { value: 'agree_disagree', label: 'Agree/Disagree' },
  { value: 'guess_the_person', label: 'Guess the Person' },
  { value: 'football_trivia', label: 'Football Trivia' },
  { value: 'football_logos', label: 'Football Logos' },
  { value: 'football_players', label: 'Football Players' },
  { value: 'football_moments', label: 'Football Moments' },
];

const depthOptions = [
  { value: '0', label: 'L0 - Icebreaker' },
  { value: '1', label: 'L1 - Light' },
  { value: '2', label: 'L2 - Medium' },
  { value: '3', label: 'L3 - Deep' },
  { value: '4', label: 'L4 - Spicy' },
];

export function SimpleContentForm({ initialValues, onSubmit, onCancel }: SimpleContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    game_key: initialValues?.game_key || 'who_among_us',
    difficulty_or_depth: initialValues?.difficulty_or_depth || '0',
    tags: initialValues?.tags?.join(', ') || '',
    similarity_group: initialValues?.similarity_group || '',
    active: initialValues?.active ?? true,
    status: initialValues?.status || 'draft',
    content: '',
  });

  useEffect(() => {
    // Extract content from payload based on game type
    if (initialValues?.payload) {
      let content = '';
      if (initialValues.game_key === 'who_among_us') {
        content = initialValues.payload.question || '';
      } else if (initialValues.game_key === 'agree_disagree') {
        content = initialValues.payload.statement || '';
      } else if (initialValues.game_key === 'guess_the_person') {
        content = initialValues.payload.person_name || '';
      } else if (initialValues.game_key === 'football_trivia') {
        content = initialValues.payload.question || initialValues.payload.question_en || '';
      } else if (initialValues.game_key === 'football_logos') {
        content = initialValues.payload.answer || initialValues.payload.answer_en || '';
      } else if (initialValues.game_key === 'football_players') {
        content = initialValues.payload.answer || initialValues.payload.answer_ar || '';
      } else if (initialValues.game_key === 'football_moments') {
        content = initialValues.payload.moment_description || initialValues.payload.description || '';
      }
      setFormData(prev => ({ ...prev, content }));
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      let payload: any = {};
      if (formData.game_key === 'who_among_us') {
        payload = { question: formData.content };
      } else if (formData.game_key === 'agree_disagree') {
        payload = { statement: formData.content };
      } else if (formData.game_key === 'guess_the_person') {
        payload = { person_name: formData.content, clues: [] };
      } else if (formData.game_key === 'football_trivia') {
        payload = { question: formData.content, answer: '' };
      } else if (formData.game_key === 'football_logos') {
        payload = { answer: formData.content, logo_url: '' };
      } else if (formData.game_key === 'football_players') {
        payload = { answer_ar: formData.content, hints_ar: [] };
      } else if (formData.game_key === 'football_moments') {
        payload = { moment_description: formData.content };
      }
      
      await onSubmit({
        ...(initialValues?.id && { id: initialValues.id }),
        game_key: formData.game_key,
        difficulty_or_depth: formData.difficulty_or_depth,
        tags: tagsArray,
        similarity_group: formData.similarity_group || null,
        active: formData.active,
        status: formData.status,
        payload,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentLabel = () => {
    switch (formData.game_key) {
      case 'who_among_us':
        return 'Question';
      case 'agree_disagree':
        return 'Statement';
      case 'guess_the_person':
        return 'Person Name';
      case 'football_trivia':
        return 'Question';
      case 'football_logos':
        return 'Team/Club Name';
      case 'football_players':
        return 'Player Name';
      case 'football_moments':
        return 'Moment Description';
      default:
        return 'Content';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Game Type
        </label>
        <select
          value={formData.game_key}
          onChange={(e) => setFormData({ ...formData, game_key: e.target.value })}
          className="input w-full"
        >
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {getContentLabel()}
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="input w-full"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Difficulty/Depth
        </label>
        <select
          value={formData.difficulty_or_depth}
          onChange={(e) => setFormData({ ...formData, difficulty_or_depth: e.target.value })}
          className="input w-full"
        >
          {depthOptions.map((depth) => (
            <option key={depth.value} value={depth.value}>
              {depth.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="input w-full"
          placeholder="e.g., fun, social, icebreaker"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Similarity Group
        </label>
        <input
          type="text"
          value={formData.similarity_group}
          onChange={(e) => setFormData({ ...formData, similarity_group: e.target.value })}
          className="input w-full"
          placeholder="Optional grouping for similar content"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-300">Active</span>
        </label>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input input-sm"
          >
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="live">Live</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : `${initialValues ? 'Update' : 'Create'} Content`}
        </button>
      </div>
    </form>
  );
}