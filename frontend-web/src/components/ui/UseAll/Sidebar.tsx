import {
  DashboardIcon,
  PersonIcon,
  CalendarIcon,
  BarChartIcon,
  GearIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/use.Auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();            // เคลียร์ auth state
    navigate("/login");  // กลับไปหน้า login
  };

  return (
    <div className="w-64 min-h-screen bg-[#2F3655] text-slate-200 flex flex-col">

      <div className="px-6 py-6 flex items-center gap-3">
        {/* <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center">
          <DashboardIcon className="text-emerald-400" width={20} height={20} />
        </div> */}
        <div>
          <h1 className="font-semibold text-white leading-none">
            QBuddy
          </h1>
          <p className="text-xs text-slate-400">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">

        <SidebarItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />

        <SidebarItem to="/livequeue" icon={<PersonIcon />} label="QueueManagement" />

        <SidebarItem to="/usermanage" icon={<PersonIcon />} label="UserManage" />

        <SidebarItem to="/reservations" icon={<CalendarIcon />} label="Reservations" />

        <SidebarItem to="/analytics" icon={<BarChartIcon />} label="Analytics" />

        <SidebarItem to="/staff" icon={<PersonIcon />} label="Staff" />

        <div className="border-t border-white/10 my-4" />

        <SidebarItem to="/settings" icon={<GearIcon />} label="Settings" />

      </nav>
      <div className="px-4 pb-6">
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

export default Sidebar;

interface ItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem = ({ to, icon, label }: ItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${
          isActive
            ? "bg-[#3D4668] text-emerald-300"
            : "text-slate-300 hover:bg-white/10"
        }`
      }
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      {label}
    </NavLink>
  );
};