import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addQueue, updateQueueStatus } from "../redux/queueSlice"; 
import { Plus, Clock, PlayCircle, CheckCircle2, MoreHorizontal, User, Trash2, XCircle, Filter, ChevronDown } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { StatusBadge } from "../components/ui/StatusBadge"; 
import { Pagination } from "../components/ui/Pagination"; 
import type { Column, Place, Ticket, TicketStatus } from "../types";

import { generateGlobalTicketId, getQueueDetails } from "../utils/queueUtils";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ticketSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  selectedShopOption: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.unknown().optional()
  }),
  pax: z.number().min(1, "ระบุจำนวนคนอย่างน้อย 1 คน")
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function LiveQueue() {
  const dispatch = useDispatch();
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const tickets = useSelector((state: RootState) => state.queue.tickets);
  const places = useSelector((state: RootState) => state.places.places);

  const [statusFilter, setStatusFilter] = useState<string>("Waiting");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { customerName: "", pax: 1, selectedShopOption: undefined }
  });

  const fetchLiveQueueFromDB = async () => {
    try {
      console.log("Fetching real-time Live Queue from DB...");
    } catch (error) {
      console.error("Failed to fetch live queue:", error);
    }
  };

  const deleteQueueTicketFromDB = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้ออกจากระบบถาวร?")) {
      try {
        console.log(`Deleting Ticket ${id} from Database...`);
      } catch (error) {
        console.error("Failed to delete ticket:", error);
      }
    }
  };

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
    if (statusFilter !== "All") result = result.filter(t => t.status === statusFilter);
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

  const handleStatusChange = (id: string, newStatus: TicketStatus) => { 
    dispatch(updateQueueStatus({ id, status: newStatus })); 
  };

  const onSubmit = (data: TicketFormData) => {
    const shopId = data.selectedShopOption.id;
    const currentTime = new Date().toISOString();
    const shopData = data.selectedShopOption.originalData as Place;
    const newTicketId = generateGlobalTicketId(shopId, currentTime, places, tickets);

    const newTicket: Ticket = {
      id: newTicketId, name: data.customerName, service: shopData?.category || "General", shopId: shopId, guests: data.pax, waitTime: shopData?.avgServiceTime || 15, status: "Waiting", createdAt: currentTime, bookDate: currentTime, bookTime: new Date(currentTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    dispatch(addQueue(newTicket));
    reset();
    setIsPanelOpen(false);
  };

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  const columns: Column<Ticket>[] = [
    { header: "Queue No", key: "id", className: "font-bold text-indigo-600" },
    { header: "Customer", key: "name", render: (row) => (<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={14} /></div><div><p className="font-semibold text-slate-700">{row.name}</p><p className="text-xs text-slate-400">{row.guests} Pax</p></div></div>) },
    { header: "Shop", key: "shopId", render: (row) => { const shop = places.find((p: Place) => p.id === row.shopId); return <span className="text-slate-600 font-medium">{shop ? shop.name : "Unknown"}</span>; } },
    { header: "Est. Wait", key: "waitTime", render: (row) => { const { estimatedWaitTime } = getQueueDetails(row, places, tickets); return (<div className="flex items-center gap-1.5 text-slate-500"><Clock size={14} className={estimatedWaitTime > 30 ? "text-amber-500" : "text-emerald-500"} /><span>{estimatedWaitTime} mins</span></div>); } },
    { header: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions", key: "actions", className: "text-right",
      render: (row) => (
        <Dropdown align="right" 
          className="w-44" 
          trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Call / Serving", icon: <PlayCircle size={16} />, onClick: () => handleStatusChange(row.id, "Serving"), className: "text-blue-600" },
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, onClick: () => handleStatusChange(row.id, "Completed"), className: "text-emerald-600" },
            // 🌟 แก้ไข: ลบ divider เปล่าๆ ออก และใส่เส้นคั่นที่ตัว Cancel แทนเพื่อความสวยงาม
            { label: "Cancel Ticket", icon: <XCircle size={16} />, onClick: () => handleStatusChange(row.id, "Cancelled"), className: "text-amber-600", divider: true },
            { label: "Delete Ticket", icon: <Trash2 size={16} />, onClick: () => deleteQueueTicketFromDB(row.id), className: "text-rose-600" },
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[
              {label: "All Status", onClick: () => setStatusFilter("All")},
              {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
              {label: "Completed", onClick: () => setStatusFilter("Completed")},
              {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
            ]}
          />
        </div>

        <div className="flex items-center">
          <button onClick={() => setIsPanelOpen(true)} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg shadow-teal-100 flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} /> 
            <span>Add Walk-in</span>
          </button>
        </div>
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