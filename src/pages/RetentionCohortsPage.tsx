import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRetentionCohorts, useRetentionStats } from '@hooks/useRetention';
import { format } from 'date-fns';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';

export function RetentionCohortsPage() {
  const { t } = useTranslation();
  const [cohortSize, setCohortSize] = useState<'week' | 'month'>('week');
  
  const { data: cohorts, isLoading } = useRetentionCohorts(cohortSize);
  const { data: stats } = useRetentionStats(cohortSize);

  // Color scale for retention percentages
  const getRetentionColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-600 text-white';
    if (percentage >= 50) return 'bg-green-500 text-white';
    if (percentage >= 30) return 'bg-yellow-500 text-white';
    if (percentage >= 20) return 'bg-orange-500 text-white';
    if (percentage >= 10) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
  };

  const getRetentionColorLight = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 50) return 'bg-green-50 dark:bg-green-900/20';
    if (percentage >= 30) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (percentage >= 20) return 'bg-orange-50 dark:bg-orange-900/20';
    if (percentage >= 10) return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('retention.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('retention.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">{t('retention.cohortSize')}:</label>
          <select
            value={cohortSize}
            onChange={(e) => setCohortSize(e.target.value as 'week' | 'month')}
            className="input select w-32"
          >
            <option value="week">{t('retention.weekly')}</option>
            <option value="month">{t('retention.monthly')}</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('retention.stats.avgDay1')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.avgDay1Retention || 0}%
              </p>
            </div>
            <ArrowTrendingDownIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('retention.stats.avgDay7')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.avgDay7Retention || 0}%
              </p>
            </div>
            <ArrowTrendingDownIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('retention.stats.avgDay30')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.avgDay30Retention || 0}%
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('retention.stats.totalUsers')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalUsers?.toLocaleString() || 0}
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Best Performing Cohort */}
      {stats?.bestCohort && (
        <div className="mb-8 card p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('retention.bestCohort')}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('retention.bestCohortDesc', {
              date: format(new Date(stats.bestCohort.cohort_date), 'MMM dd, yyyy'),
              retention: stats.bestCohort.day_7
            })}
          </p>
        </div>
      )}

      {/* Retention Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('retention.cohortAnalysis')}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white dark:bg-gray-900">
                  {t('retention.tableHeaders.cohort')}
                </th>
                <th>{t('retention.tableHeaders.users')}</th>
                <th className="text-center">{t('retention.tableHeaders.day0')}</th>
                <th className="text-center">{t('retention.tableHeaders.day1')}</th>
                <th className="text-center">{t('retention.tableHeaders.day7')}</th>
                <th className="text-center">{t('retention.tableHeaders.day14')}</th>
                <th className="text-center">{t('retention.tableHeaders.day30')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="inline-flex items-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="ml-2">{t('common.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : cohorts && cohorts.length > 0 ? (
                cohorts.map((cohort, index) => (
                  <tr key={cohort.cohort_date} className={index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}>
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 font-medium">
                      {format(new Date(cohort.cohort_date), cohortSize === 'week' ? 'MMM dd' : 'MMM yyyy')}
                    </td>
                    <td className="text-center">{cohort.users_count}</td>
                    <td className="text-center p-2">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium min-w-[60px] ${getRetentionColor(cohort.day_0)}`}>
                        {cohort.day_0}%
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium min-w-[60px] ${getRetentionColor(cohort.day_1)}`}>
                        {cohort.day_1}%
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium min-w-[60px] ${getRetentionColor(cohort.day_7)}`}>
                        {cohort.day_7}%
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium min-w-[60px] ${getRetentionColor(cohort.day_14)}`}>
                        {cohort.day_14}%
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium min-w-[60px] ${getRetentionColor(cohort.day_30)}`}>
                        {cohort.day_30}%
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('retention.noCohorts')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('retention.legend')}</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">≥70%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">≥50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">≥30%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">≥20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">≥10%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">&lt;10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}