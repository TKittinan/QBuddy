import { useState } from "react";
import { 
  Building2, SlidersHorizontal, ShieldCheck, 
  Save, Phone, Mail, Clock, Lock
} from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/auth/use.Auth"; 

type Tab = "general" | "queue" | "security";

export default function Settings() {
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const [formData, setFormData] = useState({
    businessName: "QBuddy Co., Ltd.",
    phone: "02-123-4567",
    email: "admin@qbuddy.com",
    maxQueuePerDay: "500",
    autoCancelMins: "15",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePassChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    setPassError("");
    setPassSuccess("");
  };

  const handleSave = () => {
    if (activeTab === "security") {
      // ตรวจสอบความถูกต้องของรหัสผ่าน
      if (!passwords.current || !passwords.newPass || !passwords.confirm) {
        setPassError("Please fill in all password fields.");
        return;
      }
      if (passwords.newPass !== passwords.confirm) {
        setPassError("New passwords do not match.");
        return;
      }
      if (passwords.newPass.length < 6) {
        setPassError("New password must be at least 6 characters.");
        return;
      }

      // ดึงข้อมูลพนักงานจาก Local Storage
      const savedStaffs = JSON.parse(localStorage.getItem("system_staffs") || "[]");
      const currentUserData = savedStaffs.find((s: any) => s.email === user?.email);

      if (currentUserData && currentUserData.password === passwords.current) {
        const updatedStaffs = savedStaffs.map((s: any) => 
          s.email === user?.email ? { ...s, password: passwords.newPass } : s
        );
        localStorage.setItem("system_staffs", JSON.stringify(updatedStaffs));
        
        setPassSuccess("Password updated successfully!");
        setPasswords({ current: "", newPass: "", confirm: "" }); 
      } else {
        setPassError("Incorrect current password.");
      }
    } else {
      // บันทึกการตั้งค่าระบบลงใน Local Storage
      localStorage.setItem("system_settings", JSON.stringify(formData));
      alert("Settings saved successfully!");
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
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "general" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <Building2 size={18} /> General Info
          </button>
          <button onClick={() => setActiveTab("queue")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "queue" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <SlidersHorizontal size={18} /> Queue Rules
          </button>
          <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "security" ? "bg-[#5AB2A8] text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-200/50"}`}>
            <ShieldCheck size={18} /> Security & Access
          </button>
        </div>

        <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input label="Business Name" icon={<Building2 size={16} />} value={formData.businessName} onChange={(e) => handleChange("businessName", e.target.value)} className="bg-slate-50" />
                </div>
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
                  <Input 
                    label="Current Password" icon={<Lock size={16} />} type="password" placeholder="Enter current password" 
                    value={passwords.current} onChange={(e) => handlePassChange("current", e.target.value)} className="bg-slate-50" 
                  />
                </div>
                <Input 
                  label="New Password" icon={<Lock size={16} />} type="password" placeholder="Enter new password" 
                  value={passwords.newPass} onChange={(e) => handlePassChange("newPass", e.target.value)} className="bg-slate-50" 
                />
                <Input 
                  label="Confirm New Password" icon={<Lock size={16} />} type="password" placeholder="Confirm new password" 
                  value={passwords.confirm} onChange={(e) => handlePassChange("confirm", e.target.value)} className="bg-slate-50" 
                />
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-8 py-2.5 flex items-center gap-2 shadow-lg shadow-teal-100"
            >
              <Save size={18} /> Save Changes
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}