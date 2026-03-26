import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom"; // 🌟 Import เพิ่มเติม
import { 
  Plus, MoreHorizontal, Edit, Trash2, 
  Mail, Shield, Calendar, CheckCircle2, User as UserIcon
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input"; 
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import type { User, Column } from "../types";

const initialUsers: User[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "CUSTOMER", status: "ACTIVE", createdAt: "Oct 12, 2023" },
  { id: "2", name: "Bob Johnson", email: "bob.j@example.com", role: "STAFF", status: "INACTIVE", createdAt: "Sep 20, 2023" },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  
  // 🌟 ดึง searchQuery ที่ส่งมาจาก Layout (Header)
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  
  // State สำหรับฟอร์ม Edit
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // State สำหรับฟอร์ม Add New User
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addEmailError, setAddEmailError] = useState("");

  useEffect(() => {
    const savedUsers = localStorage.getItem("system_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem("system_users", JSON.stringify(initialUsers));
    }
  }, []);

  const saveUsersToLocal = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem("system_users", JSON.stringify(newUsers));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // ==========================================
  // 🌟 ฟังก์ชันกรองรายชื่อ (Search Filter)
  // ==========================================
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) || 
      user.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const handleConfirmAdd = () => {
    setAddEmailError("");
    if (!addName.trim() || !addEmail.trim()) {
      if (!addEmail.trim()) setAddEmailError("กรุณากรอกอีเมล");
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    if (!validateEmail(addEmail)) {
      setAddEmailError("รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)");
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: addName,
      email: addEmail,
      role: "CUSTOMER", 
      status: "INACTIVE", 
      createdAt: today, 
    };

    const updatedUsers = [...users, newUser];
    saveUsersToLocal(updatedUsers);
    
    setAddName("");
    setAddEmail("");
    setIsAddPanelOpen(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEmailError("");
  };

  const handleConfirmEdit = () => {
    if (!editingUser) return;

    if (!editEmail.trim()) {
      setEmailError("กรุณากรอกอีเมล");
      return;
    }
    
    if (!validateEmail(editEmail)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)");
      return;
    }

    const updatedUsers = users.map((u) => 
      u.id === editingUser.id ? { ...u, name: editName, email: editEmail } : u
    );
    
    saveUsersToLocal(updatedUsers); 
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((u) => u.id !== id);
      saveUsersToLocal(updatedUsers);
    }
  };

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
            { label: "Edit User", icon: <Edit size={16} />, onClick: () => handleEditClick(user) },
            { label: "Delete User", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeleteUser(user.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">System Users</h2>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => setIsAddPanelOpen(true)}
        >
          <Plus size={18} /> Add New User
        </Button>
      </div>

      {/* 🌟 ส่งข้อมูลที่ผ่านการกรองแล้ว (filteredUsers) ให้ Table แทน */}
      <Table data={filteredUsers} columns={columns} />

      <SidePanelEdit
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        title="Add New User"
        footer={
          <button 
            onClick={handleConfirmAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            <Plus size={18} />
            Create User
          </button>
        }
      >
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Customer Details</h4>
          <div className="space-y-4">
            <Input 
              label="Full Name"
              icon={<UserIcon size={18} />}
              type="text" 
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Enter full name"
              className="bg-slate-50 border-slate-200"
            />
            <Input 
              label="Email Address"
              icon={<Mail size={18} />}
              type="email" 
              value={addEmail}
              onChange={(e) => {
                setAddEmail(e.target.value);
                if (addEmailError) setAddEmailError(""); 
              }}
              placeholder="name@example.com"
              className="bg-slate-50 border-slate-200"
              error={addEmailError}
            />
            <div className="pt-2">
              <DetailItem icon={<Shield size={18} />} label="Assigned Role" value="CUSTOMER (Fixed)" />
            </div>
            <div>
              <DetailItem icon={<CheckCircle2 size={18} />} label="Initial Status" value="INACTIVE (Awaiting App Login)" />
            </div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        footer={
          <button 
            onClick={handleConfirmEdit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            <CheckCircle2 size={18} />
            Confirm Edit
          </button>
        }
      >
        {editingUser && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-100 mb-4 uppercase">
                {editingUser.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{editingUser.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{editingUser.email}</p>
              <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${
                editingUser.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {editingUser.status}
              </span>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Information</h4>
              <div className="space-y-4">
                <Input 
                  label="Full Name"
                  icon={<UserIcon size={18} />}
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                  className="bg-slate-50 border-slate-200"
                />
                <Input 
                  label="Email Address"
                  icon={<Mail size={18} />}
                  type="email" 
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="name@example.com"
                  className="bg-slate-50 border-slate-200"
                  error={emailError}
                />
                <div className="pt-2">
                  <DetailItem icon={<Shield size={18} />} label="Role" value={editingUser.role} />
                </div>
                <div>
                  <DetailItem icon={<Calendar size={18} />} label="Member Since" value={editingUser.createdAt} />
                </div>
              </div>
            </div>
          </>
        )}
      </SidePanelEdit>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="text-slate-400 mt-1">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}