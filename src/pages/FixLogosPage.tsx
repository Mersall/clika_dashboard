import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WrenchIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { fixBrokenFootballLogos } from '../utils/fixBrokenLogos';

export function FixLogosPage() {
  const navigate = useNavigate();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    fixed: number;
    errors: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixLogos = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const fixResult = await fixBrokenFootballLogos();
      if (fixResult) {
        setResult(fixResult);
        // Force refresh after 2 seconds to clear cached images
        setTimeout(() => {
          window.location.href = '/content/review';
        }, 2000);
      } else {
        setError('No logos found to fix');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <div className="text-center mb-8">
            <WrenchIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Fix Broken Football Logos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This utility will fix all paused football logos with broken Wikipedia URLs
            </p>
          </div>

          {!result && !error && (
            <div className="text-center">
              <button
                onClick={handleFixLogos}
                disabled={isFixing}
                className="btn btn-primary btn-lg"
              >
                {isFixing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Fixing Logos...
                  </>
                ) : (
                  <>
                    <WrenchIcon className="h-5 w-5 mr-2" />
                    Fix Broken Logos
                  </>
                )}
              </button>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                This will update all football logos with broken URLs (keeping their current status)
              </p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                ✅ Now using Google Sports CDN (publicly accessible, CORS-enabled)
              </p>
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                ℹ️ Paused items will remain paused but with working logos
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Fix Complete!
                </h3>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>• Total logos processed: {result.total}</li>
                  <li>• Successfully fixed: {result.fixed}</li>
                  {result.errors > 0 && (
                    <li className="text-orange-600 dark:text-orange-400">
                      • Errors encountered: {result.errors}
                    </li>
                  )}
                </ul>
              </div>
              <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                Redirecting to review page in 2 seconds...
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/content')}
                  className="btn btn-primary"
                >
                  Go to Content Page
                </button>
                <button
                  onClick={() => navigate('/content-review')}
                  className="btn btn-secondary"
                >
                  Go to Review Page
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <XCircleIcon className="h-12 w-12 text-red-500" />
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => {
                    setError(null);
                    setResult(null);
                  }}
                  className="btn btn-secondary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}