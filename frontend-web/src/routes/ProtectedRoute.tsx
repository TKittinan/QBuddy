import { Navigate, Outlet, useLocation } from "react-router-dom";
// เปลี่ยนมาดึงค่าจาก Redux ให้ตรงกับหน้า Login
import { useAppSelector } from "../redux/hooks"; 

export default function ProtectedRoute() {
  const { user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // ถ้าดึงข้อมูลยังไม่เสร็จ ให้รอค้างไว้ก่อน ห้ามเพิ่งเตะกลับ
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-[#5AB2A8] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ถ้าเช็คเสร็จแล้วพบว่าไม่มี User จริงๆ ค่อยเตะไปหน้า Login
  if (!user) {
    // แนบ location ไปด้วย เผื่อในอนาคตอยากทำระบบ Login เสร็จแล้วเด้งกลับมาหน้าที่อยากเข้าตอนแรก
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ถ้ามี User ก็ให้ผ่านเข้า Dashboard หรือหน้าอื่นๆ ได้เลย
  return <Outlet />;
}