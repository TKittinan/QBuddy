import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; //ใช้ Portal เพื่อให้ลอยเหนือทุกอย่าง

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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      // คำนวณจุดอ้างอิง (X) ให้ตรงกับ Props ที่ส่งมา
      let leftPos = 0;
      if (align === "left") {
        leftPos = rect.left + window.scrollX;
      } else if (align === "right") {
        leftPos = rect.right + window.scrollX;
      } else if (align === "center") {
        leftPos = rect.left + window.scrollX + (rect.width / 2);
      }

      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: leftPos,
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

    // ปิดเมนูอัตโนมัติเมื่อมีการ Scroll เพื่อไม่ให้เมนูลอยค้างผิดที่
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // จัดหน้าเมนูให้ชิดซ้าย ขวา หรือกลาง โดยไม่ต้องฟิกซ์ความกว้าง 192px
  let transformStyle = "none";
  if (align === "right") transformStyle = "translateX(-100%)";
  if (align === "center") transformStyle = "translateX(-50%)";

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>
      
      {/* พ่นเมนูไปไว้ที่ชั้นนอกสุดของ HTML เพื่อไม่ให้โดนตารางตัด */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: transformStyle // เลื่อนตาม Align ที่ตั้งไว้
          }}
          // เปลี่ยนจาก fixed เป็น absolute เพื่อให้วิ่งตาม window.scrollY ได้เนียนๆ
          className={`absolute bg-white rounded-xl shadow-2xl border border-slate-100 z-[9999] py-1 overflow-hidden animate-in fade-in zoom-in duration-150 ${className}`}
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