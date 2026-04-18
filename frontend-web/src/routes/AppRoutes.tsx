import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import UserManageLayout from "../layout/UserManageLayout";
import PlaceManagementLayout from "../layout/PlacemanagementLayout";
import BookingManagementLayout from "../layout/BookingManagementLayout";
import SettingsLayout from "../layout/SettingsLayout";
import InboxLayout from "../layout/InboxLayout"; 
import PostManagementLayout from "../layout/PostManagementLayout";

import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import PlaceManagement from "../pages/PlaceManagement";
import BookingManagement from "../pages/BookingManagement";
import Settings from "../pages/Settings";
import Login from "../pages/Login"; 
import InboxChat from "../pages/Inbox";
import PostManagement from "../pages/PostManagement";

import ProtectedRoute from "./ProtectedRoute"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/usermanage" element={<UserManageLayout />}>
          <Route index element={<UserManagement />} />
        </Route>

        <Route path="/placemanagement" element={<PlaceManagementLayout />}>
          <Route index element={<PlaceManagement />} />
        </Route>

        <Route path="/bookingManagement" element={<BookingManagementLayout />}>
          <Route index element={<BookingManagement />} />
        </Route>

        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
        </Route>

        <Route path="/postmanagement" element={<PostManagementLayout />}>
          <Route index element={<PostManagement />} />
        </Route>

        <Route path="/inbox" element={<InboxLayout />}>
          <Route index element={<InboxChat />} />
          <Route path=":id" element={<InboxChat />} />
        </Route>

      </Route>

      <Route path="*" element={<div className="flex h-screen w-full items-center justify-center text-xl font-bold text-slate-500">404 - Page Not Found</div>} />
    </Routes>
  );
}