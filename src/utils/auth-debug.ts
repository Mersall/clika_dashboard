export function debugAuthState(context: string) {
  const authToken = localStorage.getItem('sb-mdrgxkflxurntyjtfjan-auth-token');
  
  console.group(`🔍 Auth Debug: ${context}`);
  console.log('Timestamp:', new Date().toISOString());
  
  if (authToken) {
    try {
      const parsed = JSON.parse(authToken);
      console.log('Token exists:', true);
      console.log('Access token:', parsed.access_token ? `${parsed.access_token.substring(0, 20)}...` : 'none');
      console.log('Refresh token:', parsed.refresh_token ? `${parsed.refresh_token.substring(0, 20)}...` : 'none');
      console.log('Expires at:', new Date(parsed.expires_at * 1000).toISOString());
      console.log('Expired:', new Date(parsed.expires_at * 1000) < new Date());
      console.log('Provider token:', !!parsed.provider_token);
      console.log('Provider refresh token:', !!parsed.provider_refresh_token);
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  } else {
    console.log('No auth token in localStorage');
  }
  
  console.log('Current URL:', window.location.href);
  console.log('localStorage keys:', Object.keys(localStorage));
  console.groupEnd();
}