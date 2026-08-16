import { useState, useEffect, useRef } from 'preact/hooks';
import { searchQuotations, searchPolicies } from '../utils/api';

export function PolicySearch({
  baseApiUrl,
  idToken,
  onSelectPolicy,
  onQueryChange,
  onResultsFetched,
  initialQuery = '',
  uploadHistory = [],
  placeholder = "🔍 ค้นหา ทะเบียนรถ หรือ ชื่อลูกค้า...",
  year = '',
  searchMode = 'quotations', // 'quotations' | 'policies'
  quotationTypeId = ''
}) {
  const [policies, setPolicies] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef(null);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const prevUploadHistoryRef = useRef(uploadHistory);

  // Sync internal query with prop when it changes (e.g. on reset)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Watch uploadHistory for completed jobs to refresh stale data
  useEffect(() => {
    const prevHistory = prevUploadHistoryRef.current || [];
    const hasCompletedJob = uploadHistory.some(currentJob => {
      const prevJob = prevHistory.find(j => j.id === currentJob.id);
      return prevJob && prevJob.status === 'loading' && currentJob.status === 'success';
    });

    if (hasCompletedJob) {
      // Clear stale policies and trigger a refetch
      setPolicies([]);
      setRefreshKey(k => k + 1);
    }
    
    prevUploadHistoryRef.current = uploadHistory;
  }, [uploadHistory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery && debouncedQuery.length < 2) return;

      const effectiveTypeId = quotationTypeId || (searchMode === 'policies' ? 'renewal' : 'new');

      setIsLoading(true);
      try {
      if (searchMode === 'policies') {
        const currentYear = new Date().getFullYear().toString();
        // Step 1: Check if a renewal quotation case is already open this year
        try {
          const quotRes = await searchQuotations(baseApiUrl, debouncedQuery, 20, currentYear, 'renewal');
          const quotJson = await quotRes.json();

          if (quotJson.results && Array.isArray(quotJson.results) && quotJson.results.length > 0) {
            // Found existing renewal quotation -> display it for additional docs/update mode, no need to query searchPolicies
            const tagged = quotJson.results.map(q => ({ ...q, _recordType: 'quotation' }));
            setPolicies(tagged);
            if (onResultsFetched) onResultsFetched(tagged);
            return;
          }
        } catch (e) {
          console.error("Error searching renewal quotations:", e);
        }

        // Step 2: If no renewal quote exists for this year, search issued policies to start a new renewal quote
        try {
          const policyRes = await searchPolicies(baseApiUrl, debouncedQuery, 20);
          const policyJson = await policyRes.json();

          if (policyJson.results && Array.isArray(policyJson.results) && policyJson.results.length > 0) {
            const tagged = policyJson.results.map(p => ({ ...p, _recordType: 'policy' }));
            setPolicies(tagged);
            if (onResultsFetched) onResultsFetched(tagged);
          } else {
            setPolicies([]);
            if (onResultsFetched) onResultsFetched([]);
          }
        } catch (e) {
          console.error("Error searching issued policies:", e);
          setPolicies([]);
          if (onResultsFetched) onResultsFetched([]);
        }
      } else {
        const currentYear = new Date().getFullYear().toString();
        // Step 1: Check existing quotations for this search term (detects State 3: Active renewal quote or existing new quote)
        try {
          const quotRes = await searchQuotations(baseApiUrl, debouncedQuery, 20, currentYear);
          const quotJson = await quotRes.json();

          if (quotJson.results && Array.isArray(quotJson.results) && quotJson.results.length > 0) {
            const tagged = quotJson.results.map(q => ({ ...q, _recordType: 'quotation' }));
            setPolicies(tagged);
            if (onResultsFetched) onResultsFetched(tagged);
            return;
          }
        } catch (e) {
          console.error("Error searching quotations in new mode:", e);
        }

        // Step 2: If no quotation found, check if it's an issued policy in our system (State 2: Renewal candidate)
        try {
          const policyRes = await searchPolicies(baseApiUrl, debouncedQuery, 20);
          const policyJson = await policyRes.json();

          if (policyJson.results && Array.isArray(policyJson.results) && policyJson.results.length > 0) {
            const tagged = policyJson.results.map(p => ({ ...p, _recordType: 'policy' }));
            setPolicies(tagged);
            if (onResultsFetched) onResultsFetched(tagged);
          } else {
            setPolicies([]);
            if (onResultsFetched) onResultsFetched([]);
          }
        } catch (e) {
          console.error("Error searching issued policies in new mode:", e);
          setPolicies([]);
          if (onResultsFetched) onResultsFetched([]);
        }
      }


      } catch (error) {
        console.error("Search error:", error);
        setPolicies([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }

    performSearch();
  }, [baseApiUrl, idToken, debouncedQuery, refreshKey, year, searchMode, quotationTypeId]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e) => {
    setQuery(e.target.value);
    if (onQueryChange) onQueryChange(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (policy) => {
    const plate = policy.plateNumber || policy.plate_number || '';
    const customer = policy.customerName || policy.customer_name || '';
    const catId = policy.categoryId || policy.category_id;
    const subCatName = policy.subCategoryName || policy.sub_category_name || policy.productName || policy.product_name || '';
    
    const displayValue = (plate === 'ประกันอื่นๆ' || catId === 'non_motor' || catId === '2' || catId === 2)
      ? `${subCatName} ${customer}`.trim()
      : (plate ? `${plate} ${customer}`.trim() : customer.trim());
      
    setQuery(displayValue);
    if (onQueryChange) onQueryChange(displayValue);
    onSelectPolicy(policy);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    if (onQueryChange) onQueryChange('');
    onSelectPolicy(null);
    setPolicies([]);
    if (onResultsFetched) onResultsFetched([]);
    setHasSearched(false);
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
    } catch (e) { return dateStr; }
  };

  return (
    <div class="relative" ref={containerRef}>
      <div class="relative">
        <input
          type="text"
          value={query}
          onInput={handleInput}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm pr-10"
          autocomplete="off"
        />
        <div class="absolute right-3 top-3.5 flex items-center gap-2">
          {isLoading && (
            <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          {query && (
            <button type="button" onClick={handleClear} class="text-gray-400 hover:text-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div class="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {isLoading && policies.length === 0 ? (
            <div class="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
              <div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span>กำลังค้นหาข้อมูล...</span>
            </div>
          ) : policies.length === 0 ? (
            <div class="p-8 text-center text-gray-500 text-sm">
              {query.length < 2 ? '⚠️ กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร' : '❌ ไม่พบรายการที่ตรงกับคำค้นหา'}
            </div>
          ) : (
            <div class="py-1">
              <div class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 flex justify-between items-center">
                <span>{debouncedQuery ? (searchMode === 'policies' ? 'ผลการค้นหากรมธรรม์เดิม & เคสเช็คเบี้ย' : 'ผลการค้นหา') : (searchMode === 'policies' ? 'กรมธรรม์และเคสล่าสุด' : 'รายการล่าสุด')}</span>
              </div>
              {policies.map(item => {
                const isPolicyRecord = item._recordType === 'policy' || (item.policyId && !item._recordType);
                const plate = item.plateNumber || item.plate_number;
                const customer = item.customerName || item.customer_name;
                const catId = item.categoryId || item.category_id;
                const catName = item.categoryName || item.category_name;
                const subCatName = item.subCategoryName || item.sub_category_name || item.productName || item.product_name;
                const companyName = item.companyName || item.company_name;
                const createdAt = item.createdAt || item.created_at;
                const expiry = item.policyExpiryDate || item.expiryDate || item.expiry_date || item.previous_policy_expiry_date;

                const isProcessing = uploadHistory && uploadHistory.some(
                  job => (job.title === plate || job.title === customer) && job.status === 'loading'
                );

                return (
                  <div
                    key={`${isPolicyRecord ? 'pol' : 'quo'}_${item.policyId || item.id || item.policy_id || item.quotationId}`}
                    onClick={() => { if (!isProcessing) handleSelect(item) }}
                    class={`p-3 text-sm border-b border-gray-50 last:border-0 ${isProcessing ? 'cursor-not-allowed opacity-60 bg-gray-50' : 'cursor-pointer hover:bg-brand-50 transition-colors group'}`}
                  >
                    <div class="flex justify-between items-start mb-1">
                      <span class={`font-bold flex items-center gap-1.5 ${isProcessing ? 'text-gray-500' : 'text-slate-700 group-hover:text-brand-700'}`}>
                        <span>
                          {(catId === 'non_motor' || catId === '2' || catId === 2 || plate === 'ประกันอื่นๆ') 
                            ? (subCatName || catName)
                            : (plate || 'ไม่ระบุทะเบียน')
                          }
                        </span>
                        {isPolicyRecord ? (
                          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-teal-50 text-teal-700 border-teal-200 flex items-center gap-1">
                            <span>🛡️ กรมธรรม์ {item.policyId}</span>
                            <span class="text-[8px] bg-teal-100 text-teal-800 px-1 rounded">เปิดต่ออายุ</span>
                          </span>
                        ) : (
                          <span class={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            item.quotationTypeId === 'renewal'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            <span>📄 เคส #{item.quotationId} ({item.quotationTypeName || (item.quotationTypeId === 'renewal' ? 'งานต่ออายุ' : 'งานใหม่')})</span>
                            <span class="text-[8px] bg-amber-100 text-amber-800 px-1 rounded">ส่งเอกสารเพิ่ม</span>
                          </span>
                        )}
                        {isProcessing && <span class="text-[10px] text-orange-600 font-normal bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">⏳ กำลังประมวลผล</span>}
                      </span>
                      <span class="text-[10px] text-gray-400">
                        📅 {formatThaiDate(createdAt)}
                      </span>
                    </div>

                    <div class="flex flex-col gap-0.5 text-xs text-slate-500">
                      <div class="flex items-center gap-1">
                        <span>👤 {customer || '-'}</span>
                      </div>
                      <div class="flex justify-between items-center mt-1">
                        <div class="text-[10px] text-brand-600 font-medium">
                          {companyName ? `🏢 ${companyName}` : ''} {subCatName ? `(${subCatName})` : (catName ? `(${catName})` : '')}
                        </div>
                        <div class="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          ⏳ หมดอายุ: {formatThaiDate(expiry)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


