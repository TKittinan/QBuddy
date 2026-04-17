import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  fetchQueues, 
  updateQueueStatusAsync, 
  deleteQueueAsync 
} from "../redux/queueSlice";
import { 
  Plus, Clock, PlayCircle, CheckCircle2, 
  MoreHorizontal, User, Trash2, XCircle, Filter, ChevronDown 
} from "lucide-react";
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

// Validation Schema (เหมือนเดิม)
const ticketSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  selectedShopOption: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.unknown().optional()
  }),
  pax: z.number().min(1, "ระบุจำนวนคนอย่างน้อย 1 คน")
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function LiveQueue() {
  const dispatch = useAppDispatch();
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  //  ดึงข้อมูลผ่าน Redux Store
  const { tickets, loading } = useAppSelector((state) => state.queue);
  const { places } = useAppSelector((state) => state.places);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { customerName: "", pax: 1, selectedShopOption: undefined }
  });

  // 1. ดึงข้อมูลผ่าน Redux Thunk (Polling ทุก 15 วินาที)
  useEffect(() => {
    dispatch(fetchQueues());
    const intervalId = setInterval(() => dispatch(fetchQueues()), 15000); 
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // 2. อัปเดตสถานะคิว
  const handleStatusChange = async (id: string, newStatus: TicketStatus) => { 
    try {
      await dispatch(updateQueueStatusAsync({ id, status: newStatus })).unwrap();
    } catch (error: any) {
      alert(error || "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  // 3. ลบคิว
  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้ออกจากระบบถาวร?")) {
      try {
        await dispatch(deleteQueueAsync(id)).unwrap();
      } catch (error: any) {
        alert(error || "ไม่สามารถลบคิวได้");
      }
    }
  };

  // 4. เพิ่มคิวใหม่ (ส่งไป Backend ให้มันเจนข้อมูลมาให้)
  const onSubmit = async (data: TicketFormData) => {
  try {
    const shopId = data.selectedShopOption.id;
    const customer = data.customerName;
    const pax = data.pax; //  ดึง pax มาใช้ด้วย

    alert(`สร้างคิวสำเร็จ!\nลูกค้า: ${customer}\nจำนวน: ${pax} ท่าน\nรหัสร้านค้า: ${shopId}`);

    // ถ้ามี Thunk สำหรับเพิ่มคิว ก็เรียกใช้ตรงนี้ได้เลย เช่น:
    // await dispatch(addQueueAsync({ shopId, customer, pax })).unwrap();

    reset();
    setIsPanelOpen(false);
  } catch (error) {
    console.error(error);
  }
};

  // Logic การคำนวณและกรองข้อมูล (เหมือนเดิม)
  const getQueueDetails = (ticket: Ticket) => {
    const shop = places.find(p => p.id === ticket.shopId);
    const avgTime = shop?.avgServiceTime || 15;
    const waitingBefore = tickets.filter(t => 
      t.shopId === ticket.shopId && 
      t.status === "Waiting" && 
      new Date(t.createdAt).getTime() < new Date(ticket.createdAt).getTime()
    ).length;
    return { estimatedWaitTime: (waitingBefore + 1) * avgTime };
  };

  const activePlaces = useMemo(() => places.filter((p: Place) => p.status === "Active"), [places]);
  const shopOptions: SearchOption<Place>[] = useMemo(() => {
    return activePlaces.map((shop: Place) => ({ 
      id: shop.id, 
      label: shop.name, 
      subLabel: `${shop.branch}`, 
      originalData: shop 
    }));
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

  const columns: Column<Ticket>[] = [
    { header: "QUEUE NO", key: "id", className: "w-[15%] text-left font-bold text-indigo-600 uppercase" },
    { header: "CUSTOMER", key: "name", className: "w-[25%] text-left", render: (row) => (<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={14} /></div><div><p className="font-bold text-slate-800 text-sm">{row.name}</p><p className="text-[11px] text-slate-400 font-medium">Guests: {row.guests}</p></div></div>) },
    { header: "SHOP NAME", key: "shopId", className: "w-[20%] text-left text-slate-700 font-medium text-sm", render: (row) => { const shop = places.find((p: Place) => p.id === row.shopId); return <span>{shop ? shop.name : "Unknown"}</span>; } },
    { header: "EST. WAIT", key: "waitTime", className: "w-[15%] text-left", render: (row) => { const { estimatedWaitTime } = getQueueDetails(row); return (<div className="flex items-center gap-2 text-slate-500 font-medium"><Clock size={14} className={estimatedWaitTime > 30 ? "text-amber-500" : "text-emerald-500"} /><span className="text-xs">{estimatedWaitTime} mins</span></div>); } },
    { header: "STATUS", key: "status", className: "w-[15%] text-center", render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div> },
    {
      header: "ACTIONS", key: "actions", className: "w-[10%] text-right",
      render: (row) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Call / Serving", icon: <PlayCircle size={16} />, className: "text-blue-600", onClick: () => handleStatusChange(row.id, "Serving") },
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => handleStatusChange(row.id, "Completed") },
            { label: "Cancel Ticket", icon: <XCircle size={16} />, className: "text-amber-600", divider: true, onClick: () => handleStatusChange(row.id, "Cancelled") },
            { label: "Delete Ticket", icon: <Trash2 size={16} />, className: "text-rose-600", divider: true, onClick: () => handleDelete(row.id) },
          ]}
        />
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> Status: {statusFilter} <ChevronDown size={14} className="ml-2 text-slate-400"/></button>}
          items={[
            {label: "All Status", onClick: () => setStatusFilter("All")},
            {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
            {label: "Serving", onClick: () => setStatusFilter("Serving")},
            {label: "Completed", onClick: () => setStatusFilter("Completed")},
            {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
          ]}
        />
        <button onClick={() => setIsPanelOpen(true)} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all">
          <Plus size={16} /> Add Walk-in
        </button>
      </div>

      {loading && tickets.length === 0 ? (
        <p className="text-center py-10 text-slate-400">Loading live queue...</p>
      ) : (
        <>
          <Table data={currentData} columns={columns} emptyMessage={`No ${statusFilter.toLowerCase()} tickets found.`} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}

      <SidePanelEdit isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="New Walk-in Queue">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Form Fields เหมือนเดิม (ปรับให้สั้นลง) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase block">Customer Name</label>
              <Controller control={control} name="customerName" render={({ field }) => (
                <input {...field} placeholder="Enter name..." className={`w-full px-4 py-3 border ${errors.customerName ? "border-rose-400" : "border-slate-200"} rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]`} />
              )} />
              {errors.customerName && <p className="text-xs text-rose-500">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-3">
              <Controller control={control} name="selectedShopOption" render={({ field }) => (
                <SearchSelect label="Select Shop" options={shopOptions} value={field.value as any} onChange={field.onChange} />
              )} />
              {errors.selectedShopOption && <p className="text-xs text-rose-500">กรุณาเลือกร้านค้า</p>}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase block">Number of Pax</label>
              <Controller control={control} name="pax" render={({ field }) => (
                <input type="number" min="1" value={field.value} onChange={e => field.onChange(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5AB2A8]" />
              )} />
            </div>

            <button type="submit" className="w-full py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg mt-4 transition-all">Create Ticket</button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}