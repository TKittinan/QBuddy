import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { updateSettings } from "../redux/settingSlice";
import { Building2, ShieldCheck, Save, Phone, Mail, Clock, Hash } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { API_BASE_URL } from "../config";

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState(settings);

  useEffect(() => { setFormData(settings); }, [settings]);

  const handleSaveGeneral = async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!response.ok) throw new Error();
      
      dispatch(updateSettings(formData));
      alert("Settings saved successfully!");
    } catch (error) { alert("Error saving settings"); }
  };

  return (
    <div className="space-y-6 pt-10 px-8">
      <div><h2 className="text-2xl font-bold text-slate-800">System Settings</h2><p className="text-sm text-slate-500 mt-1">Configure your business rules and profile</p></div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${activeTab === "general" ? "bg-[#5AB2A8] text-white" : "text-slate-500 hover:bg-slate-200/50"}`}><Building2 size={18} /> General Info</button>
          <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${activeTab === "security" ? "bg-[#5AB2A8] text-white" : "text-slate-500 hover:bg-slate-200/50"}`}><ShieldCheck size={18} /> Security</button>
        </div>
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-3xl">
          {activeTab === "general" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Business Name" icon={<Building2 size={16}/>} value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                <Input label="Business Email" icon={<Mail size={16}/>} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <Input label="Contact Phone" icon={<Phone size={16}/>} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <Input label="Max Queues per Day" icon={<Hash size={16}/>} value={formData.maxQueuePerDay} onChange={(e) => setFormData({...formData, maxQueuePerDay: e.target.value})} />
                <Input label="Auto-cancel (Minutes)" icon={<Clock size={16}/>} value={formData.autoCancelMins} onChange={(e) => setFormData({...formData, autoCancelMins: e.target.value})} />
              </div>
              <Button onClick={handleSaveGeneral} className="bg-[#5AB2A8] text-white flex items-center gap-2 shadow-lg shadow-teal-100 mt-4"><Save size={18} /> Save All Changes</Button>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Security settings are managed by Central Auth Service</div>
          )}
        </div>
      </div>
    </div>
  );
}