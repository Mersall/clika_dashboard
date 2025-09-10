import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useFeatureFlags, 
  useCreateFeatureFlag, 
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
  type FeatureFlag,
  type AudienceCriteria 
} from '@hooks/useFeatureFlags';
import { 
  BeakerIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LanguageIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

export function FeatureFlagsPage() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  
  const { data: flags, isLoading } = useFeatureFlags();
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingFlag(null);
    setShowModal(true);
  };

  const handleDelete = (key: string) => {
    setDeletingKey(key);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingKey) {
      deleteMutation.mutate(deletingKey, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setDeletingKey(null);
        }
      });
    }
  };

  const getAudienceDisplay = (audienceStr?: string) => {
    if (!audienceStr) return t('featureFlags.allUsers');
    
    try {
      const audience: AudienceCriteria = JSON.parse(audienceStr);
      const parts = [];
      
      if (audience.countries?.length) {
        parts.push(`${t('featureFlags.countries')}: ${audience.countries.join(', ')}`);
      }
      if (audience.minSessions) {
        parts.push(`${t('featureFlags.minSessions')}: ${audience.minSessions}`);
      }
      if (audience.roles?.length) {
        parts.push(`${t('featureFlags.roles')}: ${audience.roles.join(', ')}`);
      }
      if (audience.languages?.length) {
        parts.push(`${t('featureFlags.languages')}: ${audience.languages.join(', ')}`);
      }
      if (audience.hasConsent?.geo) {
        parts.push(t('featureFlags.geoConsent'));
      }
      if (audience.hasConsent?.ads) {
        parts.push(t('featureFlags.adsConsent'));
      }
      
      return parts.length > 0 ? parts.join(' • ') : t('featureFlags.allUsers');
    } catch {
      return t('featureFlags.invalidAudience');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('featureFlags.title')}
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('featureFlags.subtitle')}
          </p>
        </div>
        
        <button onClick={handleCreate} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
          {t('featureFlags.create')}
        </button>
      </div>

      {/* Feature Flags List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t('featureFlags.tableHeaders.key')}</th>
                <th>{t('featureFlags.tableHeaders.status')}</th>
                <th>{t('featureFlags.tableHeaders.rollout')}</th>
                <th>{t('featureFlags.tableHeaders.audience')}</th>
                <th>{t('featureFlags.tableHeaders.updated')}</th>
                <th>{t('featureFlags.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="inline-flex items-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="ml-2">{t('common.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : flags && flags.length > 0 ? (
                flags.map((flag) => (
                  <tr key={flag.key}>
                    <td>
                      <div className="flex items-center gap-2">
                        <BeakerIcon className="h-5 w-5 text-primary" />
                        <span className="font-mono text-sm">{flag.key}</span>
                      </div>
                    </td>
                    <td>
                      {flag.on_off_percent > 0 ? (
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {t('featureFlags.enabled')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          {t('featureFlags.disabled')}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${flag.on_off_percent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{flag.on_off_percent}%</span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                      {getAudienceDisplay(flag.audience)}
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(flag.updated_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(flag)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(flag.key)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('featureFlags.noFlags')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Flag Form Modal */}
      {showModal && (
        <FeatureFlagForm
          flag={editingFlag}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            if (editingFlag) {
              updateMutation.mutate(data, {
                onSuccess: () => setShowModal(false)
              });
            } else {
              createMutation.mutate(data, {
                onSuccess: () => setShowModal(false)
              });
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title={t('featureFlags.deleteConfirm.title')}
        message={t('featureFlags.deleteConfirm.message', { key: deletingKey })}
        confirmText={t('featureFlags.deleteConfirm.confirmText')}
        type="danger"
      />
    </div>
  );
}

// Feature Flag Form Component
function FeatureFlagForm({ 
  flag, 
  onClose, 
  onSubmit 
}: { 
  flag: FeatureFlag | null;
  onClose: () => void;
  onSubmit: (data: { key: string; on_off_percent: number; audience?: AudienceCriteria }) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    key: flag?.key || '',
    on_off_percent: flag?.on_off_percent || 0,
    audience: flag?.audience ? JSON.parse(flag.audience) : {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAudience = Object.keys(formData.audience).some(
      key => formData.audience[key as keyof AudienceCriteria] !== undefined && 
             (Array.isArray(formData.audience[key as keyof AudienceCriteria]) 
               ? (formData.audience[key as keyof AudienceCriteria] as any[]).length > 0
               : formData.audience[key as keyof AudienceCriteria])
    );
    
    onSubmit({
      key: formData.key,
      on_off_percent: formData.on_off_percent,
      audience: hasAudience ? formData.audience : undefined
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={flag ? t('featureFlags.form.editTitle') : t('featureFlags.form.createTitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('featureFlags.form.key')}
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="input w-full font-mono"
            placeholder="new_feature_enabled"
            disabled={!!flag}
            required
          />
        </div>

        {/* Rollout Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('featureFlags.form.rollout')}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.on_off_percent}
              onChange={(e) => setFormData({ ...formData, on_off_percent: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>0%</span>
              <span className="font-medium text-lg text-primary">{formData.on_off_percent}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Audience Builder */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            {t('featureFlags.form.audienceBuilder')}
          </h3>

          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {/* Countries */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <GlobeAltIcon className="h-4 w-4" />
                {t('featureFlags.form.countries')}
              </label>
              <input
                type="text"
                value={formData.audience.countries?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  audience: {
                    ...formData.audience,
                    countries: e.target.value ? e.target.value.split(',').map(c => c.trim()).filter(Boolean) : undefined
                  }
                })}
                className="input w-full text-sm"
                placeholder="US, GB, SA"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LanguageIcon className="h-4 w-4" />
                {t('featureFlags.form.languages')}
              </label>
              <input
                type="text"
                value={formData.audience.languages?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  audience: {
                    ...formData.audience,
                    languages: e.target.value ? e.target.value.split(',').map(l => l.trim()).filter(Boolean) : undefined
                  }
                })}
                className="input w-full text-sm"
                placeholder="en, ar"
              />
            </div>

            {/* Roles */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ShieldCheckIcon className="h-4 w-4" />
                {t('featureFlags.form.roles')}
              </label>
              <input
                type="text"
                value={formData.audience.roles?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  audience: {
                    ...formData.audience,
                    roles: e.target.value ? e.target.value.split(',').map(r => r.trim()).filter(Boolean) : undefined
                  }
                })}
                className="input w-full text-sm"
                placeholder="admin, reviewer, editor"
              />
            </div>

            {/* Min Sessions */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BeakerIcon className="h-4 w-4" />
                {t('featureFlags.form.minSessions')}
              </label>
              <input
                type="number"
                value={formData.audience.minSessions || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  audience: {
                    ...formData.audience,
                    minSessions: e.target.value ? Number(e.target.value) : undefined
                  }
                })}
                className="input w-full text-sm"
                placeholder="5"
                min="0"
              />
            </div>

            {/* Consent Checkboxes */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('featureFlags.form.requiredConsents')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.audience.hasConsent?.geo || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      audience: {
                        ...formData.audience,
                        hasConsent: {
                          ...formData.audience.hasConsent,
                          geo: e.target.checked ? true : undefined
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">{t('featureFlags.form.geoConsent')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.audience.hasConsent?.ads || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      audience: {
                        ...formData.audience,
                        hasConsent: {
                          ...formData.audience.hasConsent,
                          ads: e.target.checked ? true : undefined
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">{t('featureFlags.form.adsConsent')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary">
            {flag ? t('common.update') : t('common.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}