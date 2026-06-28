import { useState, useEffect } from 'preact/hooks';
import {
  fetchCategories,
  fetchProducts,
  fetchAgents,
  fetchCompanies,
  fetchTemplates,
  fetchPaymentMethods,
  fetchBrokerChannels,
} from '../utils/api';

const STORAGE_KEY = 'insurance_liff_form_draft';

export function useReferenceData(baseApiUrl, setCategoryId) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [brokerChannels, setBrokerChannels] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetchCategories(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setCategories(json.results);
          const storage = localStorage.getItem(STORAGE_KEY);
          const hasExistingCategory = storage && (storage.includes('"categoryId":') || storage.includes('"productId":'));

          if (json.results.length > 0 && !hasExistingCategory && setCategoryId) {
            setCategoryId(json.results[0].categoryId.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();

    async function loadSubCategories() {
      try {
        const response = await fetchProducts(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setProducts(json.results);
        }
      } catch (err) {
        console.error("Failed to load sub-categories:", err);
      }
    }
    loadSubCategories();

    async function loadTemplates() {
      try {
        const response = await fetchTemplates(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setTemplates(json.results);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    }
    loadTemplates();

    async function loadAllAgents() {
      try {
        const response = await fetchAgents(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setAllAgents(json.results);
        }
      } catch (err) {
        console.error("Failed to load all agents:", err);
      }
    }
    loadAllAgents();

    async function loadCompanies() {
      const CACHE_KEY = 'insurance_companies_cache';
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
          if (!isExpired) {
            setCompanies(data);
            return;
          }
        } catch (e) {
          console.warn("Invalid company cache");
        }
      }

      try {
        const response = await fetchCompanies(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setCompanies(json.results);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: json.results,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    }
    loadCompanies();

    async function loadPaymentMethods() {
      try {
        const response = await fetchPaymentMethods(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setPaymentMethods(json.results);
        }
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      }
    }
    loadPaymentMethods();

    async function loadBrokerChannels() {
      try {
        const response = await fetchBrokerChannels(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setBrokerChannels(json.results);
        }
      } catch (err) {
        console.error("Failed to load broker channels:", err);
      }
    }
    loadBrokerChannels();
  }, [baseApiUrl, setCategoryId]);

  return {
    categories,
    products,
    templates,
    allAgents,
    companies,
    paymentMethods,
    brokerChannels,
  };
}
