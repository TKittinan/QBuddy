import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addBooking, updateBookingStatus, updateBookingDetails, deleteBooking } from "../redux/bookingSlice";
import { Plus, Clock, CheckCircle2, XCircle, MoreHorizontal, Edit, Trash2, User, Users, Mail, MapPin, CalendarDays, Filter, ChevronDown } from "lucide-react"; 
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Column, Place, Ticket, TicketStatus } from "../types"; 

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bookingSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  email: z.string().optional(), 
  pax: z.number().min(1, "จำนวนลูกค้าต้อง 1 คนขึ้นไป"),
  dateTime: z.string().min(1, "กรุณาเลือกวันและเวลา").refine(val => new Date(val) >= new Date(), "ไม่สามารถเลือกเวลาที่ผ่านมาแล้วได้"),
  selectedShopOption: z.object({
    id: z.string(),
    label: z.string(),
    subLabel: z.string().optional(),
    originalData: z.unknown().optional()
  }).nullable().refine(val => val !== null && val.id !== "", "กรุณาเลือกสถานที่")
});

type BookingFormData = z.infer<typeof bookingSchema>;

const defaultValues: BookingFormData = {
  name: "", email: "", pax: 1, dateTime: "", selectedShopOption: null
};

const formatDateTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || !timeStr) return "-";
  const d = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(d.getTime())) return `${dateStr} ${timeStr}`;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const getCurrentDateTimeLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function BookingManagement() {
  const dispatch = useDispatch();
  const bookings = useSelector((state: RootState) => state.booking.bookings);
  const allShops = useSelector((state: RootState) => state.places.places);
  const shops = allShops.filter(s => s.status === "Active");
  
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Ticket | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
    mode: "onChange"
  });

  const fetchBookingsFromDB = async () => {
    try {
      console.log("Fetching real-time bookings from DB...");
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookingsFromDB();
    const intervalId = setInterval(fetchBookingsFromDB, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const shopOptions: SearchOption[] = useMemo(() => {
    return shops.map(shop => ({
      id: shop.id, label: shop.name, subLabel: `${shop.placeId}`, originalData: shop
    }));
  }, [shops]);

  const handleOpenAdd = () => {
    reset(defaultValues);
    setIsAddPanelOpen(true);
  };

  const handleEditClick = (item: Ticket) => {
    setEditingBooking(item); 
    const shop = shops.find(s => s.id === item.shopId);
    let dt = (item.bookDate && item.bookTime) ? `${item.bookDate}T${item.bookTime}` : "";

    reset({
      name: item.name,
      email: "", 
      pax: item.guests || 1,
      dateTime: dt,
      selectedShopOption: shop 
        ? { id: shop.id, label: shop.name, subLabel: `${shop.placeId}`, originalData: shop }
        : { id: item.shopId, label: "Unknown Shop", subLabel: "Inactive", originalData: { id: item.shopId, name: "Unknown Shop" } }
    });
  };

  const onSubmit = (data: BookingFormData) => {
    const selectedOption = data.selectedShopOption!;
    const shopData = selectedOption.originalData as Place;
    const shopId = selectedOption.id;
    const bDate = data.dateTime.split('T')[0];
    const bTime = data.dateTime.split('T')[1];

    if (isAddPanelOpen) {
      const samePlaceBookings = bookings.filter(b => b.shopId === shopId);
      const maxQueue = samePlaceBookings.reduce((max, b) => {
        const num = parseInt(b.id.split('-').pop() || "0") || 0; 
        return num > max ? num : max;
      }, 0);
      const nextQ = maxQueue + 1;
      const ticketId = `BK-${shopId}-${String(nextQ).padStart(3, '0')}`;

      const newBooking: Ticket = {
        id: ticketId, shopId, name: data.name, service: shopData.category || "General",
        guests: data.pax, bookDate: bDate, bookTime: bTime, status: "Waiting", createdAt: new Date().toISOString(),
      };
      dispatch(addBooking(newBooking));
      setIsAddPanelOpen(false);
    } else if (editingBooking) {
      dispatch(updateBookingDetails({ 
        id: editingBooking.id, name: data.name, guests: data.pax, bookDate: bDate, bookTime: bTime, shopId, service: shopData.category || editingBooking.service
      }));
      setEditingBooking(null);
    }
  };

  const updateStatus = (id: string, newStatus: TicketStatus) => {
    dispatch(updateBookingStatus({ id, status: newStatus }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) { dispatch(deleteBooking(id)); }
  };

  const filteredData = useMemo(() => {
    let result = [...bookings];
    if (statusFilter !== "All") result = result.filter(b => b.status === statusFilter);
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => b.id.toLowerCase().includes(lowerQ) || b.name.toLowerCase().includes(lowerQ));
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [bookings, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  const columns: Column<Ticket>[] = [
    { header: "BOOKING ID", key: "id", className: "w-[15%] text-left font-bold text-slate-500 text-xs uppercase" },
    { header: "CUSTOMER", key: "name", className: "w-[20%] text-left", render: (item) => (
        <div><p className="font-bold text-slate-800 text-sm">{item.name}</p><p className="text-[11px] text-slate-400 font-medium">Guests: {item.guests}</p></div>
      )
    },
    { header: "PLACE NAME", key: "shopId", className: "w-[15%] text-left text-slate-700 font-medium text-sm", render: (item) => {
        const shop = allShops.find(s => s.id === item.shopId);
        return <span>{shop?.name || "Unknown Place"}</span>;
    }},
    { header: "DATE / TIME", key: "dateTime", className: "w-[20%] text-left", render: (item) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium"><Clock size={14} className="text-slate-400 shrink-0" /><span className="text-xs">{formatDateTime(item.bookDate, item.bookTime)}</span></div>
      )
    },
    { header: "STATUS", key: "status", className: "w-[15%] text-center", render: (item) => (<div className="flex justify-center"><StatusBadge status={item.status} /></div>) },
    { header: "ACTIONS", key: "actions", className: "w-[10%] text-right", render: (item) => (
        <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => updateStatus(item.id, "Completed") },
            { label: "Mark Cancelled", icon: <XCircle size={16} />, className: "text-rose-600", divider: true, onClick: () => updateStatus(item.id, "Cancelled") },
            { label: "Edit Booking", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
            { label: "Delete Booking", icon: <Trash2 size={16} />, className: "text-rose-600", divider: true, onClick: () => handleDelete(item.id) },
          ]}
        />
      )},
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      
      {/* 🌟 Top Bar: Filter ซ้าย | ปุ่ม Add ขวา */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
          items={[
            {label: "All Status", onClick: () => setStatusFilter("All")},
            {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
            {label: "Completed", onClick: () => setStatusFilter("Completed")},
            {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
          ]}
        />

        <button onClick={handleOpenAdd} className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg shadow-teal-100 flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16} /> 
          <span>New Booking</span>
        </button>
      </div>

      <Table data={currentData} columns={columns} emptyMessage="No bookings match your criteria." />
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isAddPanelOpen || !!editingBooking} onClose={() => { setIsAddPanelOpen(false); setEditingBooking(null); }} title={editingBooking ? "Edit Booking" : "New Booking"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {editingBooking && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="flex items-center gap-2 text-slate-500 mb-1"><MapPin size={16} /> <span className="text-sm font-bold">Ticket Details</span></div>
                <p className="text-xs text-slate-400">ID: <span className="font-bold text-[#5AB2A8]">{editingBooking.id}</span></p>
              </div>
            )}

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</h4>
            <div className="space-y-4">
              <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                <div><Input label="Full Name" icon={<User size={16} />} type="text" value={value} onChange={onChange} placeholder="Enter customer name..." className={`bg-slate-50 ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
              )}/>
              <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                <div><Input label="Email Address (Optional)" icon={<Mail size={16} />} type="email" value={value} onChange={onChange} placeholder="name@example.com" className={`bg-slate-50 ${errors.email ? 'border-red-400' : ''}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}</div>
              )}/>
            </div>

            <div className="h-px w-full bg-slate-100 my-6"></div>
            
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appointment Details</h4>
            <div className="space-y-4">
              <Controller control={control} name="selectedShopOption" render={({ field: { onChange, value } }) => (
                <div><SearchSelect label="Select Place" placeholder={shops.length === 0 ? "No active places available" : "Search for a place..."} options={shopOptions} value={value as SearchOption<unknown> | null} onChange={onChange} />
                {errors.selectedShopOption && <p className="text-xs text-red-500 mt-1">{errors.selectedShopOption.message as string}</p>}</div>
              )}/>

              <Controller control={control} name="pax" render={({ field: { onChange, value } }) => (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Number of Guests</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Users size={18} /></div>
                    <input type="number" value={value} min="1" onChange={e => onChange(parseInt(e.target.value) || 1)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none" />
                  </div>
                </div>
              )}/>
              
              <Controller control={control} name="dateTime" render={({ field: { onChange, value } }) => (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarDays size={18} /></div>
                    <input type="datetime-local" value={value} min={getCurrentDateTimeLocal()} onChange={onChange} className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.dateTime ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none`} />
                  </div>
                  {errors.dateTime && <p className="text-xs text-red-500 mt-1">{errors.dateTime.message}</p>}
                </div>
              )}/>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <button type="submit" className="w-full flex flex-row items-center justify-center gap-2 py-3.5 bg-[#5AB2A8] hover:bg-[#4a968d] text-white font-bold rounded-xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98] whitespace-nowrap">
                <CheckCircle2 size={20} /> 
                <span>{editingBooking ? "Update Booking" : "Confirm Booking"}</span>
              </button>
            </div>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}