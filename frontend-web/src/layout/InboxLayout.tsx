import { useState, useMemo } from "react";
import { Outlet, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Clock, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/ui/Tabbar/Sidebar";
import Header from "../components/ui/Tabbar/Header";
import type { RootState } from "../redux/Reduxindex";

export default function InboxLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Resolved">("Pending");
  
  const tickets = useSelector((state: RootState) => state.inbox.tickets);
  const { id: activeTicketId } = useParams(); 
  
  const isViewingChat = !!activeTicketId;

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (filterStatus !== "All") result = result.filter(t => t.status === filterStatus);
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.userName.toLowerCase().includes(lowerQ) || 
        t.subject.toLowerCase().includes(lowerQ) ||
        t.id.toLowerCase().includes(lowerQ)
      );
    }
    return result;
  }, [tickets, searchQuery, filterStatus]);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative">
      <aside className={`fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          title="Support Inbox" 
          onMenuClick={() => setIsSidebarOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} // เชื่อมช่อง Search บน Header ให้ใช้งานได้จริง
        />

        <main className="flex-1 p-0 lg:p-6 overflow-hidden bg-slate-50">
          <div className="max-w-[1400px] mx-auto h-full flex lg:gap-6 bg-white lg:bg-transparent">
            
            {/* แผงซ้าย (รายชื่อ) */}
            <div className={`w-full lg:w-1/3 bg-white lg:rounded-2xl lg:shadow-sm border-r lg:border border-slate-100 flex-col overflow-hidden shrink-0 ${isViewingChat ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-100 space-y-4 bg-slate-50/50">
                <div className="flex gap-2">
                  <button onClick={() => setFilterStatus("Pending")} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${filterStatus === "Pending" ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}>Pending</button>
                  <button onClick={() => setFilterStatus("Resolved")} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${filterStatus === "Resolved" ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}>Resolved</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredTickets.map(ticket => (
                  <Link
                    key={ticket.id}
                    to={`/inbox/${ticket.id}`}
                    className={`block w-full text-left p-4 rounded-xl transition-all border ${activeTicketId === ticket.id ? "bg-[#5AB2A8]/10 border-[#5AB2A8]/30" : "bg-white border-transparent hover:bg-slate-50 border-b border-slate-100 lg:border-transparent lg:border-b-0"}`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`text-sm font-bold truncate pr-2 ${activeTicketId === ticket.id ? "text-[#5AB2A8]" : "text-slate-800"}`}>{ticket.userName}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mb-2">{ticket.subject}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{ticket.category}</span>
                      {ticket.status === "Pending" ? (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Clock size={10} /> Pending</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> Resolved</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* แผงขวา (หน้าต่างแชท) */}
            <div className={`w-full lg:flex-1 bg-white lg:rounded-2xl lg:shadow-sm lg:border border-slate-100 flex-col overflow-hidden ${!isViewingChat ? 'hidden lg:flex' : 'flex'}`}>
              <Outlet />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}