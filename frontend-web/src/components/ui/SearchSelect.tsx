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

  // ซิงค์ข้อมูลเวลาฟอร์มโดนสั่ง Reset
  useEffect(() => {
    setQuery(value ? value.label : "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // คืนค่าข้อความเดิมถ้าคลิกออกโดยไม่ได้เลือกอะไรใหม่
        setQuery(value ? value.label : ""); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = useMemo(() => {
    //แก้ไขตรงนี้: ถ้ายังไม่ได้พิมพ์อะไรเลย ให้ส่ง Array ว่างกลับไป (ไม่แสดงรายชื่อ)
    if (!query || query.trim() === "") return [];
    
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, options]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* ซ่อน label ถ้าไม่มีการส่งข้อความมา (เช่น ตรง Filter หน้าหลัก) */}
      {label && <label className="text-xs font-bold text-slate-500 uppercase block mb-2">{label}</label>}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            
            // ถ้าลบข้อความจนหมด ให้รีเซ็ตค่าเป็น null
            if (val === "") {
              onChange(null);
            }
            
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder || "Search..."}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] focus:border-transparent outline-none transition-all"
        />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {/* 🌟 เช็คเงื่อนไข: ถ้าไม่ได้พิมพ์ vs พิมพ์แล้วไม่เจอ vs พิมพ์แล้วเจอ */}
            {query.trim() === "" ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center bg-slate-50/50">พิมพ์ข้อความเพื่อเริ่มค้นหา...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button" 
                  onClick={() => {
                    onChange(opt);
                    setQuery(opt.label);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                >
                  <span className="font-semibold block">{opt.label}</span>
                  {opt.subLabel && <span className="text-xs text-slate-400">{opt.subLabel}</span>}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">ไม่พบข้อมูล</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}