import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  contentTitle: string;
}

export function RequestChangesModal({
  isOpen,
  onClose,
  onSubmit,
  contentTitle,
}: RequestChangesModalProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback('');
      onClose();
    }
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Changes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Requesting changes for: <strong>{contentTitle}</strong>
          </p>

          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feedback for Content Creator
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide specific feedback on what needs to be changed..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-gray-100"
            rows={4}
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-secondary btn-sm"
            disabled={!feedback.trim()}
          >
            Request Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}