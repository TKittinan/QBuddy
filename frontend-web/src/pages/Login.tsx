import { EnvelopeClosedIcon, LockClosedIcon, EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/auth/use.Auth";
import type { User } from "../types"; // 🌟 Import Type 

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

const defaultStaffs: User[] = [
  { id: "admin_1", name: "admin1", email: "admin1@qbuddy.com", password: "admin123", role: "ADMIN", status: "OFFLINE", createdAt: "Oct 01, 2023" },
  { id: "staff_1", name: "staff1", email: "staff1@qbuddy.com", password: "staff123", role: "STAFF", status: "OFFLINE", createdAt: "Sep 20, 2023" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState(""); 

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit"
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setGeneralError("");

    let savedStaffs: User[] = JSON.parse(localStorage.getItem("system_staffs") || "null");
    if (!savedStaffs || savedStaffs.length === 0) {
      savedStaffs = defaultStaffs;
      localStorage.setItem("system_staffs", JSON.stringify(defaultStaffs)); 
    }

    // 🌟 เลิกใช้ any 
    const foundUser = savedStaffs.find((staff: User) => staff.email.toLowerCase() === data.email.toLowerCase());

    if (foundUser) {
      if (foundUser.password === data.password) {
        const mockToken = "mock_jwt_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        const updatedStaffs = savedStaffs.map((s: User) => s.email === foundUser.email ? { ...s, status: "ONLINE" } : s);
        localStorage.setItem("system_staffs", JSON.stringify(updatedStaffs));

        login({ id: foundUser.id, name: foundUser.name, role: foundUser.role, email: foundUser.email }, mockToken);
        navigate("/dashboard");
      } else {
        setGeneralError("Incorrect password. Please try again.");
      }
    } else {
      setGeneralError("Access Denied: This email is not registered in the system.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-[#5AB2A8] to-[#4a968d] flex flex-col items-center justify-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
             <svg viewBox="0 0 100 100" className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%]"><circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" opacity="0.3"/><circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/></svg>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 z-10">
            <span className="text-4xl font-black text-[#5AB2A8]">Q</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide z-10">QBuddy Web Admin</h1>
          <p className="text-teal-100 text-sm mt-1 z-10">Sign in to manage your system</p>
        </div>

        <div className="p-8 sm:p-10">
          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6">
            {generalError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
                {generalError}
              </div>
            )}
            
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <div><Input label="Email Address" type="email" placeholder="name@company.com" icon={<EnvelopeClosedIcon />} value={value} onChange={onChange} className={errors.email ? "border-red-400" : ""} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}</div>
            )}/>

            <div className="relative">
              <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                <div><Input label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" icon={<LockClosedIcon />} className={`pr-10 ${errors.password ? "border-red-400" : ""}`} value={value} onChange={onChange} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}</div>
              )}/>

              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-lg shadow-teal-100 bg-[#5AB2A8] hover:bg-[#4a968d] mt-2">
              Sign In to Admin Panel
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Protected area for authorized personnel only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}