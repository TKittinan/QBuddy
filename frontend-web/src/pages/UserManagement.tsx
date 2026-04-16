import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { setUsers, addUser, updateUser, deleteUser } from "../redux/userSlice";
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Shield, User as UserIcon } from "lucide-react"; 
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

const API_BASE_URL = "http://localhost:5000/api";
const userSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
  password: z.string().min(6, "รหัสผ่านต้องมี 6 ตัวขึ้นไป").or(z.literal(""))
});

export default function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "CUSTOMER", password: "" }
  });

  const selectedRole = watch("role");

  const fetchUsersFromDB = async () => {
    try {
      /*
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      dispatch(setUsers(data));
      */
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsersFromDB(); }, []);

  const onSubmit = async (data: any) => {
    try {
      const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/users`;
      /*
      const response = await fetch(url, { method: editingUser ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (editingUser) dispatch(updateUser(result));
      else dispatch(addUser(result));
      */
      setIsPanelOpen(false);
      reset();
    } catch (error) { alert("Error"); }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({ name: user.name, email: user.email, role: user.role, password: "" });
    setIsPanelOpen(true);

  const columns: Column<User>[] = [
    { header: "User Profile", key: "name", render: (row) => (<div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><UserIcon size={20} className="text-slate-400"/></div><div><p className="font-bold text-slate-800">{row.name}</p><p className="text-xs text-slate-400">{row.email}</p></div></div>) },
    { header: "Role", key: "role", render: (row) => <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md">{row.role}</span> },
    { header: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", key: "actions", className: "text-right", render: (row) => (
      <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={18} /></button>}
        items={[
          { label: "Edit User", icon: <Edit size={16} />, onClick: () => handleEdit(row) },
          { label: "Delete", icon: <Trash2 size={16} />, className: "text-rose-600", onClick: () => dispatch(deleteUser(row.id)) }
        ]}
      />
    )}
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">User Management</h2>
        <button onClick={() => { setEditingUser(null); reset(); setIsPanelOpen(true); }} className="bg-[#5AB2A8] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> Add User</button>
      </div>

      <Table data={users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} columns={columns} emptyMessage="No users found." />
      <Pagination currentPage={currentPage} totalPages={Math.ceil(users.length / itemsPerPage)} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="Account Settings">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller control={control} name="name" render={({ field }) => <Input label="Full Name" icon={<UserIcon size={16}/>} {...field} error={errors.name?.message} />} />
            <Controller control={control} name="email" render={({ field }) => <Input label="Email Address" icon={<Mail size={16}/>} {...field} error={errors.email?.message} />} />
            <Controller control={control} name="role" render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                <select value={value} onChange={onChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]">
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            )} />
            {(selectedRole === "ADMIN" || selectedRole === "STAFF") && (
              <Controller control={control} name="password" render={({ field }) => <Input label="Account Password" type="password" icon={<Shield size={16}/>} {...field} error={errors.password?.message} />} />
            )}
            <button type="submit" className="w-full py-3.5 bg-[#5AB2A8] text-white font-bold rounded-xl shadow-lg mt-4">Save Account</button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}