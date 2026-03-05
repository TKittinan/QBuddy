import { createPortal } from "react-dom";
import { X, Mail, Shield, Calendar, MessageSquare } from "lucide-react";
import type { User } from "../../../types";

type Props = {
  user: User | null;
  onClose: () => void;
};

export default function UserDetailPanel({ user, onClose }: Props) {
  if (!user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end">
      {/* Background Overlay: เบลอคลุมทั้งหน้าจอแน่นอน */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">User Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-100 mb-4 uppercase">
              {user.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{user.name}</h3>
            <p className="text-slate-500 text-sm mt-1">{user.email}</p>
            <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${
              user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {user.status}
            </span>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Information</h4>
            <div className="grid grid-cols-1 gap-5">
              <DetailItem icon={<Mail size={18} />} label="Email Address" value={user.email} />
              <DetailItem icon={<Shield size={18} />} label="Access Level" value={user.role} />
              <DetailItem icon={<Calendar size={18} />} label="Member Since" value={user.createdAt} />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <MessageSquare size={18} /> Send Direct Message
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ✅ แก้ Error 'Unexpected any' โดยระบุ Type ให้ icon เป็น React.ReactNode
interface DetailItemProps {
  icon: React.ReactNode; 
  label: string; 
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100">
      <div className="text-slate-400 mt-1">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}