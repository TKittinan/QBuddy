import { useState, useMemo, useEffect } from "react";
import { RefreshCcw, Plus, Clock, PlayCircle, CheckCircle2, MoreHorizontal, User } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";

// 🌟 Import ฟังก์ชันสร้าง ID ร้านค้าจากไฟล์ที่ตั้งชื่อตรงตัว
import { generateShopId } from "../utils/generateShopId";

type TicketStatus = "Waiting" | "Serving" | "Completed";

type Ticket = {
  id: string;
  name: string;
  service: string;
  shopId: string;
  waitTime: number;
  status: TicketStatus;
  createdAt: Date;
};

// ใช้ฟังก์ชัน generateShopId สร้าง ID อัตโนมัติ
const mockShops = [
  { id: generateShopId("Premium Dining", 1), name: "Premium Dining", serviceType: "Table Service", avgServiceTime: 15 },
  { id: generateShopId("Fast Cafe", 1), name: "Fast Cafe", serviceType: "Counter Service", avgServiceTime: 5 },
  { id: generateShopId("Seoul Chon", 1), name: "Seoul Chon", serviceType: "Table Service", avgServiceTime: 15 },
  { id: generateShopId("Nude Steak", 1), name: "Nude Steak", serviceType: "Table Service", avgServiceTime: 20 },
  { id: generateShopId("Nude Steak", 2), name: "Nude Steak (Branch 2)", serviceType: "Table Service", avgServiceTime: 20 },
];

export default function LiveQueue() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>("All");

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedShopOption, setSelectedShopOption] = useState<SearchOption | null>(null);

  // ==========================================
  // 1. โหลดข้อมูลตอนเปิดหน้า (Local Storage)
  // ==========================================
  useEffect(() => {
    const savedTickets = localStorage.getItem("live_queue_tickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  /*
  // [FUTURE DB] โค้ดสำหรับดึงข้อมูลจาก Database จริง (GET)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets');
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    fetchTickets();
  }, []);
  */

  const saveTicketsToLocal = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    localStorage.setItem("live_queue_tickets", JSON.stringify(newTickets));
  };

  const shopOptions: SearchOption[] = useMemo(() => {
    return mockShops.map(shop => ({
      id: shop.id,
      label: shop.name,
      subLabel: shop.serviceType,
      originalData: shop
    }));
  }, []);

  const stats = useMemo(() => {
    const waiting = tickets.filter(t => t.status === "Waiting").length;
    const serving = tickets.filter(t => t.status === "Serving").length;
    const completed = tickets.filter(t => t.status === "Completed").length;
    const avgWait = tickets.length > 0 
      ? Math.round(tickets.reduce((acc, curr) => acc + curr.waitTime, 0) / tickets.length)
      : 0;

    return [
      { title: "Total Waiting", value: waiting, change: "+1" },
      { title: "Currently Serving", value: serving },
      { title: "Avg. Wait Time", value: `${avgWait}m` },
      { title: "Completed Today", value: completed },
    ];
  }, [tickets]);

  // ==========================================
  // 2. ฟังก์ชันสร้างคิว (Create) พร้อมระบบรันคิว
  // ==========================================
  const handleCreateTicket = () => {
    if (!customerName || !selectedShopOption) {
      alert("กรุณากรอกชื่อลูกค้าและเลือกร้านค้าให้ครบถ้วน");
      return;
    }

    const shopData = selectedShopOption.originalData;
    const shopId = shopData.id;

    // กรองหาเฉพาะคิวที่เป็นของร้านค้านี้
    const shopTickets = tickets.filter(t => t.shopId === shopId);

    // ค้นหาเลขคิวล่าสุดของร้านนี้
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
    // สร้าง ID คิวใหม่ เช่น SC1-ctm1, NS2-ctm3
    const newTicketId = `${shopId}-ctm${nextQueueNum}`;

    const peopleAhead = shopTickets.filter(t => t.status === "Waiting").length;
    const calculatedWait = peopleAhead * shopData.avgServiceTime;

    const newTicket: Ticket = {
      id: newTicketId,
      name: customerName,
      service: shopData.serviceType,
      shopId: shopId,
      waitTime: calculatedWait,
      status: "Waiting",
      createdAt: new Date(),
    };

    const updatedTickets = [...tickets, newTicket];
    saveTicketsToLocal(updatedTickets);
    
    /*
    // [FUTURE DB] โค้ดสำหรับเพิ่มข้อมูลลง Database จริง (POST)
    // await fetch('/api/tickets', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newTicket)
    // });
    */

    setCustomerName("");
    setSelectedShopOption(null);
    setIsPanelOpen(false);
  };

  // ==========================================
  // 3. ฟังก์ชันอัปเดตสถานะคิว (Update)
  // ==========================================
  const updateStatus = (id: string, newStatus: TicketStatus) => {
    const updatedTickets = tickets.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    saveTicketsToLocal(updatedTickets);

    /*
    // [FUTURE DB] โค้ดสำหรับอัปเดตข้อมูลลง Database จริง (PATCH/PUT)
    // await fetch(`/api/tickets/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status: newStatus })
    // });
    */
  };

  const filteredData = useMemo(() => {
    if (filter === "All") return tickets;
    return tickets.filter(t => t.status === filter);
  }, [tickets, filter]);

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
      render: (item: Ticket) => {
        const styles = {
          Serving: "bg-blue-50 text-blue-600",
          Waiting: "bg-amber-50 text-amber-600",
          Completed: "bg-emerald-50 text-emerald-600",
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[item.status]}`}>{item.status}</span>;
      },
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
                className={filter === tab ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <Table data={filteredData} columns={queueColumns} />
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
            placeholder="Search for a shop..."
            options={shopOptions}
            value={selectedShopOption}
            onChange={setSelectedShopOption}
          />
        </div>
      </SidePanelEdit>
    </div>
  );
}