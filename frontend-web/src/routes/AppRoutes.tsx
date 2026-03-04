import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import LiveQueue from "../pages/LiveQueue";
import LiveQueueLayout from "../layout/LiveQueueLayout";
import UserManagement from "../pages/UserManagement";
import UserManageLayout from "../layout/UserManageLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<LiveQueueLayout />}>
          <Route path="/livequeue" element={<LiveQueue />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<UserManageLayout />}>
          <Route path="/usermanage" element={<UserManagement />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;