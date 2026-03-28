import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom"; 
import { 
  Plus, MoreHorizontal, Edit, Trash2, 
  Mail, Shield, Calendar, User as UserIcon, ChevronDown, CheckCircle2
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input"; 
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Pagination } from "../components/ui/Pagination";
import { Status } from "../components/ui/Status"; // นำเข้า Component Status
import type { User, Column } from "../types";

// ข้อมูลเริ่มต้นพร้อมรหัสผ่านสำหรับการทดสอบ
const initialStaffs: User[] = [
  { 
    id: "admin_1", 
    name: "admin1", 
    email: "admin1@qbuddy.com", 
    password: "admin123", 
    role: "ADMIN", 
    status: "OFFLINE", 
    createdAt: "Oct 01, 2023" 
  },
  { 
    id: "staff_1", 
    name: "staff1", 
    email: "staff1@qbuddy.com", 
    password: "staff123", 
    role: "STAFF", 
    status: "ONLINE", 
    createdAt: "Sep 20, 2023" 
  },
];

export default function StaffManagement() {
  const [staffs, setStaffs] = useState<User[]>([]);
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [emailError, setEmailError] = useState("");

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [addEmailError, setAddEmailError] = useState("");

  useEffect(() => {
    const savedStaffs = localStorage.getItem("system_staffs");
    if (savedStaffs && savedStaffs !== "[]") {
      setStaffs(JSON.parse(savedStaffs));
    } else {
      setStaffs(initialStaffs);
      localStorage.setItem("system_staffs", JSON.stringify(initialStaffs));
    }
  }, []);

  const saveStaffsToLocal = (newStaffs: User[]) => {
    setStaffs(newStaffs);
    localStorage.setItem("system_staffs", JSON.stringify(newStaffs));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const filteredStaffs = useMemo(() => {
    let result = [...staffs];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) || 
        user.email.toLowerCase().includes(lowerQuery)
      );
    }
    result.sort((a, b) => b.id.localeCompare(a.id));
    return result;
  }, [staffs, searchQuery]);

  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedData = filteredStaffs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, staffs.length]);

  const handleConfirmAdd = () => {
    setAddEmailError("");
    if (!addName.trim() || !addEmail.trim()) {
      if (!addEmail.trim()) setAddEmailError("กรุณากรอกอีเมล");
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!validateEmail(addEmail)) {
      setAddEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newStaff: User = {
      id: `staff_${Date.now()}`,
      name: addName,
      email: addEmail,
      password: "password123", 
      role: addRole, 
      status: "UNVERIFIED", 
      createdAt: today, 
    };

    saveStaffsToLocal([...staffs, newStaff]);
    setAddName(""); setAddEmail(""); setAddRole("STAFF"); setIsAddPanelOpen(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role as "ADMIN" | "STAFF");
    setEmailError("");
  };

  const handleConfirmEdit = () => {
    if (!editingUser) return;
    if (!editEmail.trim()) { setEmailError("กรุณากรอกอีเมล"); return; }
    if (!validateEmail(editEmail)) { setEmailError("รูปแบบอีเมลไม่ถูกต้อง"); return; }

    const updatedStaffs = staffs.map((u) => 
      u.id === editingUser.id ? { ...u, name: editName, email: editEmail, role: editRole } : u
    );
    saveStaffsToLocal(updatedStaffs); 
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      saveStaffsToLocal(staffs.filter((u) => u.id !== id));
    }
  };

  const columns: Column<User>[] = [
    {
      header: "STAFF INFO",
      key: "name",
      className: "w-[40%] text-left",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase ${
            user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    { 
      header: "ROLE", 
      key: "role",
      className: "w-[20%] text-left",
      render: (user) => (
        <span className={`px-2 py-1 rounded border text-[10px] font-bold ${
          user.role === 'ADMIN' ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      header: "STATUS",
      key: "status",
      className: "w-[20%] text-center",
      render: (user) => (
        <div className="flex justify-center">
          <Status status={user.status} />
        </div>
      ),
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right w-[20%]",
      render: (user) => (
        <Dropdown 
          align="right"
          trigger={
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          }
          items={[
            { label: "Edit Staff", icon: <Edit size={16} />, onClick: () => handleEditClick(user) },
            { label: "Delete", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeleteUser(user.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">System Staffs & Admins</h2>
        <Button 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center gap-2"
          onClick={() => setIsAddPanelOpen(true)}
        >
          <Plus size={18} /> Add New Staff
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <Table data={paginatedData} columns={columns} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredStaffs.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
      </div>

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title="Add New Staff"
        footer={
          <button onClick={handleConfirmAdd} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5AB2A8] rounded-2xl text-sm font-bold text-white hover:bg-[#4a968d] transition-all shadow-lg shadow-teal-100 active:scale-[0.98]">
            <Plus size={18} /> Create Account
          </button>
        }
      >
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</h4>
          <div className="space-y-4">
            <Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Enter full name" className="bg-slate-50 border-slate-200" />
            <Input label="Email Address" icon={<Mail size={18} />} type="email" value={addEmail} onChange={(e) => { setAddEmail(e.target.value); if (addEmailError) setAddEmailError(""); }} placeholder="name@qbuddy.com" className="bg-slate-50 border-slate-200" error={addEmailError} />
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Role</label>
              <Dropdown align="left"
                trigger={
                  <Button variant="outline" className="w-full bg-slate-50 border border-slate-200 justify-between text-slate-700 py-3">
                    <div className="flex items-center gap-2"><Shield size={16} className="text-slate-400"/> {addRole}</div>
                    <ChevronDown size={14} className="text-slate-400"/>
                  </Button>
                }
                items={[ { label: "STAFF (Limited Access)", onClick: () => setAddRole("STAFF") }, { label: "ADMIN (Full Access)", onClick: () => setAddRole("ADMIN") } ]}
              />
            </div>
            <div className="pt-2">
              <DetailItem icon={<Shield size={18} />} label="Initial Status" value="UNVERIFIED (Awaiting First Login)" />
            </div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit Staff"
        footer={
          <button onClick={handleConfirmEdit} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5AB2A8] rounded-2xl text-sm font-bold text-white hover:bg-[#4a968d] transition-all shadow-lg shadow-teal-100 active:scale-[0.98]">
            <CheckCircle2 size={18} /> Update Details
          </button>
        }
      >
        {editingUser && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-4 uppercase ${editingUser.role === 'ADMIN' ? 'bg-rose-500 shadow-rose-100' : 'bg-indigo-500 shadow-indigo-100'}`}>
                {editingUser.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{editingUser.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{editingUser.email}</p>
              
              <div className="mt-4">
                <Status status={editingUser.status} />
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Information</h4>
              <div className="space-y-4">
                <Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-50 border-slate-200" />
                <Input label="Email Address" icon={<Mail size={18} />} type="email" value={editEmail} onChange={(e) => { setEditEmail(e.target.value); if (emailError) setEmailError(""); }} className="bg-slate-50 border-slate-200" error={emailError} />
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Update Role</label>
                  <Dropdown align="left"
                    trigger={
                      <Button variant="outline" className="w-full bg-slate-50 border border-slate-200 justify-between text-slate-700 py-3">
                        <div className="flex items-center gap-2"><Shield size={16} className="text-slate-400"/> {editRole}</div>
                        <ChevronDown size={14} className="text-slate-400"/>
                      </Button>
                    }
                    items={[ { label: "STAFF", onClick: () => setEditRole("STAFF") }, { label: "ADMIN", onClick: () => setEditRole("ADMIN") } ]}
                  />
                </div>
                <div className="pt-2">
                  <DetailItem icon={<Calendar size={18} />} label="Account Created" value={editingUser.createdAt} />
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