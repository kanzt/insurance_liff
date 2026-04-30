import { useState, useEffect, useRef } from 'preact/hooks';
import { searchPolicies } from '../utils/api';

export function PolicySearch({ baseApiUrl, idToken, onSelectPolicy, initialQuery = '' }) {
  const [policies, setPolicies] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery && debouncedQuery.length < 2) return;

      setIsLoading(true);
      try {
        const response = await searchPolicies(baseApiUrl, idToken, debouncedQuery, 20);
        const json = await response.json();

        if (json.results && Array.isArray(json.results)) {
          setPolicies(json.results);
        } else {
          setPolicies([]);
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
  }, [baseApiUrl, idToken, debouncedQuery]);

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
    setShowDropdown(true);
  };

  const handleSelect = (policy) => {
    const plate = policy.plateNumber || '';
    const displayValue = (plate === 'ประกันอื่นๆ' || policy.categoryId === '2')
      ? `${policy.subCategoryName || ''} ${policy.customerName || ''}`.trim()
      : `${plate} ${policy.customerName || ''}`.trim();
      
    setQuery(displayValue);
    onSelectPolicy(policy);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    onSelectPolicy(null);
    setPolicies([]);
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
          placeholder="🔍 ค้นหา ทะเบียนรถ หรือ ชื่อลูกค้า..."
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
                <span>{debouncedQuery ? 'ผลการค้นหา' : 'รายการล่าสุด (20 อันดับแรก)'}</span>
              </div>
              {policies.map(policy => (
                <div
                  key={policy.id}
                  onClick={() => handleSelect(policy)}
                  class="p-3 text-sm border-b border-gray-50 last:border-0 cursor-pointer hover:bg-brand-50 transition-colors group"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-slate-700 group-hover:text-brand-700">
                      {(policy.categoryId === '2' || policy.plateNumber === 'ประกันอื่นๆ') 
                        ? (policy.subCategoryName || policy.categoryName)
                        : (policy.plateNumber || 'ไม่ระบุทะเบียน')
                      }
                    </span>
                    <span class="text-[10px] text-gray-400">
                      📅 {formatThaiDate(policy.createdAt)}
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5 text-xs text-slate-500">
                    <div class="flex items-center gap-1">
                      <span>👤 {policy.customerName || '-'}</span>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                      <div class="text-[10px] text-brand-600 font-medium">
                        📦 {policy.categoryName || 'ประกันภัย'} {policy.subCategoryName ? `(${policy.subCategoryName})` : ''}
                      </div>
                      <div class="text-[9px] text-red-400 font-bold bg-red-50 px-1.5 rounded border border-red-50">
                        ⏳ หมดอายุ: {formatThaiDate(policy.expiryDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
