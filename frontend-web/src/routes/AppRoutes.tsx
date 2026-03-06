import { Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
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
=======
// Layouts
import DashboardLayout from "../layout/DashboardLayout";
import LiveQueueLayout from "../layout/LiveQueueLayout";
import UserManageLayout from "../layout/UserManageLayout";
import PlaceManagementLayout from "../layout/PlacemanagementLayout"; // ✅ ชื่อใหม่
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
>>>>>>> main
