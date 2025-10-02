import { useState } from 'react';
import { CheckIcon, XMarkIcon, ClockIcon, PencilIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '../../hooks/useContent';
import { RequestChangesModal } from './RequestChangesModal';
import { EditContentModal } from './EditContentModal';
import { useTranslation } from 'react-i18next';
import { FootballLogo } from '../ui/FootballLogo';

interface ContentReviewCardProps {
  item: ContentItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onGoLive: (id: string) => void;
  onPause: (id: string) => void;
}

const gameLabels: Record<string, string> = {
  who_among_us: 'Who Among Us?',
  agree_disagree: 'Agree/Disagree',
  guess_the_person: 'Guess the Person',
  football_trivia: 'Football Trivia',
  football_logos: 'Football Logos',
  football_players: 'Football Players',
  football_moments: 'Football Moments',
};

export function ContentReviewCard({
  item,
  onApprove,
  onReject,
  onRequestChanges,
  onGoLive,
  onPause,
}: ContentReviewCardProps) {
  const { t } = useTranslation();
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const getContentText = () => {
    if (item.game_key === 'who_among_us') {
      return item.payload?.question || 'No question';
    } else if (item.game_key === 'agree_disagree') {
      return item.payload?.statement || 'No statement';
    } else if (item.game_key === 'guess_the_person') {
      return item.payload?.persona?.name || item.payload?.person_name || 'No person';
    } else if (item.game_key === 'football_trivia') {
      return item.payload?.question || item.payload?.question_en || 'No question';
    } else if (item.game_key === 'football_logos') {
      return item.payload?.question || item.payload?.question_en || 'Which club is this?';
    } else if (item.game_key === 'football_players') {
      return `Guess the player: ${item.payload?.answer || item.payload?.answer_ar || 'Unknown'}`;
    } else if (item.game_key === 'football_moments') {
      return item.payload?.moment_description || item.payload?.description || item.payload?.question || 'No moment';
    }
    return 'Unknown content';
  };

  const getDepthLabel = (depth: string | null) => {
    if (!depth) return 'Unknown';
    const depthNum = parseInt(depth, 10);
    if (isNaN(depthNum)) return depth;
    const labels = ['L0 - Icebreaker', 'L1 - Light', 'L2 - Medium', 'L3 - Deep', 'L4 - Spicy'];
    return labels[depthNum] || `Level ${depthNum}`;
  };

  return (
    <div className="card p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-20 text-primary">
            {gameLabels[item.game_key] || item.game_key}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            ID: {item.id.slice(0, 8)}...
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {getContentText()}
        </h3>

        {item.game_key === 'football_logos' && (
          <div className="mb-3">
            <FootballLogo
              logoUrl={item.payload?.logo_url}
              teamName={item.payload?.answer_en || item.payload?.answer}
              className="h-32 w-32"
            />
          </div>
        )}
        
        {item.game_key === 'guess_the_person' && (item.payload?.persona?.clues || item.payload?.clues) && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clues:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {(item.payload?.persona?.clues || item.payload?.clues).map((clue: string, index: number) => (
                <li key={index}>{clue}</li>
              ))}
            </ul>
          </div>
        )}

        {item.game_key === 'football_trivia' && item.payload?.answer && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Answer:</span> {item.payload.answer}
            </p>
            {item.payload.category && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Category:</span> {item.payload.category}
              </p>
            )}
          </div>
        )}

        {item.game_key === 'football_players' && (item.payload?.hints_ar || item.payload?.hints) && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">التلميحات:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300" dir="rtl">
              {(item.payload.hints_ar || item.payload.hints)?.map((hint: string, index: number) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span className="font-medium">الإجابة:</span> {item.payload.answer_ar || item.payload.answer}
            </p>
          </div>
        )}

        {(item.game_key === 'football_logos' || item.game_key === 'football_moments') && item.payload && (
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {item.payload.answer && (
              <p><span className="font-medium">Answer:</span> {item.payload.answer}</p>
            )}
            {item.payload.category && (
              <p><span className="font-medium">Category:</span> {item.payload.category}</p>
            )}
            {item.payload.league && (
              <p><span className="font-medium">League:</span> {item.payload.league}</p>
            )}
            {item.payload.year && (
              <p><span className="font-medium">Year:</span> {item.payload.year}</p>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary bg-opacity-20 text-secondary-dark dark:text-secondary-light">
            {getDepthLabel(item.difficulty_or_depth)}
          </span>
          {item.tags?.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {tag}
            </span>
          ))}
        </div>
        
        {item.similarity_group && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Similarity Group: {item.similarity_group}
          </p>
        )}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex flex-col gap-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            {/* Draft & In Review: Go Live/Approve/Reject */}
            {(item.status === 'draft' || item.status === 'in_review') && (
              <>
                <button
                  onClick={() => onGoLive(item.id)}
                  className="btn btn-primary btn-sm flex-1 justify-center"
                  title={t('contentReview.goLiveDirectly') || 'Publish directly to live'}
                >
                  <PlayIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  <span className="hidden sm:inline">{t('contentReview.goLive')}</span>
                  <span className="sm:hidden">{t('contentReview.goLive')}</span>
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  className="btn btn-success btn-sm flex-1 justify-center"
                >
                  <CheckIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  <span className="hidden sm:inline">{t('contentReview.approve')}</span>
                  <span className="sm:hidden">{t('contentReview.approve')}</span>
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="btn btn-danger btn-sm flex-1 justify-center"
                >
                  <XMarkIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                  <span className="hidden sm:inline">{t('contentReview.reject')}</span>
                  <span className="sm:hidden">{t('contentReview.reject')}</span>
                </button>
              </>
            )}

            {/* Approved: Go Live */}
            {item.status === 'approved' && (
              <button
                onClick={() => onGoLive(item.id)}
                className="btn btn-primary btn-sm flex-1 justify-center"
              >
                <PlayIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.goLive')}</span>
                <span className="sm:hidden">{t('contentReview.goLive')}</span>
              </button>
            )}

            {/* Live: Pause */}
            {item.status === 'live' && (
              <button
                onClick={() => onPause(item.id)}
                className="btn btn-secondary btn-sm flex-1 justify-center"
              >
                <PauseIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.pause')}</span>
                <span className="sm:hidden">{t('contentReview.pause')}</span>
              </button>
            )}

            {/* Paused: Go Live again */}
            {item.status === 'paused' && (
              <button
                onClick={() => onGoLive(item.id)}
                className="btn btn-primary btn-sm flex-1 justify-center"
              >
                <PlayIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.goLive')}</span>
                <span className="sm:hidden">{t('contentReview.goLive')}</span>
              </button>
            )}

            {/* Archived: Restore (make draft) */}
            {item.status === 'archived' && (
              <button
                onClick={() => onRequestChanges(item.id, 'Restored from archive')}
                className="btn btn-outline btn-sm flex-1 justify-center"
              >
                <ClockIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.restore')}</span>
                <span className="sm:hidden">{t('contentReview.restore')}</span>
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            {/* Request Changes - available for draft, in_review, approved */}
            {(item.status === 'draft' || item.status === 'in_review' || item.status === 'approved') && (
              <button
                onClick={() => setIsRequestChangesModalOpen(true)}
                className="btn btn-secondary btn-sm flex-1 justify-center"
              >
                <ClockIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.requestChanges')}</span>
                <span className="sm:hidden">{t('contentReview.changes')}</span>
              </button>
            )}

            {/* Edit - available for all statuses except archived */}
            {item.status !== 'archived' && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-outline btn-sm flex-1 justify-center"
              >
                <PencilIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                <span className="hidden sm:inline">{t('contentReview.edit')}</span>
                <span className="sm:hidden">{t('contentReview.edit')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <RequestChangesModal
        isOpen={isRequestChangesModalOpen}
        onClose={() => setIsRequestChangesModalOpen(false)}
        onSubmit={(feedback) => onRequestChanges(item.id, feedback)}
        contentTitle={getContentText()}
      />

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
      />
    </div>
  );
}