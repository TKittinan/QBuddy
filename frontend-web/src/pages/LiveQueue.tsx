import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { setQueues, addQueue, updateQueueStatus, deleteQueue } from "../redux/queueSlice";
import { Plus, Clock, PlayCircle, CheckCircle2, MoreHorizontal, User, Trash2, XCircle, Filter, ChevronDown } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import { Pagination } from "../components/ui/Pagination"; 
import type { Column, Place, Ticket, TicketStatus } from "../types";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_BASE_URL } from "../config";

const ticketSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  selectedShopOption: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.unknown().optional()
  }),
  pax: z.number().min(1, "ระบุจำนวนคนอย่างน้อย 1 คน")
});

const generateGlobalTicketId = (shopId: string, time: string, places: any[], tickets: any[]) => {
  const shop = places.find(p => p.id === shopId);
  const prefix = shop ? shop.name.substring(0, 2).toUpperCase() : "QN";
  const dateStr = new Date(time).getTime().toString().slice(-4);
  const count = tickets.filter(t => t.shopId === shopId).length + 1;
  return `${prefix}-${dateStr}-${count}`;
};

// ฟังก์ชันสำหรับคำนวณเวลาที่ต้องรอ
const getQueueDetails = (ticket: any, places: any[], tickets: any[]) => {
  const shop = places.find(p => p.id === ticket.shopId);
  const avgTime = shop?.avgServiceTime || 15;
  
  // นับจำนวนคนที่รออยู่ก่อนหน้าในร้านเดียวกัน
  const waitingBefore = tickets.filter(t => 
    t.shopId === ticket.shopId && 
    t.status === "Waiting" && 
    new Date(t.createdAt).getTime() < new Date(ticket.createdAt).getTime()
  ).length;

  return {
    estimatedWaitTime: (waitingBefore + 1) * avgTime
  };
};

type TicketFormData = z.infer<typeof ticketSchema>;

export default function LiveQueue() {
  const dispatch = useDispatch();
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const tickets = useSelector((state: RootState) => state.queue.tickets);
  const places = useSelector((state: RootState) => state.places.places);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { customerName: "", pax: 1, selectedShopOption: undefined }
  });

  // ==========================================
  // 1. API: GET - ดึงข้อมูลคิวทั้งหมด
  // ==========================================
  const fetchLiveQueueFromDB = async () => {
    try {
      // โค้ดสำหรับ Backend
      const response = await fetch(`${API_BASE_URL}/queues`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      dispatch(setQueues(data)); // เอาข้อมูลที่ได้อัปเดตลง Redux
    } catch (error) {
      console.error("Failed to fetch live queue:", error);
    }
  };

  // ==========================================
  // 2. API: DELETE - ลบข้อมูลคิว
  // ==========================================
  const deleteQueueTicketFromDB = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้ออกจากระบบถาวร?")) {
      try {
        // โค้ดสำหรับ Backend
        const response = await fetch(`${API_BASE_URL}/queues/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error("Failed to delete ticket");
        
        dispatch(deleteQueue(id)); 
        console.log(`Deleted Ticket ${id} from Database`);
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        alert("ไม่สามารถลบคิวได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  // ==========================================
  // 3. API: PUT/PATCH - อัปเดตสถานะคิว
  // ==========================================
  const handleStatusChange = async (id: string, newStatus: TicketStatus) => { 
    try {
      // โค้ดสำหรับ Backend
      const response = await fetch(`${API_BASE_URL}/queues/${id}/status`, {
        method: 'PUT', // หรือ PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Failed to update status");

      dispatch(updateQueueStatus({ id, status: newStatus })); 
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ==========================================
  // 4. API: POST - เพิ่มคิวใหม่
  // ==========================================
  const onSubmit = async (data: TicketFormData) => {
    const shopId = data.selectedShopOption.id;
    const currentTime = new Date().toISOString();
    const shopData = data.selectedShopOption.originalData as Place;
    
    const newTicketId = generateGlobalTicketId(shopId, currentTime, places, tickets);

    const newTicket: Ticket = {
      id: newTicketId, name: data.customerName, service: shopData?.category || "General", shopId: shopId, guests: data.pax, waitTime: shopData?.avgServiceTime || 15, status: "Waiting", createdAt: currentTime, bookDate: currentTime, bookTime: new Date(currentTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    try {
      // โค้ดสำหรับ Backend
      const response = await fetch(`${API_BASE_URL}/queues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (!response.ok) throw new Error("Failed to create ticket");
      
      // ถ้าระบบ Backend ทำการ Generate ID ใหม่มาให้ สามารถดึงมาใช้ได้เลย
      const createdTicket = await response.json();
      dispatch(addQueue(createdTicket));

      reset();
      setIsPanelOpen(false);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("ไม่สามารถเพิ่มคิวได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ดึงข้อมูลอัตโนมัติ (Polling)
  useEffect(() => {
    fetchLiveQueueFromDB();
    const intervalId = setInterval(fetchLiveQueueFromDB, 15000); 
    return () => clearInterval(intervalId);
  }, []);

  const activePlaces = useMemo(() => places.filter((p: Place) => p.status === "Active"), [places]);

  const shopOptions: SearchOption<Place>[] = useMemo(() => {
    return activePlaces.map((shop: Place) => ({ id: shop.id, label: shop.name, subLabel: `${shop.branch} - คิวรอ: ${shop.queueCount}`, originalData: shop }));
  }, [activePlaces]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (statusFilter !== "All") {
      result = result.filter(t => t.status === statusFilter);
    }
    
    if (searchQuery) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [tickets, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentData = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  const columns: Column<Ticket>[] = [
    { header: "QUEUE NO", key: "id", className: "w-[15%] text-left font-bold text-indigo-600 uppercase" },
    { header: "CUSTOMER", key: "name", className: "w-[25%] text-left", render: (row) => (<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={14} /></div><div><p className="font-bold text-slate-800 text-sm">{row.name}</p><p className="text-[11px] text-slate-400 font-medium">Guests: {row.guests}</p></div></div>) },
    { header: "SHOP NAME", key: "shopId", className: "w-[20%] text-left text-slate-700 font-medium text-sm", render: (row) => { const shop = places.find((p: Place) => p.id === row.shopId); return <span>{shop ? shop.name : "Unknown"}</span>; } },
    { header: "EST. WAIT", key: "waitTime", className: "w-[15%] text-left", render: (row) => { const { estimatedWaitTime } = getQueueDetails(row, places, tickets); return (<div className="flex items-center gap-2 text-slate-500 font-medium"><Clock size={14} className={estimatedWaitTime > 30 ? "text-amber-500 shrink-0" : "text-emerald-500 shrink-0"} /><span className="text-xs">{estimatedWaitTime} mins</span></div>); } },
    { header: "STATUS", key: "status", className: "w-[15%] text-center", render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div> },
    {
      header: "ACTIONS", key: "actions", className: "w-[10%] text-right",
      render: (row) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Call / Serving", icon: <PlayCircle size={16} />, className: "text-blue-600", onClick: () => handleStatusChange(row.id, "Serving") },
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => handleStatusChange(row.id, "Completed") },
            { label: "Cancel Ticket", icon: <XCircle size={16} />, className: "text-amber-600", divider: true, onClick: () => handleStatusChange(row.id, "Cancelled") },
            { label: "Delete Ticket", icon: <Trash2 size={16} />, className: "text-rose-600", divider: true, onClick: () => deleteQueueTicketFromDB(row.id) },
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
          items={[
            {label: "All Status", onClick: () => setStatusFilter("All")},
            {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
            {label: "Completed", onClick: () => setStatusFilter("Completed")},
            {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
          ]}
        />

        <button onClick={() => setIsPanelOpen(true)} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg shadow-teal-100 flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16} /> 
          <span>Add Walk-in</span>
        </button>
      </div>

      <Table data={currentData} columns={columns} emptyMessage={searchQuery ? "No tickets match your search." : `No ${statusFilter.toLowerCase()} tickets found.`} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="New Walk-in Queue">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer Name</label>
              <Controller control={control} name="customerName" render={({ field: { onChange, onBlur, value } }) => (
                <input type="text" value={value} onChange={onChange} onBlur={onBlur} placeholder="Enter customer name..." className={`w-full pl-4 pr-4 py-3 bg-white border ${errors.customerName ? "border-rose-400" : "border-slate-200"} rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none`} />
              )} />
              {errors.customerName && <p className="text-xs text-rose-500">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-3">
              <Controller control={control} name="selectedShopOption" render={({ field: { onChange, value } }) => (
                <SearchSelect label="Select Shop" placeholder={activePlaces.length === 0 ? "No active shops available" : "Search for a shop..."} options={shopOptions} value={value as SearchOption<unknown> | null} onChange={onChange} />
              )} />
               {errors.selectedShopOption && <p className="text-xs text-rose-500">{errors.selectedShopOption.message as string}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Number of Pax (Guests)</label>
              <Controller control={control} name="pax" render={({ field: { onChange, value } }) => (
                <input type="number" min="1" value={value} onChange={e => onChange(parseInt(e.target.value) || 1)} className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none" />
              )} />
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <button type="submit" className="w-full flex flex-row items-center justify-center gap-2 py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98] whitespace-nowrap">
                <CheckCircle2 size={20} />
                <span>Create Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}