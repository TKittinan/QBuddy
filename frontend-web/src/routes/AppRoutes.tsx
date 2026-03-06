import { Routes, Route, Navigate } from "react-router-dom";
// Layouts
import DashboardLayout from "../layout/DashboardLayout";
import LiveQueueLayout from "../layout/LiveQueueLayout";
import UserManageLayout from "../layout/UserManageLayout";
import PlaceManagementLayout from "../layout/PlacemanagementLayout";
// Pages
import Dashboard from "../pages/Dashboard";
import LiveQueue from "../pages/LiveQueue";
import UserManagement from "../pages/UserManagement";
import PlaceManagement from "../pages/PlaceManagement"; // ✅ ชื่อใหม่

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<LiveQueueLayout />}>
        <Route path="/livequeue" element={<LiveQueue />} />
      </Route>

      <Route element={<UserManageLayout />}>
        <Route path="/usermanage" element={<UserManagement />} />
      </Route>

      {/* ✅ เส้นทางสำหรับ Place Management */}
      <Route element={<PlaceManagementLayout />}>
        <Route path="/placemanagement" element={<PlaceManagement />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}