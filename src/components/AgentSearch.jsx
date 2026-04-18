import { useState, useEffect, useRef } from 'preact/hooks';

export function AgentSearch({ baseApiUrl, idToken, onSelectAgent, initialQuery = '', disabled = false }) {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  // Sync internal query when initialQuery changes (e.g. via localStorage restore)
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch(`${baseApiUrl}/load-agents`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const result = await response.json();
        if (result.results && Array.isArray(result.results)) {
          setAgents(result.results);
          setFilteredAgents(result.results);
        }
      } catch (error) {
        console.error("Error loading agents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [baseApiUrl, idToken]);

  const handleInput = (e) => {
    if (disabled) return;
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);

    if (!val) {
      setSelectedAgent(null);
      onSelectAgent(null, '');
      setFilteredAgents(agents);
      return;
    }

    const lowerVal = val.toLowerCase();
    setFilteredAgents(
      agents.filter(a => 
        a.fullName.toLowerCase().includes(lowerVal) || 
        a.agentId.toLowerCase().includes(lowerVal)
      )
    );
  };

  const handleSelect = (agent) => {
    if (disabled) return;
    const formattedName = `${agent.fullName} (${agent.agentId})`;
    setQuery(formattedName);
    setSelectedAgent(agent);
    onSelectAgent(agent.agentId, formattedName);
    setShowDropdown(false);
  };

  const handleClear = () => {
    if (disabled) return;
    setQuery('');
    setSelectedAgent(null);
    onSelectAgent(null, '');
    setFilteredAgents(agents);
    setShowDropdown(false);
  };

  const highlightText = (text, q) => {
    if (!q) return text;
    const regex = new RegExp(`(${q})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} class="text-brand-600 font-bold underline">{part}</span> : part
    );
  };

  return (
    <div class="relative" ref={containerRef}>
      <input 
        type="text" 
        value={query}
        onInput={handleInput}
        onFocus={() => { if (agents.length > 0 && !disabled) setShowDropdown(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
        placeholder={disabled ? "" : "🔍 ค้นหาชื่อหรือรหัสตัวแทน..."}
        disabled={disabled}
        class={`block w-full rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm pr-10
          ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80'}`}
        autocomplete="off" 
        required
      />
      {query && !disabled && (
        <button 
          type="button" 
          onClick={handleClear}
          class="absolute right-3 top-3 text-gray-400 hover:text-brand-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      )}

      {showDropdown && (
        <div class="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto transition-all duration-200">
          {isLoading ? (
            <div class="p-3 text-center text-gray-500 text-sm italic">⏳ กำลังโหลดรายชื่อตัวแทน...</div>
          ) : filteredAgents.length === 0 ? (
            <div class="p-3 text-center text-gray-500 text-sm">❌ ไม่พบรายชื่อที่ค้นหา</div>
          ) : (
            filteredAgents.map(agent => (
              <div 
                key={agent.agentId}
                onClick={() => handleSelect(agent)}
                class="agent-item p-3 text-sm border-b border-gray-50 last:border-0 flex justify-between items-center cursor-pointer hover:bg-green-50 hover:text-brand-600 transition-colors"
              >
                <span class="truncate">{highlightText(agent.fullName, query)}</span>
                <span class="text-xs text-gray-400 font-mono ml-2">{highlightText(agent.agentId, query)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
