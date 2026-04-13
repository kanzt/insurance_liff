import liff from '@line/liff';

/**
 * Enhanced fetch that automatically includes the LIFF ID Token
 * and handles 401/403 errors by triggering a re-login.
 */
export async function authenticatedFetch(url, options = {}) {
  const idToken = liff.getIDToken();
  
  const isFormData = options.body instanceof FormData;
  const headers = {
    'Authorization': `Bearer ${idToken}`,
    ...options.headers
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle session expiry reactively
    if (response.status === 401 || response.status === 403) {
      console.warn("Session expired or unauthorized. Triggering recovery...");
      
      // In external browsers, logout helps ensure a fresh session
      if (!liff.isInClient()) {
        liff.logout();
      }
      
      // Redirect to login. Form state should already be in localStorage 
      // via the PolicyForm's auto-save logic.
      liff.login();
      
      return response;
    }

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}
