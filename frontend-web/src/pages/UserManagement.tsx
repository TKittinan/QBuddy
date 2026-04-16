import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addUser, updateUser, deleteUser } from "../redux/userSlice";
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, CheckCircle2, User as UserIcon, Filter, ChevronDown } from "lucide-react"; 
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
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
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
  password: z.string().optional()
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "CUSTOMER", password: "" }
  });

  const selectedRole = watch("role");

  const fetchUsersFromDB = async () => {
    try {
      console.log("Fetching real-time users from DB...");
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsersFromDB();
    const intervalId = setInterval(fetchUsersFromDB, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (roleFilter !== "ALL") result = result.filter(u => u.role === roleFilter);
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower));
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [users, roleFilter, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNew = () => {
    setEditingUser(null);
    reset({ name: "", email: "", role: "CUSTOMER", password: "" });
    setIsPanelOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({ name: user.name, email: user.email, role: user.role, password: user.password || "" });
    setIsPanelOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      dispatch(updateUser({ ...editingUser, ...data }));
    } else {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password,
        status: "ACTIVE",
        createdAt: new Date().toISOString()
      };
      dispatch(addUser(newUser));
    }
    setIsPanelOpen(false);
  };

  useEffect(() => { setCurrentPage(1); }, [roleFilter, searchQuery]);

  const columns: Column<User>[] = [
    {
      header: "User Profile",
      key: "profile",
      className: "w-[35%]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
             <UserIcon size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      key: "role",
      className: "w-[20%]",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
          row.role === "ADMIN" ? "bg-rose-50 text-rose-600" : 
          row.role === "STAFF" ? "bg-indigo-50 text-indigo-600" : 
          "bg-slate-100 text-slate-600"
        }`}>
          {row.role}
        </span>
      )
    },
    { header: "Status", key: "status", className: "w-[25%]", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      key: "actions",
      className: "text-right w-[20%]",
      render: (row) => (
        <Dropdown 
          align="right"
          trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Edit Account", icon: <Edit size={16} />, onClick: () => handleEdit(row) },
            { divider: true, label: "" },
            { label: "Delete Account", icon: <Trash2 size={16} />, className: "text-rose-600", onClick: () => dispatch(deleteUser(row.id)) }
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      
      {/* 🌟 Top Bar: Filter ซ้าย | ปุ่ม Add ขวา */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Role: {roleFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[
              { label: "ALL", onClick: () => setRoleFilter("ALL") },
              { label: "ADMIN", onClick: () => setRoleFilter("ADMIN") },
              { label: "STAFF", onClick: () => setRoleFilter("STAFF") },
              { label: "CUSTOMER", onClick: () => setRoleFilter("CUSTOMER") }
            ]}
          />
        </div>

        <div className="flex items-center">
          <button onClick={handleAddNew} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg shadow-teal-100 flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <Table data={currentData} columns={columns} emptyMessage="No users found." />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingUser ? "Edit User" : "Add New User"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller control={control} name="role" render={({ field: { onChange, value } }) => (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Access Role</label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  {(["CUSTOMER", "STAFF", "ADMIN"] as const).map(role => (
                    <button key={role} type="button" onClick={() => onChange(role)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${value === role ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>{role}</button>
                  ))}
                </div>
              </div>
            )}/>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={value} onChange={onChange} placeholder="Enter full name" className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]`} />
                </div>
              )}/>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={value} onChange={onChange} placeholder="name@example.com" className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]`} />
                </div>
              )}/>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {(selectedRole === "ADMIN" || selectedRole === "STAFF") && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Account Password</label>
                <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                  <div className="relative">
                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={value} onChange={onChange} placeholder="Required for Staff/Admin" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" />
                  </div>
                )}/>
              </div>
            )}

            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <button type="submit" className="w-full flex flex-row items-center justify-center gap-2 py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98] whitespace-nowrap">
                <CheckCircle2 size={20} />
                <span>Save Account</span>
              </button>
            </div>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}