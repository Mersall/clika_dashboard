import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'reviewer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isEditor, isReviewer } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Show timeout message after 5 seconds
    const timer = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading authentication...</p>
          {showTimeout && (
            <>
              <p className="text-gray-500 mt-4 text-sm">Taking longer than expected...</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="mt-2 text-primary-600 hover:text-primary-700 underline text-sm"
              >
                Return to login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'editor' && isEditor) ||
      (requiredRole === 'reviewer' && isReviewer);

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}