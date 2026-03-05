import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // ✅ ใช้ Portal เพื่อให้ลอยเหนือทุกอย่าง

export interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ trigger, items, className = "w-48" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // คำนวณตำแหน่งให้ลอยทับปุ่มพอดี
      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right - 192, // ลบความกว้าง dropdown (w-48 = 192px)
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={toggleDropdown}>{trigger}</div>
      
      {/* ✅ พ่นเมนูไปไว้ที่ชั้นนอกสุดของ HTML เพื่อไม่ให้โดนตารางตัด */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: coords.top, left: coords.left }}
          className={`fixed bg-white rounded-xl shadow-2xl border border-slate-100 z-[9999] py-1 overflow-hidden animate-in fade-in zoom-in duration-150 ${className}`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider && <div className="border-t border-slate-100 my-1" />}
              <button
                onClick={() => { setIsOpen(false); item.onClick?.(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${item.className || "text-slate-600"}`}
              >
                {item.icon && <span className="text-slate-400">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}