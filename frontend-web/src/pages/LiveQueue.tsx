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

// 🌟 1. นำเข้า Hook Form และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ticketSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  selectedShopOption: z.object({
    id: z.string(),
    label: z.string(),
    subLabel: z.string().optional(),
    originalData: z.any()
  }, { message: "กรุณาเลือกร้านค้า" })
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function LiveQueue() {
  const dispatch = useDispatch();
  
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

  // 🌟 3. ติดตั้ง useForm 
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      customerName: "",
      selectedShopOption: undefined
    },
    mode: "onChange"
  });

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

  // 🌟 4. ฟังก์ชันจัดการ Submit 
  const onSubmitTicket = (data: TicketFormData) => {
    if (isQueueFull) {
      alert("ไม่สามารถเพิ่มคิวได้เนื่องจากคิวเต็มตามจำนวนที่กำหนดไว้ในวันนี้แล้ว");
      return;
    }

    const shopData = data.selectedShopOption.originalData;
    const shopId = shopData.id; // ใช้ Sys ID ในการค้นหาความสัมพันธ์ใน DB
    const shopTickets = tickets.filter(t => t.shopId === shopId);

    // =======================================================
    // 🌟 ลอจิกแปลงรหัส Place ID ให้เป็น Ticket Prefix สวยๆ
    // =======================================================
    const rawPlaceId = shopData.placeId.replace('#', ''); // ตัด # ออก เช่น "AT-RC-003"
    const idParts = rawPlaceId.split('-'); 
    let displayPrefix = rawPlaceId;
    
    if (idParts.length >= 3) {
      const namePart = idParts[0]; // "AT"
      const catPart = idParts[1]; // "RC"
      const seqPart = parseInt(idParts[2], 10); // "003" -> 3
      displayPrefix = `${namePart}${catPart}${seqPart}`; // นำมาต่อกันเป็น "ATRC3"
    } else {
      displayPrefix = rawPlaceId.replace(/-/g, ''); // สำรองเผื่อรหัสไม่ได้มาในรูปแบบปกติ
    }

    // หาหมายเลขคิวล่าสุดของร้านนี้
    let maxQueueNum = 0;
    shopTickets.forEach(t => {
      // ตัดคำด้วย -CTM (แปลงเป็น UpperCase ป้องกันปัญหาพิมพ์เล็ก/ใหญ่)
      const parts = t.id.toUpperCase().split('-CTM'); 
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxQueueNum) { maxQueueNum = num; }
      }
    });

    const nextQueueNum = maxQueueNum + 1;
    
    // 🌟 ประกอบร่าง Ticket ID เช่น ATRC3-CTM1
    const newTicketId = `${displayPrefix}-CTM${nextQueueNum}`;

    const peopleAhead = shopTickets.filter(t => t.status === "Waiting").length;
    const calculatedWait = peopleAhead * (shopData.avgServiceTime || 15);

    const newTicket: Ticket = {
      id: newTicketId, // 🌟 ใช้ ID สวยๆ นี้แสดงผลให้ User เห็น
      name: data.customerName,
      service: shopData.categories?.[0] || "Unknown Service",
      shopId: shopId, // 🌟 ส่วนการเชื่อมข้อมูลร้านค้า ยังคงใช้รหัสระบบ เพื่อไม่ให้ Database สับสน
      waitTime: calculatedWait,
      status: "Waiting",
      createdAt: new Date().toISOString(),
    };

    dispatch(addQueue(newTicket)); 
    
    reset();
    setIsPanelOpen(false);
  };

  const handleClosePanel = () => {
    reset();
    setIsPanelOpen(false);
  }

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

      <SidePanelEdit isOpen={isPanelOpen} onClose={handleClosePanel} title="New Ticket"
        footer={
          <button type="button" onClick={handleSubmit(onSubmitTicket)} className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
            Confirm Ticket
          </button>
        }
      >
        <div className="space-y-8">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User size={18} /></div>
              
              <Controller
                control={control}
                name="customerName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <input 
                    type="text" 
                    value={value} 
                    onChange={onChange} 
                    onBlur={onBlur}
                    placeholder="Enter customer name..." 
                    className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.customerName ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-[#0d9488]"} rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm`} 
                  />
                )}
              />
            </div>
            {errors.customerName && <p className="text-xs text-rose-500 font-medium">{errors.customerName.message}</p>}
          </div>

          <div className="space-y-3">
            <Controller 
              control={control}
              name="selectedShopOption"
              render={({ field: { onChange, value } }) => (
                <SearchSelect 
                  label="Select Shop" 
                  placeholder={shops.length === 0 ? "No active shops available" : "Search for a shop..."} 
                  options={shopOptions} 
                  value={value} 
                  onChange={onChange} 
                />
              )}
            />
             {errors.selectedShopOption && <p className="text-xs text-rose-500 font-medium">{errors.selectedShopOption.message}</p>}
          </div>

        </div>
      </SidePanelEdit>
    </div>
  );
}