import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addQueue, updateQueueStatus, type TicketStatus, type Ticket } from "../redux/queueSlice";
import { RefreshCcw, Plus, Clock, PlayCircle, CheckCircle2, MoreHorizontal, User, ChevronDown, SkipForward, XCircle } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { Status } from "../components/ui/Status";
import { Pagination } from "../components/ui/Pagination"; 

export default function LiveQueue() {
  const dispatch = useDispatch();
  
  // ดึงข้อมูลจาก Redux แทน LocalStorage
  const tickets = useSelector((state: RootState) => state.queue.tickets);
  const shops = useSelector((state: RootState) => state.places.places.filter(s => s.status === "Active"));
  const maxQueue = useSelector((state: RootState) => parseInt(state.settings.maxQueuePerDay, 10) || Infinity);

  const [filter, setFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedShopOption, setSelectedShopOption] = useState<SearchOption | null>(null);

  const loadData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500); 
  };

  const shopOptions: SearchOption[] = useMemo(() => {
    return shops.map(shop => ({
      id: shop.id,
      label: shop.name,
      subLabel: `(${shop.placeId})`,
      originalData: shop
    }));
  }, [shops]);

  const todayStr = new Date().toDateString();
  const ticketsToday = tickets.filter(t => new Date(t.createdAt).toDateString() === todayStr).length;
  const isQueueFull = ticketsToday >= maxQueue;

  const handleCreateTicket = () => {
    if (!customerName || !selectedShopOption) {
      alert("กรุณากรอกชื่อลูกค้าและเลือกร้านค้าให้ครบถ้วน");
      return;
    }
    if (isQueueFull) {
      alert("ไม่สามารถเพิ่มคิวได้เนื่องจากคิวเต็มตามจำนวนที่กำหนดไว้ในวันนี้แล้ว");
      return;
    }

    const shopData = selectedShopOption.originalData;
    const shopId = shopData.id;
    const shopTickets = tickets.filter(t => t.shopId === shopId);

    let maxQueueNum = 0;
    shopTickets.forEach(t => {
      const parts = t.id.split('-ctm'); 
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxQueueNum) { maxQueueNum = num; }
      }
    });

    const nextQueueNum = maxQueueNum + 1;
    const newTicketId = `${shopId}-ctm${nextQueueNum}`;

    const peopleAhead = shopTickets.filter(t => t.status === "Waiting").length;
    const calculatedWait = peopleAhead * (shopData.avgServiceTime || 15);

    const newTicket: Ticket = {
      id: newTicketId,
      name: customerName,
      service: shopData.categories?.[0] || "Unknown Service",
      shopId: shopId,
      waitTime: calculatedWait,
      status: "Waiting",
      createdAt: new Date().toISOString(),
    };

    dispatch(addQueue(newTicket)); 
    
    setCustomerName("");
    setSelectedShopOption(null);
    setIsPanelOpen(false);
  };

  const updateStatus = (id: string, newStatus: TicketStatus) => {
    dispatch(updateQueueStatus({ id, status: newStatus })); 
  };

  const filteredData = useMemo(() => {
    let result = [...tickets];
    if (filter !== "All") result = result.filter(t => t.status === filter);
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(lowerQuery) || t.name.toLowerCase().includes(lowerQuery)
      );
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [tickets, filter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [filter, searchQuery, tickets.length]);

  const queueColumns = [
    { header: "TICKET", key: "id", className: "text-left font-bold text-indigo-600 uppercase" },
    { header: "CUSTOMER NAME", key: "name", className: "text-left font-medium text-slate-700" },
    
    // 🌟 ส่วนที่แก้ไข: แปลงข้อความ Service Type ธรรมดา ให้กลายเป็น Tag สีเขียว
    { 
      header: "SERVICE TYPE", 
      key: "service", 
      className: "text-left",
      render: (item: Ticket) => (
        <div className="flex justify-start">
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-bold whitespace-nowrap">
            {item.service}
          </span>
        </div>
      )
    },

    { header: "WAIT TIME", key: "waitTime", className: "text-left", render: (item: Ticket) => (
        <div className="flex items-center justify-start gap-2 text-slate-500"><Clock size={14} /> {item.waitTime}m</div>
      )
    },
    { header: "STATUS", key: "status", className: "text-left", render: (item: Ticket) => (
        <div className="flex justify-start"><Status status={item.status} /></div>
      )
    },
    { header: "ACTIONS", key: "id", className: "text-right", render: (item: Ticket) => (
        <div className="flex justify-end">
          <Dropdown 
            trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Start Serving", icon: <PlayCircle size={16} />, className: "text-blue-600", onClick: () => updateStatus(item.id, "Serving") },
              { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => updateStatus(item.id, "Completed") },
              { label: "Skip", icon: <SkipForward size={16} />, className: "text-amber-500", divider: true, onClick: () => updateStatus(item.id, "Skipped") },
              { label: "Cancel", icon: <XCircle size={16} />, className: "text-rose-600", onClick: () => updateStatus(item.id, "Cancelled") },
            ]}
          />
        </div>
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Dropdown align="left"
          trigger={
            <Button variant="outline" className="flex items-center gap-2 bg-white min-w-[140px] justify-between border-slate-200 shadow-sm hover:bg-slate-50">
              <span className="text-slate-700 font-medium">Status: {filter === "All" ? "All" : filter}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </Button>
          }
          items={[
            { label: "All Status", onClick: () => setFilter("All") },
            { label: "Waiting", onClick: () => setFilter("Waiting") },
            { label: "Serving", onClick: () => setFilter("Serving") },
            { label: "Completed", onClick: () => setFilter("Completed") },
            { label: "Skipped", onClick: () => setFilter("Skipped") },
            { label: "Cancelled", onClick: () => setFilter("Cancelled") },
          ]}
        />

        <div className="flex flex-row items-center gap-3">
          <Button variant="outline" className="flex flex-row items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50" onClick={loadData} disabled={isRefreshing}>
            <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? "animate-spin text-teal-500" : "text-slate-600"}`} /> 
            <span className="text-slate-700 font-medium">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </Button>

          <Button variant="primary" className={`flex flex-row items-center justify-center text-white border-none shadow-sm font-medium px-4 ${isQueueFull ? "bg-slate-400 cursor-not-allowed" : "bg-[#0d9488] hover:bg-[#0f766e]"}`} onClick={() => { if(!isQueueFull) setIsPanelOpen(true); }} disabled={isQueueFull}>
            <Plus size={18} className="mr-1.5" /> 
            <span>{isQueueFull ? "Queue Full" : "New Ticket"}</span>
          </Button>
        </div>
      </div>

      {isQueueFull && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          ระบบคิวปิดรับแล้วเนื่องจากคิวถึงยอดสูงสุดที่กำหนด ({maxQueue} คิว)
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <Table data={paginatedData} columns={queueColumns} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
      </div>

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="New Ticket"
        footer={
          <button type="button" onClick={handleCreateTicket} className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
            Confirm Ticket
          </button>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User size={18} /></div>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none transition-all shadow-sm" />
            </div>
          </div>
          <SearchSelect label="Select Shop" placeholder={shops.length === 0 ? "No active shops available" : "Search for a shop..."} options={shopOptions} value={selectedShopOption} onChange={setSelectedShopOption} />
        </div>
      </SidePanelEdit>
    </div>
  );
}