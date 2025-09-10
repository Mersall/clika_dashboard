import { useState } from 'react';
import { Campaign } from '../../hooks/useCampaigns';
import { format } from 'date-fns';
import { CampaignTargeting } from './CampaignTargeting';

interface CampaignFormProps {
  initialValues?: Campaign | null;
  onSubmit: (values: Partial<Campaign>) => void | Promise<void>;
  onCancel: () => void;
}

export function CampaignForm({ initialValues, onSubmit, onCancel }: CampaignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    status: initialValues?.status || 'draft',
    start_at: initialValues?.start_at 
      ? format(new Date(initialValues.start_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_at: initialValues?.end_at 
      ? format(new Date(initialValues.end_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    daily_cap: initialValues?.daily_cap?.toString() || '',
    sov_pct: initialValues?.sov_pct?.toString() || '',
    priority: initialValues?.priority?.toString() || '5',
    geo_scope: initialValues?.geo_scope || 'global',
    lang: initialValues?.lang || '',
    geo_targets: initialValues?.geo_targets || {},
    daypart: initialValues?.daypart || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const hasGeoTargets = formData.geo_targets?.countries?.length > 0 || formData.geo_targets?.cities?.length > 0;
      const hasDaypart = formData.daypart?.days?.length > 0 || formData.daypart?.hours?.length > 0;
      
      await onSubmit({
        ...(initialValues?.id && { id: initialValues.id }),
        name: formData.name,
        status: formData.status,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        daily_cap: formData.daily_cap ? parseInt(formData.daily_cap) : null,
        sov_pct: formData.sov_pct ? parseFloat(formData.sov_pct) : null,
        priority: formData.priority ? parseInt(formData.priority) : null,
        geo_scope: formData.geo_scope,
        geo_targets: hasGeoTargets ? formData.geo_targets : null,
        lang: formData.lang || null,
        daypart: hasDaypart ? formData.daypart : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input w-full"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date *
          </label>
          <input
            type="datetime-local"
            value={formData.start_at}
            onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date *
          </label>
          <input
            type="datetime-local"
            value={formData.end_at}
            onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
            className="input w-full"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily Cap
          </label>
          <input
            type="number"
            value={formData.daily_cap}
            onChange={(e) => setFormData({ ...formData, daily_cap: e.target.value })}
            className="input w-full"
            placeholder="e.g., 1000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            SOV %
          </label>
          <input
            type="number"
            value={formData.sov_pct}
            onChange={(e) => setFormData({ ...formData, sov_pct: e.target.value })}
            className="input w-full"
            placeholder="e.g., 25"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority (1-10)
          </label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="input w-full"
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Geo Scope
          </label>
          <select
            value={formData.geo_scope}
            onChange={(e) => setFormData({ ...formData, geo_scope: e.target.value })}
            className="input w-full"
          >
            <option value="global">Global</option>
            <option value="country">Country</option>
            <option value="city">City</option>
            <option value="region">Region</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <input
            type="text"
            value={formData.lang}
            onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
            className="input w-full"
            placeholder="e.g., en, ar, es"
          />
        </div>
      </div>

      {/* Campaign Targeting */}
      <div className="border border-gray-300 dark:border-gray-800 rounded-lg p-4">
        <CampaignTargeting
          geoTargets={formData.geo_targets}
          daypart={formData.daypart}
          onChange={({ geoTargets, daypart }) => 
            setFormData({ ...formData, geo_targets: geoTargets, daypart })
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-700">
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
          {isSubmitting ? 'Saving...' : `${initialValues ? 'Update' : 'Create'} Campaign`}
        </button>
      </div>
    </form>
  );
}