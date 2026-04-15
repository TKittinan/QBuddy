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
import { Status } from "../components/ui/StatusBadge"; 
import type { User, Column } from "../types";

// 🌟 นำเข้า useForm และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🌟 Schema ของ User
const userSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  avatarUrl: z.string().optional()
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  // 🌟 ติดตั้ง useForm
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", avatarUrl: "" },
    mode: "onChange"
  });

  const currentAvatarUrl = watch("avatarUrl");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempLocalUrl = URL.createObjectURL(file);
    // เซ็ตค่า URL ใส่ฟอร์มทันที
    setValue("avatarUrl", tempLocalUrl, { shouldValidate: true, shouldDirty: true });
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter((user: User) => user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery));
  }, [users, searchQuery]);

  const handleOpenAdd = () => {
    reset({ name: "", email: "", avatarUrl: "" });
    setIsAddPanelOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user); 
    reset({ name: user.name, email: user.email, avatarUrl: user.avatarUrl || "" });
  };

  const onSubmit = (data: UserFormData) => {
    if (isAddPanelOpen) {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: "CUSTOMER", 
        status: "INACTIVE", 
        createdAt: today, 
        avatarUrl: data.avatarUrl?.trim() 
      };
      dispatch(addUser(newUser));
      setIsAddPanelOpen(false);

    } else if (editingUser) {
      dispatch(updateUser({ ...editingUser, name: data.name, email: data.email, avatarUrl: data.avatarUrl?.trim() }));
      setEditingUser(null);
    }
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
        <Button variant="primary" className="flex items-center gap-2" onClick={handleOpenAdd}><Plus size={18} /> Add New User</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <Table data={filteredUsers} columns={columns} />
      </div>

      {/* 🌟 Panel (ใช้ร่วมกันทั้ง Add และ Edit) */}
      <SidePanelEdit isOpen={isAddPanelOpen || !!editingUser} onClose={() => { setIsAddPanelOpen(false); setEditingUser(null); }} title={editingUser ? "Edit User" : "Add New User"}
        footer={<button onClick={handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]">{editingUser ? <><CheckCircle2 size={18} /> Confirm Edit</> : <><Plus size={18} /> Create User</>}</button>}
      >
        <div className="space-y-6">
          
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`w-24 h-24 rounded-full ${editingUser ? 'bg-indigo-600 text-white font-bold text-4xl uppercase shadow-xl shadow-indigo-100' : 'bg-slate-100 border-2 border-dashed border-slate-300'} flex items-center justify-center overflow-hidden mb-3 relative group`}>
              {currentAvatarUrl 
                ? <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" /> 
                : (editingUser ? editingUser.name.charAt(0) : <ImageIcon size={32} className="text-slate-300" />)
              }
              <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {editingUser ? <Edit size={24} className="text-white" /> : <Upload size={20} className="text-white" />}
              </label>
              <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            {!editingUser && (
              <>
                <p className="text-xs font-medium text-slate-500">Profile Picture</p>
                <p className="text-[10px] text-slate-400 mt-1">Click image to upload</p>
              </>
            )}
            {editingUser && (
              <>
                <h3 className="text-2xl font-bold text-slate-800">{editingUser.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{editingUser.email}</p>
                <div className="mt-4"><Status status={editingUser.status} /></div>
              </>
            )}
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{editingUser ? "User Information" : "New Customer Details"}</h4>
          <div className="space-y-4">
            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <div><Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={value} onChange={onChange} placeholder="Enter full name" className={`bg-slate-50 border-slate-200 ${errors.name ? 'border-red-400' : ''}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
            )}/>
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <div><Input label="Email Address" icon={<Mail size={18} />} type="email" value={value} onChange={onChange} placeholder="name@example.com" className={`bg-slate-50 border-slate-200 ${errors.email ? 'border-red-400' : ''}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}</div>
            )}/>
            
            <div className="pt-2"><DetailItem icon={<Shield size={18} />} label={editingUser ? "Role" : "Assigned Role"} value={editingUser ? editingUser.role : "CUSTOMER (Fixed)"} /></div>
            <div><DetailItem icon={editingUser ? <Calendar size={18} /> : <CheckCircle2 size={18} />} label={editingUser ? "Member Since" : "Initial Status"} value={editingUser ? editingUser.createdAt : "INACTIVE (Awaiting App Login)"} /></div>
          </div>
        </div>
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