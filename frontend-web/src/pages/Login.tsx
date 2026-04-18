import { EnvelopeClosedIcon, LockClosedIcon, EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAppDispatch, useAppSelector } from "../redux/hooks"; 
import { loginAsync } from "../redux/Slice/authSlice";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user, loading, error: reduxError } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState(""); 

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit"
  });


  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, []); 

  const onLoginSubmit = async (data: LoginFormData) => {
    setGeneralError("");

    try {
      const result = await dispatch(loginAsync(data)).unwrap();
      
      if (result) {
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        
        }, 200);
      }
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || "Invalid credentials";
      setGeneralError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-[#5AB2A8] to-[#4a968d] flex flex-col items-center justify-center text-white relative">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 z-10">
            <span className="text-4xl font-black text-[#5AB2A8]">Q</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide z-10">QBuddy Web Admin</h1>
          <p className="text-teal-100 text-sm mt-1 z-10">Sign in to manage your system</p>
        </div>

        <div className="p-8 sm:p-10">
          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6">
            {(generalError || reduxError) && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center animate-in fade-in duration-300">
                {generalError || reduxError}
              </div>
            )}
            
            <Controller 
              control={control} 
              name="email" 
              render={({ field }) => (
                <div>
                  <Input 
                    {...field}
                    label="Email Address" 
                    type="email" 
                    placeholder="name@company.com" 
                    icon={<EnvelopeClosedIcon />} 
                    className={errors.email ? "border-red-400" : ""} 
                    disabled={loading}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              )}
            />

            <div className="relative">
              <Controller 
                control={control} 
                name="password" 
                render={({ field }) => (
                  <div>
                    <Input 
                      {...field}
                      label="Password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      icon={<LockClosedIcon />} 
                      className={`pr-10 ${errors.password ? "border-red-400" : ""}`} 
                      disabled={loading}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                  </div>
                )}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword((prev) => !prev)} 
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-xl text-base shadow-lg shadow-teal-100 bg-[#5AB2A8] hover:bg-[#4a968d] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}