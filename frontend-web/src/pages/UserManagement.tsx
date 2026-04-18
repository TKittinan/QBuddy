import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks"; 
import { fetchUsers, addUserAsync, deleteUserAsync, updateUserAsync } from "../redux/Slice/userSlice"; 
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, User as UserIcon, Phone, BrainCircuit, Filter, ChevronDown } from "lucide-react"; 
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { User, Column } from "../types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const userSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().max(10, "เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก").optional(),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]), 
  password: z.string().optional()
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", phone: "", role: "CUSTOMER", password: "" }
  });

  useEffect(() => { 
    dispatch(fetchUsers()); 
  }, [dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      const payload = {
        ...data,
        password: data.password && data.password.trim() !== "" ? data.password : undefined
      };

      if (editingUser) {
        await dispatch(updateUserAsync({ ...editingUser, ...payload })).unwrap();
        alert("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
      } else {
        await dispatch(addUserAsync(payload)).unwrap();
        alert("เพิ่มผู้ใช้สำเร็จ!");
      }
      
      dispatch(fetchUsers()); 
      setIsPanelOpen(false);
      reset();
    } catch (error: any) { 
      alert(error || "เกิดข้อผิดพลาด"); 
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone || "",
      role: user.role as "ADMIN" | "STAFF" | "CUSTOMER", 
      password: "" 
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
      try {
        await dispatch(deleteUserAsync(id)).unwrap();
      } catch (error: any) {
        alert(error || "ลบผู้ใช้ไม่สำเร็จ");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const columns: Column<User>[] = [
    { 
      header: "User Profile", 
      key: "name", 
      className: "w-[30%] text-left",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            <UserIcon size={18} className="text-slate-400"/>
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-slate-800 text-sm">{row.name}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{row.phone || "No Phone"}</span>
              {row.ai_consented && <BrainCircuit size={10} className="text-[#5AB2A8]" />}
            </div>
          </div>
        </div>
      )
    },
    { header: "Email", key: "email", className: "w-[25%] text-left", render: (row) => <span className="text-sm text-slate-500">{row.email}</span> },
    { header: "Role", key: "role", className: "w-[15%] text-center", render: (row) => <div className="flex justify-center"><span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 bg-slate-50 rounded text-slate-400 border border-slate-100">{row.role}</span></div> },
    { header: "Status", key: "status", className: "w-[15%] text-center", render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div> },
    { header: "Actions", key: "actions", className: "w-[15%] text-right pr-6", render: (row) => (
      <div className="flex justify-end">
        <Dropdown align="right" trigger={<button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit User", icon: <Edit size={14} />, onClick: () => handleEdit(row) },
            { label: "Delete", icon: <Trash2 size={14} />, className: "text-rose-500", onClick: () => handleDelete(row.id) }
          ]}
        />
      </div>
    )}
  ];

  const currentData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 lg:p-10 max-w-[1600px] mx-auto w-full pt-12">
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Shield size={15} />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none hover:border-[#5AB2A8] focus:ring-4 focus:ring-teal-50 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter size={15} />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none hover:border-[#5AB2A8] focus:ring-4 focus:ring-teal-50 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <button 
          onClick={() => { setEditingUser(null); reset({ name: "", email: "", phone: "", role: "CUSTOMER", password: "" }); setIsPanelOpen(true); }} 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-7 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} strokeWidth={3}/> Add User
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table data={currentData} columns={columns} emptyMessage={loading ? "Loading..." : "No users found."} />
      </div>
      
      {filteredUsers.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredUsers.length / itemsPerPage)} onChange={setCurrentPage} />
        </div>
      )}

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingUser ? "Update Account" : "Create Account"}>
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller control={control} name="name" render={({ field }) => <Input label="Full Name" icon={<UserIcon size={16}/>} {...field} error={errors.name?.message} />} />
            <Controller control={control} name="email" render={({ field }) => <Input label="Email Address" icon={<Mail size={16}/>} {...field} error={errors.email?.message} />} />
            <Controller 
              control={control} 
              name="phone" 
              render={({ field: { onChange, value, ...field } }) => (
                <Input 
                  label="Phone" icon={<Phone size={16}/>} value={value} maxLength={10}
                  onChange={(e: any) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
                  error={errors.phone?.message} {...field} 
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="role" 
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">System Role</label>
                  <div className="relative">
                    <select 
                      {...field} 
                      className="appearance-none w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#5AB2A8] transition-all cursor-pointer"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              )} 
            />

            <Controller control={control} name="password" render={({ field }) => <Input label="Password" type="password" icon={<Shield size={16}/>} {...field} error={errors.password?.message} />} />
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-black rounded-2xl shadow-lg mt-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
              {loading ? "Processing..." : "Save Account"}
            </button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}