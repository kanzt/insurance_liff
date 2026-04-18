import { useState, useEffect, useRef } from 'preact/hooks';

export function PolicySearch({ baseApiUrl, idToken, onSelectPolicy, initialQuery = '' }) {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        // MOCK DATA until backend is ready
        // In real implementation, this would be: 
        // const response = await fetch(`${baseApiUrl}/load-policies`, { headers: { 'Authorization': `Bearer ${idToken}` } });
        // const result = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        const mockResult = {
          results: [
            {
              id: "POL-001",
              plateNumber: "1กข-1234 กทม",
              customerName: "สมชาย ใจดี",
              subCategoryId: "1",
              subCategoryName: "รรถยนต์ (ภาคสมัครใจ)",
              agentCode: "A001",
              agentName: "ก้องเกียรติ มั่นคง (A001)",
              createdAt: "2024-04-10T08:30:00Z"
            },
            {
              id: "POL-002",
              plateNumber: "7กก-8888 นนทบุรี",
              customerName: "วิชัย รักชาติ",
              subCategoryId: "1",
              subCategoryName: "รถยนต์ (ภาคสมัครใจ)",
              agentCode: "A002",
              agentName: "สมสมัย ใจดี (A002)",
              createdAt: "2024-04-12T14:20:00Z"
            },
            {
              id: "POL-003",
              plateNumber: "ป้ายแดง",
              customerName: "นางสาวสมหญิง มั่งมี",
              subCategoryId: "7",
              subCategoryName: "ประกันอุบัติเหตุ (PA)",
              agentCode: "A001",
              agentName: "ก้องเกียรติ มั่นคง (A001)",
              createdAt: "2024-04-15T09:15:00Z"
            }
          ]
        };

        if (mockResult.results && Array.isArray(mockResult.results)) {
          setPolicies(mockResult.results);
          setFilteredPolicies(mockResult.results);
        }
      } catch (error) {
        console.error("Error loading policies:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPolicies();

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [baseApiUrl, idToken]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);

    if (!val) {
      onSelectPolicy(null);
      setFilteredPolicies(policies);
      return;
    }

    const lowerVal = val.toLowerCase();
    setFilteredPolicies(
      policies.filter(p => 
        (p.plateNumber && p.plateNumber.toLowerCase().includes(lowerVal)) || 
        (p.customerName && p.customerName.toLowerCase().includes(lowerVal)) ||
        p.id.toLowerCase().includes(lowerVal)
      )
    );
  };

  const handleSelect = (policy) => {
    const displayValue = `${policy.id} | ${policy.plateNumber || ''} ${policy.customerName || ''}`.trim();
    setQuery(displayValue);
    onSelectPolicy(policy);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    onSelectPolicy(null);
    setFilteredPolicies(policies);
    setShowDropdown(false);
  };

  const highlightText = (text, q) => {
    if (!text || !q) return text || '';
    const regex = new RegExp(`(${q})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} class="text-brand-600 font-bold underline">{part}</span> : part
    );
  };

  const formatThaiDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
  };

  return (
    <div class="relative" ref={containerRef}>
      <input 
        type="text" 
        value={query}
        onInput={handleInput}
        onFocus={() => { if (policies.length > 0) setShowDropdown(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
        placeholder="🔍 ค้นหาจาก ทะเบียน, ชื่อลูกค้า หรือ เลขที่รายการ..."
        class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm pr-10"
        autocomplete="off" 
      />
      {query && (
        <button 
          type="button" 
          onClick={handleClear}
          class="absolute right-3 top-3.5 text-gray-400 hover:text-brand-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      )}

      {showDropdown && (
        <div class="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {isLoading ? (
            <div class="p-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
              <div class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span>กำลังดึงรายการล่าสุด...</span>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div class="p-4 text-center text-gray-500 text-sm">❌ ไม่พบรายการที่โชะกับคำค้นหา</div>
          ) : (
            <div class="py-1">
              <div class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                รายการล่าสุด
              </div>
              {filteredPolicies.map(policy => (
                <div 
                  key={policy.id}
                  onClick={() => handleSelect(policy)}
                  class="p-3 text-sm border-b border-gray-50 last:border-0 cursor-pointer hover:bg-brand-50 transition-colors group"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">
                      {highlightText(policy.id, query)}
                    </span>
                    <span class="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      📅 {formatThaiDate(policy.createdAt)}
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5 text-xs text-slate-500">
                    <div class="flex items-center gap-1">
                      <span class="opacity-50 text-[10px]">🚗</span> 
                      <span>{highlightText(policy.plateNumber, query) || '-'}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="opacity-50 text-[10px]">👤</span> 
                      <span>{highlightText(policy.customerName, query) || '-'}</span>
                    </div>
                    <div class="mt-1 text-[10px] text-brand-600 font-medium">
                      📦 {policy.subCategoryName}
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
