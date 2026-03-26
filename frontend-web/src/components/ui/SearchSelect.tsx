import { useState, useMemo, useRef, useEffect } from "react";
import { Search } from "lucide-react"; // ใช้ของเว็บ

export interface SearchOption {
  id: string;
  label: string;
  subLabel?: string;
  originalData?: any;
}

interface SearchSelectProps {
  label: string;
  placeholder?: string;
  options: SearchOption[];
  value: SearchOption | null;
  onChange: (selected: SearchOption | null) => void;
}

export function SearchSelect({ label, placeholder, options, value, onChange }: SearchSelectProps) {
  const [query, setQuery] = useState(value ? value.label : "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null); // ของ Web DOM

  // ปิด Dropdown เมื่อคลิกที่อื่น (Click outside)
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
    <div className="space-y-3" ref={wrapperRef}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "Search..."}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
        />
        
        {isOpen && query.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button" // ป้องกันการ submit ฟอร์ม
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
      {value && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ Selected: {value.label}
        </p>
      )}
    </div>
  );
}