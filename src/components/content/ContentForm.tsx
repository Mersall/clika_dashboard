import { useState, useEffect } from 'react';
import { Database } from '@services/supabase';

type ContentItem = Database['public']['Tables']['content_item']['Row'];

interface ContentFormProps {
  initialValues?: Partial<ContentItem>;
  onSubmit: (values: Partial<ContentItem>) => void;
  onCancel: () => void;
}

const gameOptions = [
  { value: 'who_among_us', label: 'Who Among Us?' },
  { value: 'agree_disagree', label: 'Agree/Disagree' },
  { value: 'guess_the_person', label: 'Guess the Person' },
];

const depthOptions = [
  { value: '0', label: 'L0 - Icebreaker' },
  { value: '1', label: 'L1 - Light' },
  { value: '2', label: 'L2 - Medium' },
  { value: '3', label: 'L3 - Deep' },
  { value: '4', label: 'L4 - Spicy' },
];

export function ContentForm({ initialValues, onSubmit, onCancel }: ContentFormProps) {
  const [formData, setFormData] = useState({
    game_key: initialValues?.game_key || 'who_among_us',
    difficulty_or_depth: initialValues?.difficulty_or_depth || '0',
    tags: initialValues?.tags?.join(', ') || '',
    similarity_group: initialValues?.similarity_group || '',
    active: initialValues?.active ?? true,
    status: initialValues?.status || 'draft',
    payload: {
      question: initialValues?.payload?.question || '',
      question_en: initialValues?.payload?.question_en || '',
      statement: initialValues?.payload?.statement || '',
      statement_en: initialValues?.payload?.statement_en || '',
      person_name: initialValues?.payload?.person_name || '',
      clues: initialValues?.payload?.clues || ['', '', ''],
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const payload: any = {};
    if (formData.game_key === 'who_among_us') {
      payload.question = formData.payload.question;
      payload.question_en = formData.payload.question_en;
    } else if (formData.game_key === 'agree_disagree') {
      payload.statement = formData.payload.statement;
      payload.statement_en = formData.payload.statement_en;
    } else if (formData.game_key === 'guess_the_person') {
      payload.person_name = formData.payload.person_name;
      payload.clues = formData.payload.clues.filter(Boolean);
    }
    
    onSubmit({
      game_key: formData.game_key as any,
      difficulty_or_depth: formData.difficulty_or_depth,
      tags: tagsArray,
      similarity_group: formData.similarity_group || null,
      active: formData.active,
      status: formData.status as any,
      payload,
    });
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
          className="input"
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
          Difficulty/Depth
        </label>
        <select
          value={formData.difficulty_or_depth}
          onChange={(e) => setFormData({ ...formData, difficulty_or_depth: e.target.value })}
          className="input"
        >
          {depthOptions.map((depth) => (
            <option key={depth.value} value={depth.value}>
              {depth.label}
            </option>
          ))}
        </select>
      </div>

      {/* Game-specific fields */}
      {formData.game_key === 'who_among_us' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Question (Arabic)
            </label>
            <textarea
              value={formData.payload.question}
              onChange={(e) => setFormData({
                ...formData,
                payload: { ...formData.payload, question: e.target.value }
              })}
              className="input"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Question (English)
            </label>
            <textarea
              value={formData.payload.question_en}
              onChange={(e) => setFormData({
                ...formData,
                payload: { ...formData.payload, question_en: e.target.value }
              })}
              className="input"
              rows={2}
            />
          </div>
        </>
      )}

      {formData.game_key === 'agree_disagree' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Statement (Arabic)
            </label>
            <textarea
              value={formData.payload.statement}
              onChange={(e) => setFormData({
                ...formData,
                payload: { ...formData.payload, statement: e.target.value }
              })}
              className="input"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Statement (English)
            </label>
            <textarea
              value={formData.payload.statement_en}
              onChange={(e) => setFormData({
                ...formData,
                payload: { ...formData.payload, statement_en: e.target.value }
              })}
              className="input"
              rows={2}
            />
          </div>
        </>
      )}

      {formData.game_key === 'guess_the_person' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Person Name
            </label>
            <input
              type="text"
              value={formData.payload.person_name}
              onChange={(e) => setFormData({
                ...formData,
                payload: { ...formData.payload, person_name: e.target.value }
              })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Clues
            </label>
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                value={formData.payload.clues[index] || ''}
                onChange={(e) => {
                  const newClues = [...formData.payload.clues];
                  newClues[index] = e.target.value;
                  setFormData({
                    ...formData,
                    payload: { ...formData.payload, clues: newClues }
                  });
                }}
                className="input mb-2"
                placeholder={`Clue ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="input"
          placeholder="food, lifestyle, culture"
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
          className="input"
          placeholder="Optional grouping identifier"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="input"
        >
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="live">Live</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-primary-600"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-300">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
        >
          {initialValues ? 'Update' : 'Create'} Content
        </button>
      </div>
    </form>
  );
}