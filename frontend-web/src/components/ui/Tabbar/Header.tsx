import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  EnvelopeClosedIcon, 
  HamburgerMenuIcon,
  GearIcon,
  ExitIcon,
  Cross2Icon
} from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { logout } from "../../../redux/authSlice";
import { Dropdown } from "../Dropdown";
import { useNavigate, Link } from "react-router-dom"; 

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Header({ title, onMenuClick, searchQuery, setSearchQuery }: HeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hasPendingTickets, setHasPendingTickets] = useState(false);

  const checkPendingTickets = () => {
    const savedTickets = localStorage.getItem("support_tickets");
    if (savedTickets) {
      try {
        const parsedTickets = JSON.parse(savedTickets);
        const isPending = parsedTickets.some((t: any) => t.status === "Pending");
        setHasPendingTickets(isPending);
      } catch (e) {
        setHasPendingTickets(false);
      }
    }
  };

  useEffect(() => {
    checkPendingTickets();
    window.addEventListener("storage", checkPendingTickets);
    return () => window.removeEventListener("storage", checkPendingTickets);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

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
            if (setSearchQuery) setSearchQuery(""); 
          }} 
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors shrink-0"
        >
          <Cross2Icon className="w-4 h-4" />
        </button>
      </header>
    );
  }

  const profileButtonUI = (
    <button className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-xl transition-all cursor-pointer">
      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg uppercase">
        {/* ดึงตัวแรกจากชื่อใน Redux */}
        {user?.name ? user.name.charAt(0) : "U"}
      </div>
      <div className="text-left hidden xl:block">
        {/* แสดงชื่อจริงจาก Redux */}
        <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || "Unknown User"}</p>
        <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">{user?.role || "GUEST"}</p>
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
            <Link to="/inbox" className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-[#5AB2A8] rounded-xl transition-colors">
              <EnvelopeClosedIcon width={19} height={19} />
              {hasPendingTickets && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
              )}
            </Link>
          </div>
        </div>

        <div className="lg:hidden">
          <Dropdown 
            trigger={profileButtonUI}
            items={[
              { label: "Search", icon: <MagnifyingGlassIcon />, onClick: () => setIsMobileSearchOpen(true) },
              { label: "Messages", icon: <EnvelopeClosedIcon />, onClick: () => navigate("/inbox") },
              { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
              { label: "Sign Out", icon: <ExitIcon />, className: "text-red-600 font-bold", onClick: handleLogout },
            ]}
          />
        </div>

        <div className="hidden lg:block">
          <Dropdown 
            trigger={profileButtonUI}
            items={[
              { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
              { label: "Sign Out", icon: <ExitIcon />, className: "text-red-600 font-bold", onClick: handleLogout },
            ]}
          />
        </div>
      </div>
    </header>
  );
}