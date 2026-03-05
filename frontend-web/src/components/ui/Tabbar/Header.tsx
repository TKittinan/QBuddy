import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  EnvelopeClosedIcon, 
  HamburgerMenuIcon,
  GearIcon,
  ExitIcon,
  PersonIcon
} from "@radix-ui/react-icons";
import { useAuth } from "../../../context/auth/use.Auth";
import { Dropdown } from "../Dropdown";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between z-40 sticky top-0 shadow-sm">
      
      <div className="flex items-center gap-3">
        {/* ✅ แสดงปุ่ม Hamburger บน iPad แนวตั้ง (จอ < 1024px) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all"
        >
          <HamburgerMenuIcon width={22} height={22} />
        </button>

        <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight truncate max-w-[140px] lg:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* 💻 Desktop View (จอ >= 1024px) */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl">
              <BellIcon width={19} height={19} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl">
              <EnvelopeClosedIcon width={19} height={19} />
            </button>
          </div>
        </div>

        {/* ✅ Profile Menu: รวมเมนูที่ iPad แนวตั้งต้องใช้ */}
        <Dropdown 
          trigger={
            <button className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-xl transition-all">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg uppercase">
                {user?.name ? user.name.charAt(0) : "G"}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || "User"}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">{user?.role || "Staff"}</p>
              </div>
            </button>
          }
          items={[
            // ✅ แสดงเฉพาะ iPad แนวตั้ง และ Mobile
            { label: "Search", icon: <MagnifyingGlassIcon />, className: "lg:hidden flex", onClick: () => {} },
            { label: "Notifications", icon: <BellIcon />, className: "lg:hidden flex", onClick: () => {} },
            { label: "Messages", icon: <EnvelopeClosedIcon />, className: "lg:hidden flex", onClick: () => {} },
            
            // ✅ รายการเมนูหลัก
            { label: "My Profile", icon: <PersonIcon />, divider: true, onClick: () => {} },
            { label: "Settings", icon: <GearIcon />, onClick: () => {} },
            { label: "Sign Out", icon: <ExitIcon />, className: "text-red-600", onClick: () => logout() },
          ]}
        />
      </div>
    </header>
  );
}