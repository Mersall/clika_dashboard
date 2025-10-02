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

const domainOptions = [
  { value: 'relationships', label: 'Relationships' },
  { value: 'habits', label: 'Habits' },
  { value: 'memories', label: 'Memories' },
  { value: 'dreams', label: 'Dreams' },
  { value: 'opinions', label: 'Opinions' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'emotions', label: 'Emotions' },
  { value: 'culture', label: 'Culture' },
];

const eraOptions = [
  { value: 'past', label: 'Past' },
  { value: 'present', label: 'Present' },
  { value: 'future', label: 'Future' },
  { value: 'timeless', label: 'Timeless' },
];

const moodOptions = [
  { value: 'funny', label: 'Funny' },
  { value: 'serious', label: 'Serious' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'provocative', label: 'Provocative' },
  { value: 'heartwarming', label: 'Heartwarming' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'playful', label: 'Playful' },
];

export function ContentForm({ initialValues, onSubmit, onCancel }: ContentFormProps) {
  const [formData, setFormData] = useState({
    game_key: initialValues?.game_key || 'who_among_us',
    difficulty_or_depth: initialValues?.difficulty_or_depth || '0',
    tags: initialValues?.tags?.join(', ') || '',
    similarity_group: initialValues?.similarity_group || '',
    active: initialValues?.active ?? true,
    status: initialValues?.status || 'draft',
    domain: initialValues?.domain || '',
    era: initialValues?.era || '',
    mood: initialValues?.mood || '',
    theme_category: initialValues?.theme_category || '',
    is_premium: initialValues?.is_premium ?? false,
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
      domain: formData.domain || null,
      era: formData.era || null,
      mood: formData.mood || null,
      theme_category: formData.theme_category || null,
      is_premium: formData.is_premium,
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

      {/* New metadata fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Domain
          </label>
          <select
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="input"
          >
            <option value="">Select Domain</option>
            {domainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Era
          </label>
          <select
            value={formData.era}
            onChange={(e) => setFormData({ ...formData, era: e.target.value })}
            className="input"
          >
            <option value="">Select Era</option>
            {eraOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mood
          </label>
          <select
            value={formData.mood}
            onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
            className="input"
          >
            <option value="">Select Mood</option>
            {moodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Theme Category
          </label>
          <input
            type="text"
            value={formData.theme_category}
            onChange={(e) => setFormData({ ...formData, theme_category: e.target.value })}
            className="input"
            placeholder="e.g., family, work, travel"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_premium}
            onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-300">Premium Content</span>
        </label>
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