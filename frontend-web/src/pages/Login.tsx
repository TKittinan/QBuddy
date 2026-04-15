import { EnvelopeClosedIcon, LockClosedIcon, EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// นำเข้า Hooks และ Thunk จาก Redux
import { useAppDispatch, useAppSelector } from "../redux/hooks"; 
import { loginAsync } from "../redux/authSlice";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // ดึง State จาก Redux authSlice
  const { user, loading, error } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit"
  });

  // ถ้ามี User (Login สำเร็จ) ให้เด้งไปหน้า Dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginFormData) => {
    // เรียกใช้ loginAsync เพื่อยิง API ไปที่ Backend
    // ข้อมูล Token และ User จะถูกเซฟลง localStorage อัตโนมัติใน Slice
    dispatch(loginAsync(data));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-[#5AB2A8] to-[#4a968d] relative">
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">Welcome to</p>
            <h2 className="text-xl font-semibold">QBuddy Admin Panel</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onLoginSubmit)} className="p-10 space-y-7 relative">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-800">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-2">Please sign in to access your dashboard.</p>
          </div>

          {/* แสดง Error จาก Backend ผ่าน Redux State */}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <div>
                <Input label="Email Address" type="email" placeholder="name@company.com" icon={<EnvelopeClosedIcon />} value={value} onChange={onChange} className={errors.email ? "border-red-400" : ""} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            )}/>

            <div className="relative">
              <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                <div>
                  <Input label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" icon={<LockClosedIcon />} className={`pr-10 ${errors.password ? "border-red-400" : ""}`} value={value} onChange={onChange} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              )}/>

              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} // ปิดปุ่มขณะกำลังโหลด
            className="w-full h-11 rounded-xl text-base shadow-lg shadow-teal-100 bg-[#5AB2A8] hover:bg-[#4a968d] text-white disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}