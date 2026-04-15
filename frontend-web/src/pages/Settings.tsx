import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { updateSettings } from "../redux/settingSlice";
import { updateStaff } from "../redux/staffSlice";
import { Building2, SlidersHorizontal, ShieldCheck, Save, Phone, Mail, Clock, Lock } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/auth/use.Auth"; 

// 🌟 นำเข้า useForm และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🌟 Schema สำหรับเช็คการเปลี่ยนรหัสผ่านโดยเฉพาะ (ตรวจ 2 ช่องให้ตรงกัน)
const securitySchema = z.object({
  current: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  newPass: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirm: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่")
}).superRefine((data, ctx) => {
  if (data.newPass !== data.confirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "รหัสผ่านไม่ตรงกัน",
      path: ["confirm"]
    });
  }
});

type SecurityFormData = z.infer<typeof securitySchema>;
type Tab = "general" | "queue" | "security";

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useAuth(); 
  const settings = useSelector((state: RootState) => state.settings);
  const staffs = useSelector((state: RootState) => state.staffs.staffs);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [formData, setFormData] = useState(settings);

  // 🌟 ติดตั้ง Form สำหรับ Security
  const secForm = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: { current: "", newPass: "", confirm: "" },
    mode: "onChange"
  });

  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveGeneral = () => {
    dispatch(updateSettings(formData));
    alert("Settings saved successfully!");
  };

  const handleSaveSecurity = (data: SecurityFormData) => {
    setPassError(""); setPassSuccess("");
    const currentUserData = staffs.find((s: any) => s.email === user?.email);

    if (currentUserData && currentUserData.password === data.current) {
      dispatch(updateStaff({ ...currentUserData, password: data.newPass }));
      setPassSuccess("Password updated successfully!");
      secForm.reset(); 
    } else {
      setPassError("Incorrect current password.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your system configurations and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "general" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}><Building2 size={18} /> General Info</button>
          <button onClick={() => setActiveTab("queue")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "queue" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}><SlidersHorizontal size={18} /> Queue Rules</button>
          <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "security" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}><ShieldCheck size={18} /> Security & Access</button>
        </div>

        <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Input label="Business Name" icon={<Building2 size={16} />} value={formData.businessName} onChange={(e) => handleChange("businessName", e.target.value)} className="bg-slate-50" /></div>
                <Input label="Contact Phone" icon={<Phone size={16} />} value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="bg-slate-50" />
                <Input label="System Email" icon={<Mail size={16} />} type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="bg-slate-50" />
              </div>
            </div>
          )}

          {activeTab === "queue" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">Queue & Booking Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Max Tickets Per Day" type="number" value={formData.maxQueuePerDay} onChange={(e) => handleChange("maxQueuePerDay", e.target.value)} className="bg-slate-50" />
                <Input label="Auto-Cancel Wait Time (Mins)" icon={<Clock size={16} />} type="number" value={formData.autoCancelMins} onChange={(e) => handleChange("autoCancelMins", e.target.value)} className="bg-slate-50" />
              </div>
              <p className="text-xs text-slate-400 mt-2">* If a customer does not show up within the auto-cancel time, their ticket will be marked as Cancelled.</p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">Change Password</h3>
              {passError && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">{passError}</div>}
              {passSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm font-medium">{passSuccess}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Controller control={secForm.control} name="current" render={({ field: { onChange, value } }) => (
                    <div><Input label="Current Password" icon={<Lock size={16} />} type="password" placeholder="Enter current password" value={value} onChange={onChange} className={`bg-slate-50 ${secForm.formState.errors.current ? 'border-red-400' : ''}`} />
                    {secForm.formState.errors.current && <p className="text-xs text-red-500 mt-1">{secForm.formState.errors.current.message}</p>}</div>
                  )}/>
                </div>
                <Controller control={secForm.control} name="newPass" render={({ field: { onChange, value } }) => (
                  <div><Input label="New Password" icon={<Lock size={16} />} type="password" placeholder="Enter new password" value={value} onChange={onChange} className={`bg-slate-50 ${secForm.formState.errors.newPass ? 'border-red-400' : ''}`} />
                  {secForm.formState.errors.newPass && <p className="text-xs text-red-500 mt-1">{secForm.formState.errors.newPass.message}</p>}</div>
                )}/>
                <Controller control={secForm.control} name="confirm" render={({ field: { onChange, value } }) => (
                  <div><Input label="Confirm New Password" icon={<Lock size={16} />} type="password" placeholder="Confirm new password" value={value} onChange={onChange} className={`bg-slate-50 ${secForm.formState.errors.confirm ? 'border-red-400' : ''}`} />
                  {secForm.formState.errors.confirm && <p className="text-xs text-red-500 mt-1">{secForm.formState.errors.confirm.message}</p>}</div>
                )}/>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t flex justify-end">
            <Button onClick={activeTab === "security" ? secForm.handleSubmit(handleSaveSecurity) : handleSaveGeneral} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-8 py-2.5 flex items-center gap-2 shadow-lg shadow-teal-100">
              <Save size={18} /> {activeTab === "security" ? "Update Password" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}