import { useState } from "react";
import { 
  MagnifyingGlassIcon, 
  EnvelopeClosedIcon, 
  HamburgerMenuIcon,
  GearIcon,
  BellIcon,
  ExitIcon,      // 🌟 Import icon สำหรับ Logout
  Cross2Icon     // 🌟 Import icon สำหรับปุ่มกากบาทปิดช่องค้นหา
} from "@radix-ui/react-icons";
import { useAuth } from "../../../context/auth/use.Auth";
import { Dropdown } from "../Dropdown";
import { useNavigate } from "react-router-dom"; 

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Header({ title, onMenuClick, searchQuery, setSearchQuery }: HeaderProps) {
  const { user, logout } = useAuth(); // 🌟 ดึง logout ออกมาจาก useAuth
  const navigate = useNavigate(); 

  // 🌟 State สำหรับคุมการเปิด/ปิดช่องค้นหาบนมือถือ
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // 🌟 ฟังก์ชันจัดการการ Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==========================================
  // 📱 โหมด Mobile Search (เมื่อกดปุ่ม Search ใน Dropdown)
  // ==========================================
  if (isMobileSearchOpen) {
    return (
      <header className="bg-white border-b border-slate-200 px-4 py-3 lg:hidden flex items-center justify-between z-40 sticky top-0 shadow-sm gap-3 animate-in fade-in slide-in-from-top-2">
        <MagnifyingGlassIcon className="text-slate-400 w-5 h-5 shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder={`Search in ${title}...`}
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 w-full"
        />
        <button 
          onClick={() => {
            setIsMobileSearchOpen(false);
            if (setSearchQuery) setSearchQuery(""); // ล้างค่าค้นหาตอนกดปิด
          }} 
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors shrink-0"
        >
          <Cross2Icon className="w-4 h-4" />
        </button>
      </header>
    );
  }

  // ==========================================
  // 💻 โหมด Header ปกติ
  // ==========================================
  const profileButtonUI = (
    <button className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-xl transition-all cursor-pointer">
      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg uppercase">
        {user?.name ? user.name.charAt(0) : "A"}
      </div>
      <div className="text-left hidden xl:block">
        <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || "Admin User"}</p>
        <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">{user?.role || "ADMIN"}</p>
      </div>
    </button>
  );

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between z-40 sticky top-0 shadow-sm">
      
      <div className="flex items-center gap-3">
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
        {/* Desktop View (จอ >= 1024px) */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
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

        {/* 🌟 ส่วนจัดการ Profile Menu */}
        <div className="lg:hidden">
          <Dropdown 
            trigger={profileButtonUI}
            items={[
              // 🌟 เมื่อกดปุ่ม Search ให้เปลี่ยน Header เป็นช่องค้นหา
              { label: "Search", icon: <MagnifyingGlassIcon />, onClick: () => setIsMobileSearchOpen(true) },
              { label: "Messages", icon: <EnvelopeClosedIcon />, onClick: () => {} },
              { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
              // 🌟 ปุ่ม Sign Out ใช้งานได้จริง
              { label: "Sign Out", icon: <ExitIcon />, className: "text-red-600 font-bold", onClick: handleLogout },
            ]}
          />
        </div>

        <div className="hidden lg:block">
          {profileButtonUI}
        </div>

      </div>
    </header>
  );
}