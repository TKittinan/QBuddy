import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SidePanelEditProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // อนุญาตให้มีหรือไม่มี Footer ก็ได้
}

export function SidePanelEdit({ isOpen, onClose, title, children, footer }: SidePanelEditProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end">
      {/* Overlay สีดำเบลอ */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* แผง Panel */}
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header คงที่ */}
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* พื้นที่ Content เลื่อนได้ (รับค่ามาจากภายนอก) */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>

        {/* Footer คงที่ (ถ้ามีการส่ง prop footer มา) */}
        {footer && (
          <div className="p-6 border-t bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}