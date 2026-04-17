import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { setBookings, addBooking, updateBookingStatus, updateBookingDetails, deleteBooking } from "../redux/bookingSlice";
import { Plus, Clock, CheckCircle2, XCircle, MoreHorizontal, Trash2, User, Mail, CalendarDays, Filter, ChevronDown, Users } from "lucide-react"; 
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
import { API_BASE_URL } from "../config";

const bookingSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").or(z.literal("")), 
  pax: z.number().min(1, "จำนวนลูกค้าต้อง 1 คนขึ้นไป"),
  dateTime: z.string().min(1, "กรุณาเลือกวันและเวลา"),
  selectedShopOption: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.unknown().optional()
  }).nullable().refine(val => val !== null && val.id !== "", "กรุณาเลือกสถานที่")
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingManagement() {
  const dispatch = useDispatch();
  const bookings = useSelector((state: RootState) => state.booking.bookings);
  const allShops = useSelector((state: RootState) => state.places.places);
  const shops = allShops.filter(s => s.status === "Active");
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
 const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Ticket | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", email: "", pax: 1, dateTime: "", selectedShopOption: null }
  });

  // 1. API: GET - ดึงข้อมูลการจองทั้งหมด
  const fetchBookingsFromDB = async () => {
    try {
      // สำหรับ Backend
      const response = await fetch(`${API_BASE_URL}/bookings`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      dispatch(setBookings(data));
    } catch (error) { 
      console.error("Fetch error:", error); 
    }
  };

  useEffect(() => {
    fetchBookingsFromDB();
    const intervalId = setInterval(fetchBookingsFromDB, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // 2. API: POST / PUT - เพิ่มหรือแก้ไขข้อมูลการจอง
  const onSubmit = async (data: BookingFormData) => {
    try {
  const statusValue: TicketStatus = editingBooking ? editingBooking.status : "Waiting";

      const payload = {
        name: data.name,
        email: data.email,
        guests: data.pax,
        shopId: data.selectedShopOption?.id,
        bookDate: data.dateTime.split("T")[0],
        bookTime: data.dateTime.split("T")[1],
        status: statusValue,
        createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString()
      };

      const method = editingBooking ? "PUT" : "POST";
      const url = editingBooking ? `${API_BASE_URL}/bookings/${editingBooking.id}` : `${API_BASE_URL}/bookings`;
      
      // สำหรับ Backend
      const response = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (!response.ok) throw new Error("Save failed");
      const result = await response.json();

      if (editingBooking) {
        dispatch(updateBookingDetails(result));
      } else {
        dispatch(addBooking(result));
      }

      setIsAddPanelOpen(false);
      setEditingBooking(null);
      reset();
    } catch (error) { 
      alert("Error saving booking"); 
    }
  };

  // 3. API: DELETE - ลบข้อมูลการจอง
  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("คุณต้องการลบการจองนี้ใช่หรือไม่?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Delete failed");
      
      dispatch(deleteBooking(id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("ไม่สามารถลบข้อมูลได้");
    }
  };

  const handleEdit = (booking: Ticket) => {
    setEditingBooking(booking);
    const shop = allShops.find(s => s.id === booking.shopId);
    reset({
      name: booking.name,
      email: "", // ใน Mock Data ไม่มีอีเมล ปรับตามโครงสร้างจริงของ Backend
      pax: booking.guests,
      dateTime: `${booking.bookDate}T${booking.bookTime}`,
      selectedShopOption: shop ? { id: shop.id, label: shop.name, subLabel: shop.branch, originalData: shop } : null
    });
    setIsAddPanelOpen(true);
  };

  const shopOptions: SearchOption<Place>[] = useMemo(() => 
    shops.map(s => ({ id: s.id, label: s.name, subLabel: s.branch, originalData: s })), [shops]
  );

  const filteredData = useMemo(() => {
    let result = [...bookings];
    if (statusFilter !== "All") result = result.filter(b => b.status === statusFilter);
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => b.id.toLowerCase().includes(lowerQ) || b.name.toLowerCase().includes(lowerQ));
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, statusFilter, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: TicketStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: "PATCH", // หรือ PUT ตามที่ Backend ออกแบบไว้
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error("Failed to update status");

    // เรียกใช้ updateBookingStatus เพื่อ Update ข้อมูลในหน้าจอทันที
    dispatch(updateBookingStatus({ id, status: newStatus }));
    
  } catch (error) {
    console.error("Update status error:", error);
    alert("ไม่สามารถอัปเดตสถานะได้");
  }
};

  const columns: Column<Ticket>[] = [
    { header: "BOOKING ID", key: "id", className: "w-[15%] font-bold text-indigo-600" },
    { header: "CUSTOMER", key: "name", className: "w-[20%]", render: (row) => (
      <div><p className="font-bold text-slate-800">{row.name}</p><p className="text-xs text-slate-400">{row.guests} Pax</p></div>
    )},
    { header: "STATUS", key: "status", className: "w-[15%] text-center", render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div> },
    { header: "ACTIONS", key: "actions", className: "w-[10%] text-right", render: (row) => (
      <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreHorizontal size={18} />
          </button>
        }
        items={[
          { label: "Edit Booking", icon: <Clock size={16} />, onClick: () => handleEdit(row) },
          //  เรียกใช้ updateBookingStatus และ CheckCircle2
          { label: "Mark Completed", icon: <CheckCircle2 size={16} className="text-emerald-500" />, onClick: () => handleUpdateStatus(row.id, "Completed") },
          //  เรียกใช้ updateBookingStatus และ XCircle
          { label: "Cancel Booking", icon: <XCircle size={16} className="text-rose-500" />, onClick: () => handleUpdateStatus(row.id, "Cancelled") },
          { label: "Delete", icon: <Trash2 size={16} />, className: "text-rose-600", onClick: () => handleDeleteBooking(row.id) }]}
      />
    )
  }
];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex justify-between items-center mb-6">
        <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:bg-slate-50"><Filter size={14}/> Status: {statusFilter} <ChevronDown size={14}/></button>}
          items={[{label: "All Status", onClick: () => setStatusFilter("All")},{label: "Waiting", onClick: () => setStatusFilter("Waiting")},{label: "Completed", onClick: () => setStatusFilter("Completed")},{label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}]}
        />
        <button onClick={() => { setEditingBooking(null); reset(); setIsAddPanelOpen(true); }} className="bg-[#5AB2A8] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-[#4a968d] transition-all"><Plus size={16}/><span>New Booking</span></button>
      </div>

      <Table data={filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} columns={columns} emptyMessage="No bookings found." />
      <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredData.length / itemsPerPage)} onChange={setCurrentPage} />

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title={editingBooking ? "Edit Booking" : "New Booking"}>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Controller control={control} name="name" render={({ field }) => <Input label="Customer Name" icon={<User size={16}/>} {...field} error={errors.name?.message} />} />
            <Controller control={control} name="email" render={({ field }) => <Input label="Email Address" icon={<Mail size={16}/>} {...field} error={errors.email?.message} />} />
            <Controller control={control} name="pax" render={({ field: { onChange, value } }) => <Input label="Number of Pax" type="number" icon={<Users size={16}/>} value={value} onChange={e => onChange(parseInt(e.target.value) || 1)} error={errors.pax?.message} />} />
            <Controller control={control} name="dateTime" render={({ field }) => <Input label="Date & Time" type="datetime-local" icon={<CalendarDays size={16}/>} {...field} error={errors.dateTime?.message} />} />

            <div className="space-y-1">
              <Controller control={control} name="selectedShopOption" render={({ field }) => (
                <SearchSelect label="Select Shop" options={shopOptions} value={field.value} onChange={field.onChange} />
              )} />
              {errors.selectedShopOption && <p className="text-xs text-red-500 mt-1">{errors.selectedShopOption.message as string}</p>}
            </div>

            <button type="submit" className="w-full py-3.5 bg-[#5AB2A8] text-white font-bold rounded-xl shadow-lg mt-4 active:scale-[0.98] transition-all">
              {editingBooking ? "Save Changes" : "Confirm Booking"}
            </button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}