import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // เก็บพิกัดของปุ่ม เพื่อให้เมนูลอยตามได้เป๊ะๆ
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, center: 0 });

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6, // เว้นระยะห่างจากปุ่ม 6px
        left: rect.left,
        right: document.documentElement.clientWidth - rect.right,
        center: rect.left + rect.width / 2,
      });
    }
  };

  // อัปเดตตำแหน่งเมื่อเปิดเมนู มีการย่อขยายจอ หรือมีการเลื่อน Scroll หน้าจอ
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true); // true = อัปเดตตลอดเวลาแม้เลื่อนตาราง
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // คำนวณสไตล์การจัดตำแหน่ง (ชิดซ้าย/ขวา/กลาง)
  const getMenuStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = { top: coords.top };
    if (align === "right") {
      style.right = coords.right;
    } else if (align === "center") {
      style.left = coords.center;
      style.transform = "translateX(-50%)";
    } else {
      style.left = coords.left;
    }
    return style;
  };

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="inline-block cursor-pointer">
        {trigger}
      </div>
      
      {/* 🌟 พระเอกของงาน: createPortal จะย้ายเมนูนี้ออกไปลอยอยู่นอกสุดของจอ (document.body) ไม่มีทางโดนกรอบใดๆ ตัดอีกต่อไป */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          ref={menuRef}
          style={getMenuStyle()}
          className={`fixed z-[9999] bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${className}`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider && <div className="border-t border-slate-100 my-1" />}
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
        </div>,
        document.body
      )}
    </>
  );
}