import { useState, useEffect, useRef } from "react";

export interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: "left" | "right" | "center";
}

export function Dropdown({ trigger, items, className = "w-48", align = "right" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignmentClass = align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute top-full mt-1.5 z-[9999] bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${alignmentClass} ${className}`}>
          {items.map((item, index) => (
            <div key={index}>
              {item.divider && <div className="border-t border-slate-100 my-1" />}
              {/* 🌟 บังคับว่าถ้าไม่มี label จะไม่สร้างปุ่มเปล่าๆ คั่นเด็ดขาด ช่องว่างหาย 100% */}
              {item.label && (
                <button
                  onClick={() => { setIsOpen(false); item.onClick?.(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 ${item.className || "text-slate-600"}`}
                >
                  {item.icon && <span className="text-slate-400 shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}