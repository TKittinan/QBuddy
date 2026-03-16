import { Routes, Route, Navigate } from "react-router-dom";
// Layouts
import DashboardLayout from "../layout/DashboardLayout";
import LiveQueueLayout from "../layout/LiveQueueLayout";
import UserManageLayout from "../layout/UserManageLayout";
import PlaceManagementLayout from "../layout/PlacemanagementLayout";
import BookingManagementLayout from "../layout/BookingManagement";
import SettingsLayout from "../layout/SettingsLayout";
// Pages
import Dashboard from "../pages/Dashboard";
import LiveQueue from "../pages/LiveQueue";
import UserManagement from "../pages/UserManagement";
import PlaceManagement from "../pages/PlaceManagement";
import BookingManagement from "../pages/BookingManagement";
import Settings from "../pages/Settings";

import Login from "../pages/Login"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard"/>} />
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard/>} />
      </Route>

      <Route element={<LiveQueueLayout />}>
        <Route path="/livequeue" element={<LiveQueue/>} />
      </Route>

      <Route element={<UserManageLayout />}>
        <Route path="/usermanage" element={<UserManagement/>} />
      </Route>

      <Route element={<PlaceManagementLayout />}>
        <Route path="/placemanagement" element={<PlaceManagement/>} />
      </Route>

      <Route element={<BookingManagementLayout />}>
        <Route path="/bookingManagement" element={<BookingManagement/>} />
      </Route>

      <Route element={<SettingsLayout/>}>
        <Route path="/settings" element={<Settings/>} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}