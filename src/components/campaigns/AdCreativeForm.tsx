import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { AdCreative } from '@hooks/useAdCreatives';

interface AdCreativeFormProps {
  initialValues?: AdCreative | null;
  campaignId: string;
  onSubmit: (values: Omit<AdCreative, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export function AdCreativeForm({ initialValues, campaignId, onSubmit, onCancel }: AdCreativeFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    campaign_id: campaignId,
    text_lines: {
      ar: ['', '', ''],
      en: ['', '', '']
    },
    link: '',
    lang: 'ar',
    active: true
  });

  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (initialValues) {
      setFormData({
        campaign_id: initialValues.campaign_id,
        text_lines: initialValues.text_lines || { ar: ['', '', ''], en: ['', '', ''] },
        link: initialValues.link || '',
        lang: initialValues.lang || 'ar',
        active: initialValues.active !== false
      });
    }
  }, [initialValues]);

  const handleTextLineChange = (lang: 'ar' | 'en', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      text_lines: {
        ...prev.text_lines,
        [lang]: prev.text_lines[lang].map((line, i) => i === index ? value : line)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty text lines
    const filteredTextLines = {
      ar: formData.text_lines.ar.filter(line => line.trim() !== ''),
      en: formData.text_lines.en.filter(line => line.trim() !== '')
    };

    // Check if at least one language has text
    if (filteredTextLines[formData.lang as 'ar' | 'en'].length === 0) {
      toast.error(t('adCreative.errors.noText'));
      return;
    }

    onSubmit({
      ...formData,
      text_lines: filteredTextLines,
      link: formData.link.trim() || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('ar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ar'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('adCreative.form.arabicText')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'en'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('adCreative.form.englishText')}
          </button>
        </nav>
      </div>

      {/* Text Lines */}
      <div className="space-y-4">
        {[0, 1, 2].map((index) => (
          <div key={index}>
            <label className="label">
              {t('adCreative.form.textLine', { number: index + 1 })}
            </label>
            <input
              type="text"
              value={formData.text_lines[activeTab][index] || ''}
              onChange={(e) => handleTextLineChange(activeTab, index, e.target.value)}
              className="input"
              placeholder={t('adCreative.form.textLinePlaceholder', { number: index + 1 })}
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
              maxLength={100}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.text_lines[activeTab][index]?.length || 0}/100
            </p>
          </div>
        ))}
      </div>

      {/* Primary Language */}
      <div>
        <label className="label">{t('adCreative.form.primaryLanguage')}</label>
        <select
          value={formData.lang}
          onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
          className="input select"
          required
        >
          <option value="ar">{t('adCreative.languages.arabic')}</option>
          <option value="en">{t('adCreative.languages.english')}</option>
        </select>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('adCreative.form.primaryLanguageHelp')}
        </p>
      </div>

      {/* Link */}
      <div>
        <label className="label">{t('adCreative.form.link')}</label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="input"
          placeholder={t('adCreative.form.linkPlaceholder')}
        />
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="h-4 w-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
          {t('adCreative.form.active')}
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {initialValues ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
}