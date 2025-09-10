import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@components/ui/Modal';
import { AdCreativeForm } from './AdCreativeForm';
import { useAdCreatives, useCreateAdCreative, useUpdateAdCreative, useDeleteAdCreative, type AdCreative } from '@hooks/useAdCreatives';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useConfirm } from '@hooks/useConfirm';
import { useBulkSelection } from '@hooks/useBulkSelection';
import { BulkActions } from '@components/ui/BulkActions';
import { toast } from 'react-hot-toast';
import type { Campaign } from '@hooks/useCampaigns';

interface AdCreativeManagerProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

export function AdCreativeManager({ campaign, isOpen, onClose }: AdCreativeManagerProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingCreative, setEditingCreative] = useState<AdCreative | null>(null);
  
  const { data: creatives, isLoading } = useAdCreatives(campaign.id);
  const createMutation = useCreateAdCreative();
  const updateMutation = useUpdateAdCreative();
  const deleteMutation = useDeleteAdCreative();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    clearSelection,
    selectedCount,
  } = useBulkSelection(creatives || []);

  const handleDelete = async (creative: AdCreative) => {
    const confirmed = await confirm({
      title: t('adCreative.deleteConfirm.title'),
      message: t('adCreative.deleteConfirm.message'),
      confirmText: t('adCreative.deleteConfirm.confirmText'),
      type: 'danger',
    });
    
    if (confirmed) {
      deleteMutation.mutate({ id: creative.id, campaignId: campaign.id });
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'ar': return t('adCreative.languages.arabic');
      case 'en': return t('adCreative.languages.english');
      default: return lang;
    }
  };

  const getTextPreview = (textLines: AdCreative['text_lines'], lang: string) => {
    const lines = textLines[lang] || textLines[Object.keys(textLines)[0]];
    if (!lines || lines.length === 0) return t('adCreative.noText');
    return lines.join(' | ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adCreative.title', { campaign: campaign.name })}
      size="xl"
    >
      {showForm ? (
        <AdCreativeForm
          initialValues={editingCreative}
          campaignId={campaign.id}
          onSubmit={async (values) => {
            try {
              if (editingCreative) {
                await updateMutation.mutateAsync({ 
                  ...values, 
                  id: editingCreative.id,
                  campaign_id: campaign.id 
                });
              } else {
                await createMutation.mutateAsync(values);
              }
              setShowForm(false);
              setEditingCreative(null);
            } catch (error) {
              // Error is already handled by the mutation hook
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingCreative(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('adCreative.subtitle')}
            </p>
            <button
              onClick={() => {
                setEditingCreative(null);
                setShowForm(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('adCreative.create')}
            </button>
          </div>

          {/* Creatives List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            </div>
          ) : creatives && creatives.length > 0 ? (
            <div className="space-y-3">
              {creatives.map((creative) => (
                <div
                  key={creative.id}
                  className={`card p-4 transition-colors ${
                    isSelected(creative.id) ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected(creative.id)}
                      onChange={() => toggleSelection(creative.id)}
                      className="mt-1 rounded border-gray-400 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          creative.active 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {creative.active ? t('common.active') : t('common.inactive')}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          <GlobeAltIcon className="h-3 w-3 mr-1" />
                          {getLanguageLabel(creative.lang)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {Object.entries(creative.text_lines).map(([lang, lines]) => (
                          lines.length > 0 && (
                            <div key={lang} className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {lang.toUpperCase()}:
                              </span>{' '}
                              <span className="text-gray-600 dark:text-gray-400" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                {getTextPreview(creative.text_lines, lang)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                      
                      {creative.link && (
                        <div className="mt-2">
                          <a
                            href={creative.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-primary-dark underline"
                          >
                            {creative.link}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCreative(creative);
                          setShowForm(true);
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(creative)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('adCreative.noCreatives')}
            </div>
          )}

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedCount}
            actions={[
              {
                label: t('bulk.actions.activate'),
                icon: CheckCircleIcon,
                action: async () => {
                  for (const creative of selectedItems) {
                    await updateMutation.mutateAsync({ 
                      ...creative, 
                      active: true,
                      campaign_id: campaign.id 
                    });
                  }
                  clearSelection();
                  toast.success(t('adCreative.toast.activated', { count: selectedCount }));
                },
              },
              {
                label: t('bulk.actions.deactivate'),
                icon: XCircleIcon,
                action: async () => {
                  for (const creative of selectedItems) {
                    await updateMutation.mutateAsync({ 
                      ...creative, 
                      active: false,
                      campaign_id: campaign.id 
                    });
                  }
                  clearSelection();
                  toast.success(t('adCreative.toast.deactivated', { count: selectedCount }));
                },
              },
              {
                label: t('bulk.actions.delete'),
                icon: TrashIcon,
                variant: 'danger',
                action: async () => {
                  const confirmed = await confirm({
                    title: t('adCreative.bulkActions.delete.title'),
                    message: t('adCreative.bulkActions.delete.message', { count: selectedCount }),
                    confirmText: t('adCreative.bulkActions.delete.confirmText'),
                    type: 'danger',
                  });
                  if (confirmed) {
                    for (const creative of selectedItems) {
                      await deleteMutation.mutateAsync({ 
                        id: creative.id, 
                        campaignId: campaign.id 
                      });
                    }
                    clearSelection();
                    toast.success(t('adCreative.toast.bulkDeleted', { count: selectedCount }));
                  }
                },
              },
            ]}
            onClear={clearSelection}
          />
        </div>
      )}
      
      <ConfirmDialogComponent />
    </Modal>
  );
}