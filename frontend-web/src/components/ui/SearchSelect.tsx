import { useState, useMemo, useRef, useEffect } from "react";
import { Search } from "lucide-react"; 

export interface SearchOption<T = unknown> {
  id: string;
  label: string;
  subLabel?: string;
  originalData?: T;
}

interface SearchSelectProps<T = unknown> {
  label: string;
  placeholder?: string;
  options: SearchOption<T>[];
  value: SearchOption<T> | null;
  onChange: (selected: SearchOption<T> | null) => void;
}

export function SearchSelect<T = unknown>({ label, placeholder, options, value, onChange }: SearchSelectProps<T>) {
  const [query, setQuery] = useState(value ? value.label : "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">{label}</label>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={isOpen ? query : (value ? value.label : query)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (value) setQuery(""); 
          }}
          placeholder={placeholder || "Search..."}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
        />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button" 
                  onClick={() => {
                    onChange(opt);
                    setQuery(opt.label);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                >
                  <span className="font-semibold block">{opt.label}</span>
                  {opt.subLabel && <span className="text-xs text-slate-400">{opt.subLabel}</span>}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">No results found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}