import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/auth/use.Auth";

const defaultStaffs = [
  { id: "admin_1", name: "admin1", email: "admin1@qbuddy.com", password: "admin123", role: "ADMIN", status: "OFFLINE", createdAt: "Oct 01, 2023" },
  { id: "staff_1", name: "staff1", email: "staff1@qbuddy.com", password: "staff123", role: "STAFF", status: "OFFLINE", createdAt: "Sep 20, 2023" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState(""); 

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // ใช้ trim() ตัดช่องว่างหัวท้ายก่อนเลย
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setEmailError("Email is required");
      isValid = false;
    }

    if (!cleanPassword) {
      setPasswordError("Password is required");
      isValid = false;
    }

    if (!isValid) return;

    let savedStaffs = JSON.parse(localStorage.getItem("system_staffs") || "null");
    if (!savedStaffs || savedStaffs.length === 0) {
      savedStaffs = defaultStaffs;
      localStorage.setItem("system_staffs", JSON.stringify(defaultStaffs)); 
    }

    // แปลงให้เป็นตัวพิมพ์เล็กทั้งหมดเพื่อเช็คให้ตรงกัน
    const foundUser = savedStaffs.find((staff: any) => staff.email.toLowerCase() === cleanEmail.toLowerCase());

    if (foundUser) {
      if (foundUser.password === cleanPassword) {
        
        const mockToken = "mock_jwt_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

        const updatedStaffs = savedStaffs.map((s: any) => 
          s.email === foundUser.email ? { ...s, status: "ONLINE" } : s
        );
        localStorage.setItem("system_staffs", JSON.stringify(updatedStaffs));

        login({
          id: foundUser.id,
          name: foundUser.name,
          role: foundUser.role, 
          email: foundUser.email
        }, mockToken); 

        navigate("/dashboard");

      } else {
        setPasswordError("Incorrect password");
      }
    } else {
      setGeneralError("Access Denied: This email is not registered in the system.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-[#5AB2A8] to-[#4a968d] relative">
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">
              Welcome to
            </p>
            <h2 className="text-xl font-semibold">
              QBuddy Admin Panel
            </h2>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-7 relative">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Please sign in to access your dashboard.
            </p>
          </div>

          {generalError && (
            <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {generalError}
            </div>
          )}

          <div className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              icon={<EnvelopeClosedIcon />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (generalError) setGeneralError(""); 
              }}
              error={emailError}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={<LockClosedIcon />}
                className="pr-10"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                error={passwordError}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-base shadow-lg shadow-teal-100 bg-[#5AB2A8] hover:bg-[#4a968d] text-white"
            disabled={!email.trim() || !password.trim()}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}