import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSettings, updateSettingsAsync } from "../redux/Slice/settingSlice";
import { Building2, ShieldCheck, Save, Phone, Mail, Clock, Hash } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Settings() {
  const dispatch = useAppDispatch();
  //  ดึง settings และ loading จาก store
  //  1. ดึง State มาตรงๆ ไม่ใช้ Spread Operator (...) เพื่อป้องกันการสร้าง Object ใหม่
  const settingsState = useAppSelector((state) => state.settings);

  const [activeTab, setActiveTab] = useState("general");

  //  2. กำหนดค่าเริ่มต้นให้ formData
  const [formData, setFormData] = useState({
    businessName: settingsState.businessName || "",
    phone: settingsState.phone || "",
    email: settingsState.email || "",
    maxQueuePerDay: settingsState.maxQueuePerDay || 0,
    autoCancelMins: settingsState.autoCancelMins || 0,
  });

  //  3. อัปเดต formData เฉพาะเมื่อค่าข้างในเปลี่ยนจริงๆ (หยุด Infinite Loop)
  useEffect(() => {
    setFormData({
      businessName: settingsState.businessName,
      phone: settingsState.phone,
      email: settingsState.email,
      maxQueuePerDay: settingsState.maxQueuePerDay,
      autoCancelMins: settingsState.autoCancelMins,
    });
  }, [
    settingsState.businessName,
    settingsState.phone,
    settingsState.email,
    settingsState.maxQueuePerDay,
    settingsState.autoCancelMins
  ]);

  // 1. ดึงข้อมูลผ่าน Redux Thunk
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);
  // 2. บันทึกข้อมูลผ่าน Redux Thunk
  const handleSaveGeneral = async () => {
    try {
      // เรียกใช้ Thunk และรอผลลัพธ์ด้วย .unwrap()
      await dispatch(updateSettingsAsync(formData)).unwrap();
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(error || "Error saving settings");
    }
  };

  return (
    <div className="space-y-6 pt-10 px-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure your business rules and profile</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "general" ? "bg-[#5AB2A8] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Building2 size={18} /> General Info
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "security" ? "bg-[#5AB2A8] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <ShieldCheck size={18} /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-3xl">
          {activeTab === "general" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Business Name" icon={<Building2 size={16} />} value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                <Input label="Business Email" icon={<Mail size={16} />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <Input label="Contact Phone" icon={<Phone size={16} />} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <Input
                  label="Max Queues per Day"
                  icon={<Hash size={16} />}
                  type="number"
                  value={formData.maxQueuePerDay}
                  onChange={(e) => setFormData({ ...formData, maxQueuePerDay: Number(e.target.value) })}
                />
                <Input
                  label="Auto-cancel (Minutes)"
                  icon={<Clock size={16} />}
                  type="number"
                  value={formData.autoCancelMins}
                  onChange={(e) => setFormData({ ...formData, autoCancelMins: Number(e.target.value) })}
                />
              </div>

              <Button
                onClick={handleSaveGeneral}
                disabled={activeTab === "general"} // ✅ ปิดปุ่มระหว่างบันทึก
                className="bg-[#5AB2A8] text-white flex items-center gap-2 shadow-lg shadow-teal-100 mt-4 disabled:opacity-50"
              >
                <Save size={18} /> {activeTab === "general" ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Security settings are managed by Central Auth Service</div>
          )}
        </div>
      </div>
    </div>
  );
}