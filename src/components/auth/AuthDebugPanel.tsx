import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';

export function AuthDebugPanel() {
  const { user, session, loading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('sb-mdrgxkflxurntyjtfjan-auth-token');
    if (authToken) {
      try {
        const parsed = JSON.parse(authToken);
        setTokenInfo({
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: new Date(parsed.expires_at * 1000).toLocaleString(),
          isExpired: new Date(parsed.expires_at * 1000) < new Date()
        });
      } catch (e) {
        setTokenInfo({ error: 'Failed to parse token' });
      }
    } else {
      setTokenInfo({ error: 'No token in localStorage' });
    }
  }, [session]);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs"
      >
        Show Auth Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ×
      </button>
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <p>Loading: {String(loading)}</p>
        <p>User: {user ? user.email : 'null'}</p>
        <p>Session: {session ? 'exists' : 'null'}</p>
        {tokenInfo && (
          <>
            <p>Access Token: {tokenInfo.hasAccessToken ? 'yes' : 'no'}</p>
            <p>Refresh Token: {tokenInfo.hasRefreshToken ? 'yes' : 'no'}</p>
            <p>Expires: {tokenInfo.expiresAt || 'N/A'}</p>
            <p>Expired: {String(tokenInfo.isExpired || false)}</p>
            {tokenInfo.error && <p className="text-red-400">Error: {tokenInfo.error}</p>}
          </>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}