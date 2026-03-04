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

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    }

    if (!isValid) return;

    login({
      id: "1",
      name: "Admin User",
      role: "admin",
      email,
    });

    navigate("/dashboard");
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-teal-600 to-emerald-500 relative">
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">
              Welcome to
            </p>
            <h2 className="text-xl font-semibold">
              QBuddy Admin Panel
            </h2>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-7">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Please sign in to access your dashboard.
            </p>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            icon={<EnvelopeClosedIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-gray-400"
            >
              {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 rounded-xl text-base"
            disabled={!email.trim() || !password.trim()}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}