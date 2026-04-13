import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addUser, updateUser, deleteUser } from "../redux/userSlice";
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, Calendar, CheckCircle2, User as UserIcon, Upload, Image as ImageIcon } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input"; 
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Status } from "../components/ui/Status"; 
import type { User, Column } from "../types";

export default function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState(""); 
  const [emailError, setEmailError] = useState("");

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addAvatarUrl, setAddAvatarUrl] = useState(""); 
  const [addEmailError, setAddEmailError] = useState("");

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // =====================================================================
  // 🌟 ฟังก์ชันจำลองการอัปโหลดรูปภาพ (รอเชื่อม Supabase)
  // =====================================================================
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrlState: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // -------------------------------------------------------------------
    // [TODO: CONNECT SUPABASE]
    // const { data, error } = await supabase.storage.from('avatars').upload(`usr_${Date.now()}`, file);
    // const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    // setUrlState(publicUrlData.publicUrl);
    // -------------------------------------------------------------------

    // 🌟 (Mock) สร้าง URL จำลอง
    const tempLocalUrl = URL.createObjectURL(file);
    setUrlState(tempLocalUrl);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter((user: User) => user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery));
  }, [users, searchQuery]);

  const handleConfirmAdd = () => {
    setAddEmailError("");
    if (!addName.trim() || !addEmail.trim()) {
      if (!addEmail.trim()) setAddEmailError("กรุณากรอกอีเมล");
      alert("กรุณากรอกข้อมูลให้ครบถ้วน"); return;
    }
    if (!validateEmail(addEmail)) { setAddEmailError("รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)"); return; }

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: addName,
      email: addEmail,
      role: "CUSTOMER", 
      status: "INACTIVE", 
      createdAt: today, 
      avatarUrl: addAvatarUrl.trim() 
    };

    dispatch(addUser(newUser));
    
    setAddName(""); setAddEmail(""); setAddAvatarUrl(""); setIsAddPanelOpen(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user); 
    setEditName(user.name); 
    setEditEmail(user.email); 
    setEditAvatarUrl(user.avatarUrl || ""); 
    setEmailError("");
  };

  const handleConfirmEdit = () => {
    if (!editingUser) return;
    if (!editEmail.trim()) { setEmailError("กรุณากรอกอีเมล"); return; }
    if (!validateEmail(editEmail)) { setEmailError("รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)"); return; }

    dispatch(updateUser({ ...editingUser, name: editName, email: editEmail, avatarUrl: editAvatarUrl.trim() }));
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) { dispatch(deleteUser(id)); }
  };

  const columns: Column<User>[] = [
    { header: "USER INFO", key: "name", render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden shrink-0 border border-indigo-200">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div><p className="font-medium text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>
        </div>
      )},
    { header: "ROLE", key: "role" },
    { header: "STATUS", key: "status", render: (user) => <Status status={user.status} /> },
    { header: "ACTIONS", key: "id", className: "text-right", render: (user) => (
        <Dropdown trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit User", icon: <Edit size={16} />, onClick: () => handleEditClick(user) },
            { label: "Delete User", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeleteUser(user.id) },
          ]}
        />
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">System Users</h2>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsAddPanelOpen(true)}><Plus size={18} /> Add New User</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <Table data={filteredUsers} columns={columns} />
      </div>

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title="Add New User"
        footer={<button onClick={handleConfirmAdd} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"><Plus size={18} /> Create User</button>}
      >
        <div className="space-y-6">
          {/* 🌟 อัปโหลดรูปโปรไฟล์ User */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-3 relative group">
              {addAvatarUrl ? <img src={addAvatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-slate-300" />}
              <label htmlFor="addAvatar" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Upload size={20} className="text-white" />
              </label>
              <input type="file" id="addAvatar" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, setAddAvatarUrl)} />
            </div>
            <p className="text-xs font-medium text-slate-500">Profile Picture</p>
            <p className="text-[10px] text-slate-400 mt-1">Click image to upload</p>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Customer Details</h4>
          <div className="space-y-4">
            <Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Enter full name" className="bg-slate-50 border-slate-200" />
            <Input label="Email Address" icon={<Mail size={18} />} type="email" value={addEmail} onChange={(e) => { setAddEmail(e.target.value); if (addEmailError) setAddEmailError(""); }} placeholder="name@example.com" className="bg-slate-50 border-slate-200" error={addEmailError} />
            
            <div className="pt-2"><DetailItem icon={<Shield size={18} />} label="Assigned Role" value="CUSTOMER (Fixed)" /></div>
            <div><DetailItem icon={<CheckCircle2 size={18} />} label="Initial Status" value="INACTIVE (Awaiting App Login)" /></div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User"
        footer={<button onClick={handleConfirmEdit} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"><CheckCircle2 size={18} /> Confirm Edit</button>}
      >
        {editingUser && (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              {/* 🌟 แก้ไขรูปโปรไฟล์ User */}
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-100 mb-4 uppercase overflow-hidden relative group">
                {editAvatarUrl ? <img src={editAvatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : editingUser.name.charAt(0)}
                <label htmlFor="editAvatar" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Edit size={24} className="text-white" />
                </label>
                <input type="file" id="editAvatar" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, setEditAvatarUrl)} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{editingUser.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{editingUser.email}</p>
              <div className="mt-4"><Status status={editingUser.status} /></div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Information</h4>
              <div className="space-y-4">
                <Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter full name" className="bg-slate-50 border-slate-200" />
                <Input label="Email Address" icon={<Mail size={18} />} type="email" value={editEmail} onChange={(e) => { setEditEmail(e.target.value); if (emailError) setEmailError(""); }} placeholder="name@example.com" className="bg-slate-50 border-slate-200" error={emailError} />
                
                <div className="pt-2"><DetailItem icon={<Shield size={18} />} label="Role" value={editingUser.role} /></div>
                <div><DetailItem icon={<Calendar size={18} />} label="Member Since" value={editingUser.createdAt} /></div>
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
      <div className="text-slate-400 mt-1">{icon}</div><div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p><p className="text-sm font-bold text-slate-700">{value}</p></div>
    </div>
  );
}