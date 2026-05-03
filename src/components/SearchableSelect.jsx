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

  return (
    <div class="relative" ref={containerRef}>
      <div class="relative">
        <input
          type="text"
          value={query}
          onInput={handleInput}
          onFocus={() => { if (!disabled) setShowDropdown(true); }}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          autocomplete="off"
          class={`block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm pr-10 ${disabled ? 'bg-gray-100 text-gray-400' : ''}`}
        />
        <div class="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {showDropdown && (
        <div class="absolute z-[100] mt-1 w-full bg-white border border-brand-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredOptions.length === 0 ? (
            <div class="p-4 text-center text-gray-500 text-sm italic">❌ ไม่พบข้อมูล</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt[valueKey]}
                onClick={() => handleSelect(opt)}
                class={`p-3 text-sm hover:bg-brand-50 cursor-pointer border-b border-brand-50 last:border-0 flex items-center justify-between transition-colors ${value?.toString() === opt[valueKey]?.toString() ? 'bg-brand-50 text-brand-700 font-bold' : ''}`}
              >
                <span>{displayTemplate(opt)}</span>
                {value?.toString() === opt[valueKey]?.toString() && (
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
