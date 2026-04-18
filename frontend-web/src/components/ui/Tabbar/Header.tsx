import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  EnvelopeClosedIcon, 
  HamburgerMenuIcon,
  GearIcon,
  ExitIcon,
  Cross2Icon,
  PersonIcon
} from "@radix-ui/react-icons";
import { Dropdown } from "../Dropdown";
import { useNavigate, Link } from "react-router-dom"; 

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { logoutAsync } from "../../../redux/Slice/authSlice";

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
  const navigate = useNavigate(); 
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  
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
    dispatch(logoutAsync());
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
          >
            <HamburgerMenuIcon width={20} height={20} />
          </button>
        )}
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 w-72 focus-within:ring-2 focus-within:ring-[#5AB2A8] focus-within:bg-white transition-all">
          <MagnifyingGlassIcon width={18} height={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="lg:hidden p-2.5 text-slate-400 hover:bg-slate-50 rounded-full"
        >
          <MagnifyingGlassIcon width={20} height={20} />
        </button>

        {/* Notifications/Inbox */}
        <Link to="/inbox" className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <EnvelopeClosedIcon width={20} height={20} />
          {hasPendingTickets && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          )}
        </Link>

        <div className="w-px h-6 bg-slate-200 mx-1 lg:mx-2"></div>

        {/* Profile Dropdown */}
        <Dropdown 
          align="right"
          trigger={
            <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <img 
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || "Admin"}`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover border border-slate-200" 
              />
            </button>
          }
          items={[
            { label: "My Profile", icon: <PersonIcon />, onClick: () => navigate("/settings") },
            { label: "Messages", icon: <EnvelopeClosedIcon />, onClick: () => navigate("/inbox") },
            { label: "Settings", icon: <GearIcon />, divider: true, onClick: () => navigate("/settings") },
            { label: "Sign Out", icon: <ExitIcon />, className: "text-rose-500 hover:bg-rose-50", onClick: handleLogout }
          ]}
        />
      </div>

      {/* Mobile Search Overlay */}
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
            className="ml-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
          >
            <Cross2Icon width={24} height={24} />
          </button>
        </div>
      )}
    </header>
  );
}