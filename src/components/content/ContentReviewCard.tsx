import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '../../hooks/useContent';

interface ContentReviewCardProps {
  item: ContentItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
}

const gameLabels: Record<string, string> = {
  who_among_us: 'Who Among Us?',
  agree_disagree: 'Agree/Disagree',
  guess_the_person: 'Guess the Person',
};

export function ContentReviewCard({
  item,
  onApprove,
  onReject,
  onRequestChanges,
}: ContentReviewCardProps) {
  const getContentText = () => {
    if (item.game_key === 'who_among_us') {
      return item.payload?.question || 'No question';
    } else if (item.game_key === 'agree_disagree') {
      return item.payload?.statement || 'No statement';
    } else if (item.game_key === 'guess_the_person') {
      return item.payload?.persona?.name || item.payload?.person_name || 'No person';
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
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onApprove(item.id)}
            className="btn btn-success btn-sm flex-1 justify-center"
          >
            <CheckIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            <span className="hidden sm:inline">Approve</span>
            <span className="sm:hidden">OK</span>
          </button>
          <button
            onClick={() => {
              const feedback = prompt('Provide feedback for changes:');
              if (feedback) {
                onRequestChanges(item.id, feedback);
              }
            }}
            className="btn btn-secondary btn-sm flex-1 justify-center"
          >
            <ClockIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            <span className="hidden sm:inline">Request Changes</span>
            <span className="sm:hidden">Changes</span>
          </button>
          <button
            onClick={() => onReject(item.id)}
            className="btn btn-danger btn-sm flex-1 justify-center"
          >
            <XMarkIcon className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            <span className="hidden sm:inline">Reject</span>
            <span className="sm:hidden">No</span>
          </button>
        </div>
      </div>
    </div>
  );
}