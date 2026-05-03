import { useState, useEffect, useRef } from 'preact/hooks';

export function SearchableSelect({ 
  options, 
  value, 
  onSelect, 
  placeholder = "พิมพ์เพื่อค้นหา...", 
  required = false,
  labelKey = "label",
  valueKey = "value",
  disabled = false,
  displayTemplate = (opt) => opt[labelKey]
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);

  // Sync internal query when value changes
  useEffect(() => {
    const selected = options.find(opt => opt[valueKey]?.toString() === value?.toString());
    if (selected) {
      setQuery(displayTemplate(selected));
    } else if (!value) {
      setQuery('');
    }
  }, [value, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        // Reset query to current selected value display name
        const selected = options.find(opt => opt[valueKey]?.toString() === value?.toString());
        setQuery(selected ? displayTemplate(selected) : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);

    const lowerVal = val.toLowerCase();
    setFilteredOptions(
      options.filter(opt => 
        displayTemplate(opt).toLowerCase().includes(lowerVal) ||
        opt[valueKey]?.toString().toLowerCase().includes(lowerVal)
      )
    );
  };

  const handleSelect = (opt) => {
    onSelect(opt);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setShowDropdown(false);
  };

  const highlightText = (text, q) => {
    if (!q || typeof text !== 'string') return text;
    const regex = new RegExp(`(${q})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} class="text-brand-600 font-bold underline">{part}</span> : part
    );
  };

  return (
    <div class="relative" ref={containerRef}>
      <div class="relative">
        <input
          type="text"
          value={query}
          onInput={handleInput}
          onFocus={() => { if (!disabled) setShowDropdown(true); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
          placeholder={disabled ? "" : `🔍 ${placeholder}`}
          disabled={disabled}
          required={required && !value}
          autocomplete="off"
          class={`block w-full rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm pr-10
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80'}`}
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
      </div>
      
      {showDropdown && (
        <div class="absolute z-[100] mt-1 w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredOptions.length === 0 ? (
            <div class="p-4 text-center text-gray-500 text-sm italic">❌ ไม่พบข้อมูล</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt[valueKey]}
                onClick={() => handleSelect(opt)}
                class={`p-3 text-sm hover:bg-green-50 hover:text-brand-600 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between transition-colors ${value?.toString() === opt[valueKey]?.toString() ? 'bg-green-50 text-brand-700 font-bold' : ''}`}
              >
                <span class="truncate">{highlightText(displayTemplate(opt), query)}</span>
                {value?.toString() === opt[valueKey]?.toString() ? (
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                ) : (
                   <span class="text-xs text-gray-400 font-mono ml-2 opacity-50">{opt[valueKey]}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
