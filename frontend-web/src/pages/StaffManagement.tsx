import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addStaff, updateStaff, deleteStaff } from "../redux/staffSlice";
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, Calendar, User as UserIcon, CheckCircle2, Lock } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input"; 
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { Pagination } from "../components/ui/Pagination";
import { Status } from "../components/ui/StatusBadge"; 
import type { User, Column } from "../types";
import { useAuth } from "../context/auth/use.Auth"; 

// 🌟 นำเข้า useForm และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🌟 Schema สำหรับเพิ่มพนักงาน (บังคับรหัสผ่าน)
const addStaffSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  role: z.enum(["ADMIN", "STAFF"])
});

// 🌟 Schema สำหรับแก้ไข (ไม่มีรหัสผ่าน)
const editStaffSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  role: z.enum(["ADMIN", "STAFF"])
});

type AddStaffFormData = z.infer<typeof addStaffSchema>;
type EditStaffFormData = z.infer<typeof editStaffSchema>;

export default function StaffManagement() {
  const dispatch = useDispatch();
  const staffs = useSelector((state: RootState) => state.staffs.staffs);

  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { user: currentUser, login, token } = useAuth(); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  // 🌟 Form สำหรับ Add
  const addForm = useForm<AddStaffFormData>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: { name: "", email: "", password: "", role: "STAFF" },
    mode: "onChange"
  });

  // 🌟 Form สำหรับ Edit
  const editForm = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: { name: "", email: "", role: "STAFF" },
    mode: "onChange"
  });

  const filteredStaffs = useMemo(() => {
    let result = [...staffs];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(user => user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery));
    }
    result.sort((a, b) => b.id.localeCompare(a.id));
    return result;
  }, [staffs, searchQuery]);

  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedData = filteredStaffs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    addForm.reset();
    setIsAddPanelOpen(true);
  };

  const onAddSubmit = (data: AddStaffFormData) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newStaff: User = {
      id: `staff_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role, 
      status: "UNVERIFIED", 
      createdAt: today, 
    };

    dispatch(addStaff(newStaff));
    addForm.reset();
    setIsAddPanelOpen(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user); 
    editForm.reset({ name: user.name, email: user.email, role: user.role as "ADMIN" | "STAFF" });
  };

  const onEditSubmit = (data: EditStaffFormData) => {
    if (!editingUser) return;
    dispatch(updateStaff({ ...editingUser, name: data.name, email: data.email, role: data.role }));

    if (currentUser && currentUser.id === editingUser.id) {
        login({ id: currentUser.id, name: data.name, email: data.email, role: data.role }, token || "");
    }
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) { dispatch(deleteStaff(id)); }
  };

  const columns: Column<User>[] = [
    { header: "STAFF INFO", key: "name", className: "w-[40%] text-left", render: (user) => (
        <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>{user.name.charAt(0)}</div><div><p className="font-medium text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div></div>
      )},
    { header: "ROLE", key: "role", className: "w-[20%] text-left", render: (user) => (
        <span className={`px-2 py-1 rounded border text-[10px] font-bold ${user.role === 'ADMIN' ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50'}`}>{user.role}</span>
      )},
    { header: "STATUS", key: "status", className: "w-[20%] text-center", render: (user) => <div className="flex justify-center"><Status status={user.status} /></div> },
    { header: "ACTIONS", key: "id", className: "text-right w-[20%]", render: (user) => (
        <Dropdown align="right" trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit Staff", icon: <Edit size={16} />, onClick: () => handleEditClick(user) },
            { label: "Delete", icon: <Trash2 size={16} />, className: "text-red-600", divider: true, onClick: () => handleDeleteUser(user.id) },
          ]}
        />
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">System Staffs & Admins</h2>
        <Button className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center gap-2" onClick={handleOpenAdd}><Plus size={18} /> Add New Staff</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <Table data={paginatedData} columns={columns} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredStaffs.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
      </div>

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title="Add New Staff"
        footer={<button onClick={addForm.handleSubmit(onAddSubmit)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5AB2A8] rounded-2xl text-sm font-bold text-white hover:bg-[#4a968d] transition-all shadow-lg shadow-teal-100 active:scale-[0.98]"><Plus size={18} /> Create Account</button>}
      >
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</h4>
          <div className="space-y-4">
            <Controller control={addForm.control} name="name" render={({ field: { onChange, value } }) => (
              <div><Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={value} onChange={onChange} placeholder="Enter full name" className={`bg-slate-50 border-slate-200 ${addForm.formState.errors.name ? 'border-red-400' : ''}`} />
              {addForm.formState.errors.name && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.name.message}</p>}</div>
            )}/>
            <Controller control={addForm.control} name="email" render={({ field: { onChange, value } }) => (
              <div><Input label="Email Address" icon={<Mail size={18} />} type="email" value={value} onChange={onChange} placeholder="name@qbuddy.com" className={`bg-slate-50 border-slate-200 ${addForm.formState.errors.email ? 'border-red-400' : ''}`} />
              {addForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.email.message}</p>}</div>
            )}/>
            <Controller control={addForm.control} name="password" render={({ field: { onChange, value } }) => (
              <div><Input label="Password" icon={<Lock size={18} />} type="password" value={value} onChange={onChange} placeholder="Min. 6 characters" className={`bg-slate-50 border-slate-200 ${addForm.formState.errors.password ? 'border-red-400' : ''}`} />
              {addForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.password.message}</p>}</div>
            )}/>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Role</label>
              <Controller control={addForm.control} name="role" render={({ field: { onChange, value } }) => (
                <div className="flex gap-3">
                  <button type="button" onClick={() => onChange("STAFF")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl border transition-all ${value === "STAFF" ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`}><Shield size={20} className="mb-1" /><span className="text-xs font-bold">STAFF</span></button>
                  <button type="button" onClick={() => onChange("ADMIN")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl border transition-all ${value === "ADMIN" ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`}><Shield size={20} className="mb-1" /><span className="text-xs font-bold">ADMIN</span></button>
                </div>
              )}/>
            </div>
            <div className="pt-2"><DetailItem icon={<Shield size={18} />} label="Initial Status" value="UNVERIFIED (Awaiting First Login)" /></div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit Staff"
        footer={<button onClick={editForm.handleSubmit(onEditSubmit)} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5AB2A8] rounded-2xl text-sm font-bold text-white hover:bg-[#4a968d] transition-all shadow-lg shadow-teal-100 active:scale-[0.98]"><CheckCircle2 size={18} /> Update Details</button>}
      >
        {editingUser && (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-4 uppercase ${editingUser.role === 'ADMIN' ? 'bg-rose-500 shadow-rose-100' : 'bg-indigo-500 shadow-indigo-100'}`}>{editingUser.name.charAt(0)}</div>
              <h3 className="text-2xl font-bold text-slate-800">{editingUser.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{editingUser.email}</p>
              <div className="mt-4"><Status status={editingUser.status} /></div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Information</h4>
              <div className="space-y-4">
                <Controller control={editForm.control} name="name" render={({ field: { onChange, value } }) => (
                  <div><Input label="Full Name" icon={<UserIcon size={18} />} type="text" value={value} onChange={onChange} className={`bg-slate-50 border-slate-200 ${editForm.formState.errors.name ? 'border-red-400' : ''}`} />
                  {editForm.formState.errors.name && <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.name.message}</p>}</div>
                )}/>
                <Controller control={editForm.control} name="email" render={({ field: { onChange, value } }) => (
                  <div><Input label="Email Address" icon={<Mail size={18} />} type="email" value={value} onChange={onChange} className={`bg-slate-50 border-slate-200 ${editForm.formState.errors.email ? 'border-red-400' : ''}`} />
                  {editForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{editForm.formState.errors.email.message}</p>}</div>
                )}/>
                
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Update Role</label>
                  <Controller control={editForm.control} name="role" render={({ field: { onChange, value } }) => (
                    <div className="flex gap-3">
                      <button type="button" onClick={() => onChange("STAFF")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl border transition-all ${value === "STAFF" ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`}><Shield size={20} className="mb-1" /><span className="text-xs font-bold">STAFF</span></button>
                      <button type="button" onClick={() => onChange("ADMIN")} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl border transition-all ${value === "ADMIN" ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`}><Shield size={20} className="mb-1" /><span className="text-xs font-bold">ADMIN</span></button>
                    </div>
                  )}/>
                </div>

                <div className="pt-2"><DetailItem icon={<Calendar size={18} />} label="Account Created" value={editingUser.createdAt} /></div>
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