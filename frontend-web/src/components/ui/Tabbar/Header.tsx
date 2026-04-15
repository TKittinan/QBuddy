import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  EnvelopeClosedIcon, 
  HamburgerMenuIcon,
  GearIcon,
  ExitIcon,
  Cross2Icon
} from "@radix-ui/react-icons";
import { useAuth } from "../../../context/auth/use.Auth";
import { Dropdown } from "../Dropdown";
import { useNavigate, Link } from "react-router-dom"; 

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

interface PendingTicket {
  status: string;
}

export default function Header({ title, onMenuClick, searchQuery, setSearchQuery }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const [hasPendingTickets, setHasPendingTickets] = useState(false);

  const checkPendingTickets = () => {
    const savedTickets = localStorage.getItem("support_tickets");
    if (savedTickets) {
      const parsedTickets = JSON.parse(savedTickets) as PendingTicket[];
      const isPending = parsedTickets.some((t) => t.status === "Pending");
      setHasPendingTickets(isPending);
    }
  };

  useEffect(() => {
    checkPendingTickets();
    window.addEventListener("storage", checkPendingTickets);
    return () => window.removeEventListener("storage", checkPendingTickets);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileButtonUI = (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-700">{user?.name || "Admin User"}</p>
        <p className="text-xs text-slate-400 font-medium">{user?.role || "ADMIN"}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm">
        {user?.name?.charAt(0).toUpperCase() || "A"}
      </div>
    </div>
  );

  return (
    <header className="bg-white border-b border-slate-100 h-20 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <HamburgerMenuIcon width={20} height={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="hidden lg:flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlassIcon width={18} height={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
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
        <Dropdown 
          trigger={profileButtonUI}
          items={[
            { label: "Profile", onClick: () => navigate("/settings") },
            { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
            { label: "Sign Out", icon: <ExitIcon />, className: "text-rose-500 hover:bg-rose-50", onClick: handleLogout }
          ]}
        />
      </div>

      <div className="lg:hidden">
        <Dropdown 
          trigger={profileButtonUI}
          items={[
            { label: "Search", icon: <MagnifyingGlassIcon />, onClick: () => setIsMobileSearchOpen(true) },
            { label: "Messages", icon: <EnvelopeClosedIcon />, onClick: () => navigate("/inbox") },
            { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
            { label: "Sign Out", icon: <ExitIcon />, className: "text-rose-500 hover:bg-rose-50", onClick: handleLogout }
          ]}
        />
      </div>

      {isMobileSearchOpen && (
        <div className="absolute inset-0 bg-white z-50 flex items-center px-4 animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MagnifyingGlassIcon width={20} height={20} />
            </div>
            <input 
              type="text" 
              autoFocus
              placeholder="Search anything..." 
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5AB2A8]"
            />
          </div>
          <button 
            onClick={() => setIsMobileSearchOpen(false)}
            className="ml-4 p-2 text-slate-500 hover:bg-slate-50 rounded-full"
          >
            <Cross2Icon width={20} height={20} />
          </button>
        </div>
      )}
    </header>
  );
}