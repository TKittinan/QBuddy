import {
  DashboardIcon,
  PersonIcon,
  CalendarIcon,
  BarChartIcon,
  ExitIcon,
  GearIcon,
  EnvelopeClosedIcon
} from "@radix-ui/react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { GroupIcon, MessageSquare } from "lucide-react";

// นำเข้า Hooks จาก Redux แทน Context เดิม
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { logout } from "../../../redux/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // ดึงข้อมูล User จาก Redux Store
  const { user } = useAppSelector((state) => state.auth);
  
  // เช็คสิทธิ์ Admin จากข้อมูลใน Redux (ตรวจสอบให้แน่ใจว่า field ชื่อ role หรือ admin.role)
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    // 1. ล้างสถานะใน Redux และ LocalStorage ผ่าน Slice
    dispatch(logout());
    
    // 2. ล้างข้อมูล mock เดิม (ถ้ายังมีค้างอยู่)
    localStorage.removeItem("system_staffs");
    
    // 3. กลับหน้า Login
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-[#2F3655] text-slate-200 flex flex-col shadow-2xl lg:shadow-none">
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center">
          <DashboardIcon className="text-emerald-400" width={20} height={20} />
        </div>
        <div>
          <h1 className="font-semibold text-white leading-none">QBuddy</h1>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <SidebarItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
        <SidebarItem to="/livequeue" icon={<BarChartIcon />} label="LiveQueue" />
        <SidebarItem to="/placemanagement" icon={<CalendarIcon />} label="PlaceManagement" />
        <SidebarItem to="/bookingManagement" icon={<BarChartIcon />} label="BookingManagement" />
        <SidebarItem to="/postmanagement" icon={<MessageSquare size={18} />} label="PostManagement" />

        {/* เมนูจะโชว์เมื่อ isAdmin เป็น true เท่านั้น */}
        {isAdmin && (
          <>
            <div className="border-t border-white/10 my-4 mx-2" />
            <SidebarItem to="/usermanage" icon={<PersonIcon />} label="UserManage" />
            <SidebarItem to="/staffmanagement" icon={<GroupIcon size={18} />} label="StaffManagement" />
          </>
        )}

        <div className="border-t border-white/10 my-4 mx-2" />
        <SidebarItem to="/inbox" icon={<EnvelopeClosedIcon />} label="Support / Inbox" />
        <SidebarItem to="/settings" icon={<GearIcon />} label="Settings" />
      </nav>

      <div className="px-4 pb-6 hidden lg:block">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition text-slate-300"
        >
          <ExitIcon width={18} height={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${
          isActive ? "bg-[#3D4668] text-emerald-300" : "text-slate-300 hover:bg-white/10"
        }`
      }
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      {label}
    </NavLink>
  );
};

export default Sidebar;