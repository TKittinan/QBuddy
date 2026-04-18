import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchSettings, updateSettingsAsync } from "../redux/Slice/settingSlice";
import { Building2, Save, Phone, Mail, Lock, AlertCircle } from "lucide-react"; 
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Settings() {
  const dispatch = useAppDispatch();
  const settingsState = useAppSelector((state) => state.settings);
  const { user } = useAppSelector((state) => state.auth); 
  const isAdmin = user?.role === 'ADMIN';

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: settingsState.businessName || "",
    phone: settingsState.phone || "",
    email: settingsState.email || "",
  });

  useEffect(() => {
    setFormData({
      businessName: settingsState.businessName || "",
      phone: settingsState.phone || "",
      email: settingsState.email || "",
    });
  }, [settingsState]);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // 🔥 ฟังก์ชันจัดฟอร์แมตเบอร์โทรแบบบังคับ 02 และใส่ขีด
  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/\D/g, "");

    if (numbers.length > 0 && numbers[0] !== '0') numbers = "";
    if (numbers.length > 1 && numbers[1] !== '2') numbers = "0";

    const limited = numbers.substring(0, 9);

    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    return `${limited.slice(0, 2)}-${limited.slice(2, 5)}-${limited.slice(5)}`;
  };

  const handleSaveGeneral = async () => {
    if (!isAdmin) return;
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      return;
    }

    if (!formData.phone.startsWith("02-") || formData.phone.length !== 11) {
      setError("Phone number must start with 02 and follow the format 02-XXX-XXXX");
      return;
    }

    try {
      setIsSaving(true);
      await dispatch(updateSettingsAsync(formData)).unwrap();
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(error || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pt-10 px-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? "Configure your business profile" : "View business information"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs - เหลือแค่ General Info */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-[#5AB2A8] text-white shadow-md">
            <Building2 size={18} /> General Info
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-3xl">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-in shake duration-300">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            {!isAdmin && (
              <div className="bg-amber-50 text-amber-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-amber-100">
                <Lock size={14} /> View only mode: Only Administrators can modify these settings.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Business Name"
                icon={<Building2 size={16} />}
                value={formData.businessName}
                readOnly={!isAdmin}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
              <Input
                label="Business Email"
                placeholder="admin@example.com"
                icon={<Mail size={16} />}
                value={formData.email}
                readOnly={!isAdmin}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Input
              label="Contact Phone (02-XXX-XXXX)"
              placeholder="02-123-4567"
              icon={<Phone size={16} />}
              value={formData.phone}
              readOnly={!isAdmin}
              onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData({ ...formData, phone: formatted });
              }}
            />

            {isAdmin && (
              <div className="pt-4 border-t border-slate-50">
                <Button
                  onClick={handleSaveGeneral}
                  disabled={isSaving}
                  className="bg-[#5AB2A8] text-white flex items-center gap-2 shadow-lg shadow-teal-100 mt-4 disabled:opacity-50"
                >
                  <Save size={18} /> {isSaving ? "Saving..." : "Save All Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}