import { useState } from 'react';
import { useContent, useUpdateContent } from '../hooks/useContent';
import { ContentReviewCard } from '../components/content/ContentReviewCard';
import { toast } from 'react-hot-toast';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ContentReviewPage() {
  const { t } = useTranslation();
  const { isReviewer, loading: roleLoading } = useUserRole();

  const statusTabs = [
    { value: 'draft', label: t('content.status.draft'), color: 'bg-gray-500' },
    { value: 'in_review', label: t('content.status.inReview'), color: 'bg-amber-500' },
    { value: 'approved', label: t('content.status.approved'), color: 'bg-green-600' },
    { value: 'live', label: t('content.status.live'), color: 'bg-blue-600' },
    { value: 'paused', label: t('content.status.paused'), color: 'bg-yellow-600' },
    { value: 'archived', label: t('content.status.archived'), color: 'bg-red-600' },
  ];

  const gameOptions = [
    { value: 'all', label: t('content.allGames') },
    { value: 'who_among_us', label: t('content.games.who_among_us') },
    { value: 'agree_disagree', label: t('content.games.agree_disagree') },
    { value: 'guess_the_person', label: t('content.games.guess_the_person') },
    { value: 'football_trivia', label: t('content.games.football_trivia') },
    { value: 'football_logos', label: t('content.games.football_logos') },
    { value: 'football_players', label: t('content.games.football_players') },
    { value: 'football_moments', label: t('content.games.football_moments') },
  ];

  const [selectedStatus, setSelectedStatus] = useState('draft');
  const [selectedGame, setSelectedGame] = useState('all');
  const { data: items, isLoading } = useContent(selectedGame);
  const updateMutation = useUpdateContent();

  // Wait for role to load
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Check if user has reviewer or admin role
  if (!isReviewer) {
    return <Navigate to="/" replace />;
  }

  const filteredItems = items?.filter(item => item.status === selectedStatus) || [];

  const handleApprove = async (id: string) => {
    const item = items?.find(i => i.id === id);
    if (!item) return;

    await updateMutation.mutateAsync({
      ...item,
      status: 'approved',
      active: true,
    });
    toast.success(t('contentReview.toast.approved'));
  };

  const handleReject = async (id: string) => {
    const item = items?.find(i => i.id === id);
    if (!item) return;

    try {
      await updateMutation.mutateAsync({
        ...item,
        status: 'archived',
        active: false,
      });
      toast.success(t('contentReview.toast.rejected'));
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content');
    }
  };

  const handleRequestChanges = async (id: string, feedback: string) => {
    const item = items?.find(i => i.id === id);
    if (!item) return;

    try {
      // In a real app, we'd store the feedback somewhere
      console.log('Feedback for item', id, ':', feedback);
      await updateMutation.mutateAsync({
        ...item,
        status: 'draft',
        active: false,
      });
      toast.success(t('contentReview.toast.changesRequested'));
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
    }
  };

  const handleGoLive = async (id: string) => {
    const item = items?.find(i => i.id === id);
    if (!item) return;

    try {
      await updateMutation.mutateAsync({
        ...item,
        status: 'live',
        active: true,
      });
      toast.success(t('contentReview.toast.goLive'));
    } catch (error) {
      console.error('Error making content live:', error);
      toast.error('Failed to make content live');
    }
  };

  const handlePause = async (id: string) => {
    const item = items?.find(i => i.id === id);
    if (!item) return;

    try {
      await updateMutation.mutateAsync({
        ...item,
        status: 'paused',
        active: false,
      });
      toast.success(t('contentReview.toast.paused'));
    } catch (error) {
      console.error('Error pausing content:', error);
      toast.error('Failed to pause content');
    }
  };

  const getStatusCount = (status: string) => {
    return items?.filter(item => item.status === status).length || 0;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('contentReview.title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">{t('contentReview.subtitle')}</p>
      </div>

      {/* Game Filter */}
      <div className="mb-4">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="input select w-full sm:w-64"
        >
          {gameOptions.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-800 min-w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedStatus === tab.value
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${tab.color} text-white`}>
                {getStatusCount(tab.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          <span className="ml-2">{t('common.loading')}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t('contentReview.noContent')}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ContentReviewCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onGoLive={handleGoLive}
              onPause={handlePause}
            />
          ))}
        </div>
      )}

      {/* Review Guidelines */}
      <div className="mt-12 card p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('contentReview.reviewGuidelines')}</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>SPICE Rubric:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>S</strong>elf-disclosure: Does it encourage personal sharing?</li>
            <li><strong>P</strong>ositivity: Is it fun and engaging?</li>
            <li><strong>I</strong>nclusivity: Can everyone participate?</li>
            <li><strong>C</strong>larity: Is it easy to understand?</li>
            <li><strong>E</strong>dge: Does it push boundaries appropriately?</li>
          </ul>
          <p className="mt-4">
            <strong>Two-eyes rule:</strong> Content marked as L3 (Deep) or L4 (Spicy) requires review by two different reviewers.
          </p>
        </div>
      </div>
    </div>
  );
}