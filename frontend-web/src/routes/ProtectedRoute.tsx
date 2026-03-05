import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth/use.Auth";

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}