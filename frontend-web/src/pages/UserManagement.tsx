import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import type { User } from "../components/ui/User/index"; 

// ✅ นำเข้าแบบ Default Import (ไม่มีปีกกา)
import UserTable from "../components/ui/User/UserTable"; 
import UserDetailPanel from "../components/ui/User/UserDetailPanel";

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button className="flex items-center gap-2 bg-[#1E1E2D] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* --- Filter Bar (Card) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex gap-3">
          <select className="border px-4 py-2 rounded-lg text-gray-600 focus:outline-none">
            <option>Status: All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* --- เรียกใช้งาน UserTable โดยตรง --- */}
      <UserTable onSelectUser={setSelectedUser} /> 

      {/* --- User Detail Panel (Overlay) --- */}
      <UserDetailPanel 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};

export default UserManagement;