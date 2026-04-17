import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks"; 
import { fetchUsers, addUserAsync, deleteUserAsync } from "../redux/userSlice"; 
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, User as UserIcon, Phone, BrainCircuit } from "lucide-react"; 
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

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", phone: "", role: "CUSTOMER", password: "" }
  });

  useEffect(() => { 
    dispatch(fetchUsers()); 
  }, [dispatch]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        alert("Update feature coming soon with AsyncThunk!");
      } else {
        const payload = {
          ...data,
          password: data.password && data.password.trim() !== "" ? data.password : undefined
        };

        await dispatch(addUserAsync(payload)).unwrap();
        alert("เพิ่มผู้ใช้สำเร็จ!");
        
        dispatch(fetchUsers());
      }
      
      setIsPanelOpen(false);
      reset();
    } catch (error: any) { 
      alert(error || "เกิดข้อผิดพลาด หรืออีเมลนี้มีในระบบแล้ว"); 
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
    if(window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? ข้อมูลจะถูกลบถาวร")) {
      try {
        await dispatch(deleteUserAsync(id)).unwrap();
      } catch (error: any) {
        alert(error || "ลบผู้ใช้ไม่สำเร็จ");
      }
    }
  };

  const columns: Column<User>[] = [
    { 
      header: "User Profile", 
      key: "name", 
      className: "w-[30%] text-left",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <UserIcon size={20} className="text-slate-400"/>
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-slate-800 text-sm text-left">{row.name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 text-left">
              <span>{row.phone || "No Phone"}</span>
              {row.ai_consented && <BrainCircuit size={12} className="text-[#5AB2A8]" />}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Email", 
      key: "email", 
      className: "w-[25%] text-left",
      render: (row) => <span className="text-sm text-slate-600 block text-left">{row.email}</span> 
    },
    { 
      header: "Role", 
      key: "role", 
      className: "w-[15%] text-center",
      render: (row) => (
        <div className="flex justify-center"> {/* จัดให้อยู่ตรงกลางของคอลัมน์ */}
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-md text-slate-600">{row.role}</span>
        </div>
      ) 
    },
    { 
      header: "Status", 
      key: "status", 
      className: "w-[15%] text-center",
      render: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ) 
    },
    { 
      header: "Actions", 
      key: "actions", 
      className: "w-[15%] text-right pr-6",
      render: (row) => (
        <div className="flex justify-end"> {/* ดันปุ่มไปทางขวาสุด */}
          <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Edit User", icon: <Edit size={16} />, onClick: () => handleEdit(row) },
              { 
                label: "Delete", 
                icon: <Trash2 size={16} />, 
                className: "text-rose-600", 
                onClick: () => handleDelete(row.id) 
              }
            ]}
          />
        </div>
      )
    }
  ];

  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);
  const currentData = Array.isArray(users) ? users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">User Management</h2>
        <button 
          onClick={() => { setEditingUser(null); reset({ name: "", email: "", phone: "", role: "CUSTOMER", password: "" }); setIsPanelOpen(true); }} 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={16}/> Add User
        </button>
      </div>

      <Table data={currentData} columns={columns} emptyMessage={loading ? "Loading users..." : "No users found."} />
      
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
      )}

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editingUser ? "Edit Account" : "New Account"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller control={control} name="name" render={({ field }) => <Input label="Full Name" icon={<UserIcon size={16}/>} {...field} error={errors.name?.message} />} />
            <Controller control={control} name="email" render={({ field }) => <Input label="Email Address" icon={<Mail size={16}/>} {...field} error={errors.email?.message} />} />
            
            <Controller 
              control={control} 
              name="phone" 
              render={({ field: { onChange, value, ...field } }) => (
                <Input 
                  label="Phone Number" 
                  icon={<Phone size={16}/>} 
                  value={value}
                  maxLength={10}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    onChange(onlyNums);
                  }}
                  error={errors.phone?.message} 
                  {...field} 
                />
              )} 
            />
            
            <Controller control={control} name="role" render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</label>
                <select value={value} onChange={onChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]">
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            )} />

            <Controller control={control} name="password" render={({ field }) => (
               <Input 
                 label={editingUser ? "New Password (Leave blank to keep current)" : "Account Password"} 
                 type="password" 
                 icon={<Shield size={16}/>} 
                 {...field} 
                 error={errors.password?.message} 
               />
            )} />
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg mt-4 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Account"}
            </button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}