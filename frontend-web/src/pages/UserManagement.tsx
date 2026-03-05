import { useState } from "react";
import { Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import UserDetailPanel from "../components/ui/User/UserDetailPanel";
import type { User, Column } from "../types";

const initialUsers: User[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "CUSTOMER", status: "ACTIVE", createdAt: "Oct 12, 2023" },
  { id: "2", name: "Bob Johnson", email: "bob.j@example.com", role: "STAFF", status: "INACTIVE", createdAt: "Sep 20, 2023" },
];

export default function UserManagement() {
  const [users] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns: Column<User>[] = [
    {
      header: "USER INFO",
      key: "name",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    { header: "ROLE", key: "role" },
    {
      header: "STATUS",
      key: "status",
      render: (user) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {user.status}
        </span>
      ),
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (user) => (
        <Dropdown 
          trigger={
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          }
          items={[
            { label: "View Details", icon: <Eye size={16} />, onClick: () => setSelectedUser(user) },
            { label: "Edit User", icon: <Edit size={16} />, className: "text-indigo-600", onClick: () => alert("Edit Mode") },
            { label: "Delete User", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => confirm("Are you sure?") },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">System Users</h2>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus size={18} /> Add New User
        </Button>
      </div>

      <Table data={users} columns={columns} />

      <UserDetailPanel 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}