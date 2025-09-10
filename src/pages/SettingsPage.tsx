import { useState } from 'react';
import { 
  useGameConfigs, 
  useUpdateGameConfig, 
  useFeatureFlags, 
  useUpdateFeatureFlag,
  type GameConfig,
  type FeatureFlag
} from '../hooks/useSettings';
import { Switch } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('game');
  
  const tabs = [
    { id: 'game', label: t('settings.tabs.game') },
    { id: 'features', label: t('settings.tabs.features') },
    { id: 'system', label: t('settings.tabs.system') },
  ];
  
  // Game configs
  const { data: gameConfigs, isLoading: loadingConfigs } = useGameConfigs();
  const updateGameConfig = useUpdateGameConfig();
  
  // Feature flags
  const { data: featureFlags, isLoading: loadingFlags } = useFeatureFlags();
  const updateFeatureFlag = useUpdateFeatureFlag();

  const handleGameConfigUpdate = (config: GameConfig, field: keyof GameConfig, value: any) => {
    updateGameConfig.mutate({
      ...config,
      [field]: value,
    });
  };

  const handleFeatureFlagUpdate = (flag: FeatureFlag, field: keyof FeatureFlag, value: any) => {
    updateFeatureFlag.mutate({
      ...flag,
      [field]: value,
    });
  };

  const getGameLabel = (gameKey: string) => {
    const labels: Record<string, string> = {
      who_among_us: t('settings.games.who_among_us'),
      agree_disagree: t('settings.games.agree_disagree'),
      guess_the_person: t('settings.games.guess_the_person'),
    };
    return labels[gameKey] || gameKey;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('settings.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-3 sm:py-4 px-1 text-xs sm:text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Game Configuration Tab */}
      {activeTab === 'game' && (
        <div className="space-y-6">
          {loadingConfigs ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              <span className="ml-2">{t('settings.loading')}</span>
            </div>
          ) : (
            gameConfigs?.map((config) => (
              <div key={config.game_key} className="card p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getGameLabel(config.game_key)}
                  </h3>
                  <Switch
                    checked={config.enabled}
                    onChange={(value) => handleGameConfigUpdate(config, 'enabled', value)}
                    className={`${
                      config.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                  >
                    <span className="sr-only">{t('settings.gameConfig.enableGame')}</span>
                    <span
                      className={`${
                        config.enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('settings.gameConfig.explorationPercent')}
                      <div className="group relative">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-normal w-48 sm:whitespace-nowrap sm:w-auto rounded bg-gray-700 dark:bg-gray-800 px-3 py-2 text-xs text-white dark:text-gray-300 shadow-lg group-hover:block z-10">
                          {t('settings.gameConfig.explorationTooltip')}
                        </div>
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={config.exploration_pct * 100}
                        onChange={(e) => handleGameConfigUpdate(config, 'exploration_pct', Number(e.target.value) / 100)}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(config.exploration_pct * 100)}%
                      </span>
                    </div>
                  </div>

                  {config.max_l4 !== null && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.gameConfig.maxL4')}
                        <div className="group relative">
                          <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-normal w-48 sm:whitespace-nowrap sm:w-auto rounded bg-gray-700 dark:bg-gray-800 px-3 py-2 text-xs text-white dark:text-gray-300 shadow-lg group-hover:block z-10">
                            {t('settings.gameConfig.maxL4Tooltip')}
                          </div>
                        </div>
                      </label>
                      <input
                        type="number"
                        value={config.max_l4}
                        onChange={(e) => handleGameConfigUpdate(config, 'max_l4', Number(e.target.value))}
                        className="input w-full"
                        min="0"
                        max="10"
                      />
                    </div>
                  )}

                  {config.cooldown_hours !== null && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.gameConfig.cooldownHours')}
                        <div className="group relative">
                          <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-normal w-48 sm:whitespace-nowrap sm:w-auto rounded bg-gray-700 dark:bg-gray-800 px-3 py-2 text-xs text-white dark:text-gray-300 shadow-lg group-hover:block z-10">
                            {t('settings.gameConfig.cooldownTooltip')}
                          </div>
                        </div>
                      </label>
                      <input
                        type="number"
                        value={config.cooldown_hours}
                        onChange={(e) => handleGameConfigUpdate(config, 'cooldown_hours', Number(e.target.value))}
                        className="input w-full"
                        min="0"
                        max="168"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          {loadingFlags ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              <span className="ml-2">{t('settings.loading')}</span>
            </div>
          ) : (
            featureFlags?.map((flag) => (
              <div key={flag.key} className="card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{flag.key}</h4>
                    {flag.audience && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all sm:break-normal">
                        {t('settings.featureFlags.audience')}: {typeof flag.audience === 'object' ? JSON.stringify(flag.audience) : flag.audience}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={flag.on_off_percent}
                        onChange={(e) => handleFeatureFlagUpdate(flag, 'on_off_percent', Number(e.target.value))}
                        className="w-24 sm:w-32"
                      />
                      <span className="w-12 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.featureFlags.percentage', { percent: flag.on_off_percent })}
                      </span>
                    </div>
                    
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="card p-4 sm:p-6">
          <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('settings.system.title')}</h3>
          <div className="space-y-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.system.sessionTimeout')}
              </label>
              <input
                type="number"
                defaultValue={30}
                className="input w-full"
                min="5"
                max="120"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.system.maxConcurrentSessions')}
              </label>
              <input
                type="number"
                defaultValue={8}
                className="input w-full"
                min="2"
                max="20"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.system.dataRetentionDays')}
              </label>
              <input
                type="number"
                defaultValue={90}
                className="input w-full"
                min="30"
                max="365"
              />
            </div>
            
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                {t('settings.system.enableAnalytics')}
              </label>
            </div>
            
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                {t('common.error')} {t('common.export')}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}