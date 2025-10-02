import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContentPackFormProps {
  pack?: {
    id: string;
    name: string;
    game_key: 'who_among_us' | 'agree_disagree' | 'guess_the_person' | 'football_trivia' | 'football_logos' | 'football_players' | 'football_moments';
    tags: string[] | null;
    state: string | null;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContentPackForm({ pack, onSubmit, onCancel, isLoading }: ContentPackFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: pack?.name || '',
    game_key: pack?.game_key || '',
    tags: pack?.tags?.join(', ') || '',
    state: pack?.state || 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contentPacks.form.packName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full"
          required
          placeholder={t('contentPacks.form.packNamePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('content.form.gameType')}
        </label>
        <select
          value={formData.game_key}
          onChange={(e) => setFormData({ ...formData, game_key: e.target.value as any })}
          className="input w-full"
          required
        >
          <option value="">{t('contentPacks.form.selectGame')}</option>
          <option value="who_among_us">{t('content.games.who_among_us')}</option>
          <option value="agree_disagree">{t('content.games.agree_disagree')}</option>
          <option value="guess_the_person">{t('content.games.guess_the_person')}</option>
          <option value="football_trivia">{t('content.games.football_trivia')}</option>
          <option value="football_logos">{t('content.games.football_logos')}</option>
          <option value="football_players">{t('content.games.football_players')}</option>
          <option value="football_moments">{t('content.games.football_moments')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('content.form.tags')}
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="input w-full"
          placeholder={t('contentPacks.form.tagsPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('contentPacks.form.status')}
        </label>
        <select
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          className="input w-full"
        >
          <option value="draft">{t('content.status.draft')}</option>
          <option value="in_review">{t('content.status.inReview')}</option>
          <option value="approved">{t('content.status.approved')}</option>
          <option value="live">{t('content.status.live')}</option>
          <option value="paused">{t('content.status.paused')}</option>
          <option value="archived">{t('content.status.archived')}</option>
        </select>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? t('common.saving') : (pack ? t('common.update') : t('common.create'))}
        </button>
      </div>
    </form>
  );
}