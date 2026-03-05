import { X } from "lucide-react";
import type { User } from "../User/index"; 

type Props = {
  user: User | null;
  onClose: () => void;
};

const UserDetailPanel = ({ user, onClose }: Props) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-[420px] bg-white h-full shadow-xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-xs text-slate-500">Total Bookings</p>
            <p className="text-xl font-semibold">24</p>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl">
            <p className="text-xs text-slate-500">Cancellations</p>
            <p className="text-xl font-semibold text-red-500">2</p>
          </div>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-2 rounded-xl">
          Suspend User
        </button>
      </div>
    </div>
  );
};

export default UserDetailPanel;