import {
  DashboardIcon,
  PersonIcon,
  CalendarIcon,
  ExitIcon,
  GearIcon,
  EnvelopeClosedIcon
} from "@radix-ui/react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

// นำเข้า Hooks จาก Redux
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { logout } from "../../../redux/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); 
  
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-[#2F3655] text-slate-200 flex flex-col shadow-2xl lg:shadow-none">
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
          Q
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white leading-none">QBuddy</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        <SidebarItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
        <SidebarItem to="/livequeue" icon={<CalendarIcon />} label="Live Queue" />
        <SidebarItem to="/bookingManagement" icon={<CalendarIcon />} label="Booking Manage" />
        <SidebarItem to="/placemanagement" icon={<PersonIcon />} label="Place Management" />
        <SidebarItem to="/postmanagement" icon={<MessageSquare size={16} />} label="Post Management" />

        {/* เมนู User Management จะโชว์เฉพาะแอดมิน */}
        {isAdmin && (
          <>
            <div className="border-t border-white/10 my-4 mx-2" />
            <SidebarItem to="/usermanage" icon={<PersonIcon />} label="User Management" />
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
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-[#5AB2A8] text-white shadow-lg shadow-teal-900/20"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
};

export default Sidebar;