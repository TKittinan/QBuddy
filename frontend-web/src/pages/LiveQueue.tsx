import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCcw, Plus, Clock, PlayCircle, CheckCircle2, MoreHorizontal, User } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { Status } from "../components/ui/Status"; // แก้เป็น Status ตามชื่อไฟล์จริง

// Import Pagination Component
import { Pagination } from "../components/ui/Pagination"; 

type TicketStatus = "Waiting" | "Serving" | "Completed";

type Ticket = {
  id: string;
  name: string;
  service: string;
  shopId: string;
  waitTime: number;
  status: TicketStatus;
  createdAt: Date | string;
};

export default function LiveQueue() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // เพิ่ม State สำหรับเก็บข้อมูลร้านค้าที่ดึงมาจาก Place Management
  const [shops, setShops] = useState<any[]>([]);
  
  const [filter, setFilter] = useState<string>("All");

  // State สำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedShopOption, setSelectedShopOption] = useState<SearchOption | null>(null);

  // ==========================================
  // 1. โหลดข้อมูลตอนเปิดหน้า (Local Storage)
  // ==========================================
  useEffect(() => {
    // 1. โหลดข้อมูลตั๋วคิว
    const savedTickets = localStorage.getItem("live_queue_tickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }

    // 2. โหลดข้อมูลร้านค้ามาจาก Place Management (Single Source of Truth)
    const savedShops = localStorage.getItem("local_shops_db");
    if (savedShops) {
      const parsedShops = JSON.parse(savedShops);
      // เอาเฉพาะร้านที่สถานะ "Active" เท่านั้นมาแสดงใน Dropdown ให้เลือกรับคิว
      const activeShops = parsedShops.filter((s: any) => s.status === "Active");
      setShops(activeShops);
    }
  }, []);

  const saveTicketsToLocal = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    localStorage.setItem("live_queue_tickets", JSON.stringify(newTickets));
  };

  // แปลงข้อมูลร้านค้าที่ดึงมา ให้เข้ากับรูปแบบของ SearchSelect Component
  const shopOptions: SearchOption[] = useMemo(() => {
    return shops.map(shop => ({
      id: shop.id,
      label: shop.name,
      subLabel: `${shop.serviceType} (${shop.placeId})`, // โชว์รูปแบบสวยๆ เช่น Table Service (#NYK-001)
      originalData: shop
    }));
  }, [shops]);

  const stats = useMemo(() => {
    const waiting = tickets.filter(t => t.status === "Waiting").length;
    const serving = tickets.filter(t => t.status === "Serving").length;
    const completed = tickets.filter(t => t.status === "Completed").length;
    const avgWait = tickets.length > 0 
      ? Math.round(tickets.reduce((acc, curr) => acc + curr.waitTime, 0) / tickets.length)
      : 0;

    return [
      { title: "Total Waiting", value: waiting},
      { title: "Currently Serving", value: serving },
      { title: "Avg. Wait Time", value: `${avgWait}m` },
      { title: "Completed Today", value: completed },
    ];
  }, [tickets]);

  const handleCreateTicket = () => {
    if (!customerName || !selectedShopOption) {
      alert("กรุณากรอกชื่อลูกค้าและเลือกร้านค้าให้ครบถ้วน");
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
        if (!isNaN(num) && num > maxQueueNum) {
          maxQueueNum = num;
        }
      }
    });

    const nextQueueNum = maxQueueNum + 1;
    const newTicketId = `${shopId}-ctm${nextQueueNum}`;

    const peopleAhead = shopTickets.filter(t => t.status === "Waiting").length;
    const calculatedWait = peopleAhead * (shopData.avgServiceTime || 15); // เผื่อเคสร้านไม่มีค่า avgTime

    const newTicket: Ticket = {
      id: newTicketId,
      name: customerName,
      service: shopData.serviceType || "Unknown Service",
      shopId: shopId,
      waitTime: calculatedWait,
      status: "Waiting",
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = [...tickets, newTicket];
    saveTicketsToLocal(updatedTickets);
    
    setCustomerName("");
    setSelectedShopOption(null);
    setIsPanelOpen(false);
  };

  const updateStatus = (id: string, newStatus: TicketStatus) => {
    const updatedTickets = tickets.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    saveTicketsToLocal(updatedTickets);
  };

  // Filter & Sort: กรองข้อมูลและเรียงให้ของใหม่สุดอยู่บนสุด
  const filteredData = useMemo(() => {
    let result = [...tickets];

    if (filter !== "All") {
      result = result.filter(t => t.status === filter);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(lowerQuery) || 
        t.name.toLowerCase().includes(lowerQuery)
      );
    }

    // เรียงจากใหม่ไปเก่า (ใบใหม่สุดจะอยู่หน้าแรก แถวบนสุด)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [tickets, filter, searchQuery]);

  // หั่นข้อมูลตามหน้า
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // รีเซ็ตกลับไปหน้า 1 เสมอเวลาเปลี่ยน Tab, ค้นหา หรือ มีคิวใหม่เพิ่มเข้ามา
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, tickets.length]);

  const queueColumns = [
    { header: "TICKET", key: "id", className: "font-bold text-indigo-600 uppercase" },
    { header: "CUSTOMER NAME", key: "name", className: "font-medium text-slate-700" },
    { header: "SERVICE TYPE", key: "service" },
    { 
      header: "WAIT TIME", 
      key: "waitTime",
      render: (item: Ticket) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} /> {item.waitTime}m
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      // เรียกใช้ Status Component 
      render: (item: Ticket) => <Status status={item.status} />
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item: Ticket) => (
        <Dropdown 
          trigger={
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          }
          items={[
            { label: "Start Serving", icon: <PlayCircle size={16} />, className: "text-blue-600", onClick: () => updateStatus(item.id, "Serving") },
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => updateStatus(item.id, "Completed") },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw size={16} className="mr-2" /> Refresh Data
        </Button>

        <Button 
          variant="primary" 
          className="bg-[#1E1E2D] hover:bg-slate-800"
          onClick={() => setIsPanelOpen(true)}
        >
          <Plus size={16} className="mr-2" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Waiting", "Serving", "Completed"].map((tab) => (
              <Button 
                key={tab} 
                variant={filter === tab ? "primary" : "ghost"}
                className={filter === tab ? "bg-teal-600 text-white hover:bg-teal-700" : ""}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <Table data={paginatedData} columns={queueColumns} />

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onChange={setCurrentPage}
        />
      </div>

      <SidePanelEdit
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="New Ticket"
        footer={
          <button 
            type="button"
            onClick={handleCreateTicket}
            className="w-full bg-[#5E5CE6] hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Confirm Ticket
          </button>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <SearchSelect
            label="Select Shop"
            placeholder={shops.length === 0 ? "No active shops available" : "Search for a shop..."}
            options={shopOptions}
            value={selectedShopOption}
            onChange={setSelectedShopOption}
          />
        </div>
      </SidePanelEdit>
    </div>
  );
}