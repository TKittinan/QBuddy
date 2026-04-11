import { Routes, Route, Navigate } from "react-router-dom";
// Layouts
import DashboardLayout from "../layout/DashboardLayout";
import LiveQueueLayout from "../layout/LiveQueueLayout";
import UserManageLayout from "../layout/UserManageLayout";
import PlaceManagementLayout from "../layout/PlacemanagementLayout";
import BookingManagementLayout from "../layout/BookingManagement";
import SettingsLayout from "../layout/SettingsLayout";
import StaffManagementLayout from "../layout/StaffManagementLayout";
// Pages
import Dashboard from "../pages/Dashboard";
import LiveQueue from "../pages/LiveQueue";
import UserManagement from "../pages/UserManagement";
import PlaceManagement from "../pages/PlaceManagement";
import BookingManagement from "../pages/BookingManagement";
import Settings from "../pages/Settings";
import StaffManagement from "../pages/StaffManagement";
import Login from "../pages/Login"; 

import ProtectedRoute from "./ProtectedRoute"; 

export default function AppRoutes() {
  return (
    <Routes>
      {/* หน้าแรกให้ Redirect ไป Dashboard ก่อน (เดี๋ยว ProtectedRoute จะเตะไป Login เองถ้ายังไม่ได้เข้าสู่ระบบ) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* หน้า Login ปล่อยให้อยู่ข้างนอก ใครๆ ก็เข้าได้ */}
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<LiveQueueLayout />}>
          <Route path="/livequeue" element={<LiveQueue />} />
        </Route>

        <Route element={<UserManageLayout />}>
          <Route path="/usermanage" element={<UserManagement />} />
        </Route>

        <Route element={<PlaceManagementLayout />}>
          <Route path="/placemanagement" element={<PlaceManagement />} />
        </Route>

        <Route element={<BookingManagementLayout />}>
          <Route path="/bookingManagement" element={<BookingManagement />} />
        </Route>

        <Route element={<SettingsLayout />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<StaffManagementLayout />}>
          <Route path="/staffmanagement" element={<StaffManagement />} />
        </Route>

      </Route>

      {/* ดัก URL มั่ว */}
      <Route path="*" element={
        <div className="flex h-screen w-full items-center justify-center text-xl font-bold text-slate-500">
          404 Not Found
        </div>
      } />
    </Routes>
  );
}