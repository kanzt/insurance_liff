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
export const fetchAgents = (baseUrl) => authenticatedFetch(`${baseUrl}/load-agents`);
export const fetchCategories = (baseUrl) => authenticatedFetch(`${baseUrl}/load-insurance-categories`);
export const fetchProducts = (baseUrl) => authenticatedFetch(`${baseUrl}/load-insurance-products`);
export const fetchCompanies = (baseUrl) => authenticatedFetch(`${baseUrl}/load-insurance-companies`);
export const fetchTemplates = (baseUrl) => authenticatedFetch(`${baseUrl}/load-notification-templates`);
export const fetchPaymentMethods = (baseUrl) => authenticatedFetch(`${baseUrl}/load-payment-methods`);
export const fetchBrokerChannels = (baseUrl) => authenticatedFetch(`${baseUrl}/load-broker-channels`);
export const fetchQuotationTypes = (baseUrl) => authenticatedFetch(`${baseUrl}/load-quotation-types`);
export const fetchVehicleYears = (baseUrl) => authenticatedFetch(`${baseUrl}/load-vehicle-years`);
export const fetchVehicleMakes = (baseUrl, year = '') => {
  const url = year ? `${baseUrl}/load-vehicle-makes?year=${encodeURIComponent(year)}` : `${baseUrl}/load-vehicle-makes`;
  return authenticatedFetch(url);
};
export const fetchVehicleModels = (baseUrl, make, year = '') => {
  if (!make) return Promise.reject(new Error("Make is required for fetchVehicleModels"));
  const params = new URLSearchParams({ make });
  if (year) params.append('year', year);
  return authenticatedFetch(`${baseUrl}/load-vehicle-models?${params.toString()}`);
};

/**
 * Server-side search for quotations (supports quotation_type_id filter)
 */
export const searchQuotations = (baseUrl, searchTerm = '', limit = 20, year = '', quotationTypeId = '') => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('limit', limit.toString());
  if (year) params.append('year', year.toString());
  if (quotationTypeId) params.append('quotation_type_id', quotationTypeId);

  return authenticatedFetch(`${baseUrl}/load-quotations?${params.toString()}`);
};


/**
 * Server-side search for issued policies (for renewals)
 */
export const searchPolicies = (baseUrl, searchTerm = '', limit = 20) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('limit', limit.toString());

  return authenticatedFetch(`${baseUrl}/load-policies?${params.toString()}`);
};


export const submitQuotation = (baseUrl, formData) => authenticatedFetch(`${baseUrl}/submit-quotation`, {
  method: 'POST',
  body: formData
});

export const updateQuotation = (baseUrl, formData) => authenticatedFetch(`${baseUrl}/update-quotation`, {
  method: 'POST',
  body: formData
});

export const submitPolicy = (baseUrl, formData) => authenticatedFetch(`${baseUrl}/submit-policy`, {
  method: 'POST',
  body: formData
});
