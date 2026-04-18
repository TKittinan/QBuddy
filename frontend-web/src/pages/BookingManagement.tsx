import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchBookings, updateStatusAsync, deleteBooking } from "../redux/Slice/bookingSlice"; 
import { fetchUsers } from "../redux/Slice/userSlice"; 
import { fetchPlaces } from "../redux/Slice/placeSlice"; // 🌟 ต้องมีตัวนี้เพื่อดึงชื่อร้าน
import { Plus, Clock, CheckCircle2, XCircle, MoreHorizontal, Trash2, User, CalendarDays, Filter, ChevronDown, Users, Calendar } from "lucide-react";  
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Column, Place, Ticket, TicketStatus, User as UserType } from "../types";  
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { API_BASE_URL } from "../config";

const bookingSchema = z.object({
  name: z.string().min(1, "ชื่อลูกค้าจะถูกเติมอัตโนมัติ"),
  selectedEmail: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.any().optional()
  }).nullable().refine(val => val !== null && val.id !== "", "กรุณาค้นหาลูกค้าจากระบบ (อีเมล หรือ เบอร์โทร)"),
  selectedPhone: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.any().optional()
  }).nullable(),
  pax: z.number().min(1, "จำนวนลูกค้าต้อง 1 คนขึ้นไป"),
  dateTime: z.string().min(1, "กรุณาเลือกวันและเวลา"),
  tableType: z.string().min(1, "กรุณาเลือกประเภทโต๊ะ"),
  selectedShopOption: z.object({
    id: z.string(), label: z.string(), subLabel: z.string().optional(), originalData: z.any().optional()
  }).nullable().refine(val => val !== null && val.id !== "", "กรุณาเลือกสถานที่")
});

type BookingFormData = z.infer<typeof bookingSchema>;

const isToday = (d: Date) => {
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

const isThisWeek = (d: Date) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const numDay = now.getDate();
  const start = new Date(now);
  start.setDate(numDay - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(numDay + (6 - dayOfWeek));
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

const isThisMonth = (d: Date) => {
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

const getTableMaxPax = (label: string): number => {
  const str = (label || '').toLowerCase();
  if (str.includes('1-2')) return 2;
  if (str.includes('3-4')) return 4;
  if (str.includes('5-6')) return 6;
  if (str.includes('7-8')) return 8;
  if (str.includes('10+')) return 999;
  return 999; 
};

export default function BookingManagement() {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector((state) => state.booking);
  
  const allShops = useAppSelector((state) => state.places.places);
  const shops = useMemo(() => allShops.filter(s => s.status === "Active"), [allShops]);

  const { users: allUsers } = useAppSelector((state) => state.users);
  
  const context = useOutletContext<{ searchQuery: string } | null>();
  const searchQuery = context?.searchQuery || "";

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [timeFilter, setTimeFilter] = useState<"All" | "Today" | "Week" | "Month">("All"); 
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Ticket | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>("");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPlaces()); // 🌟 สำคัญ: ต้องโหลดร้านค้าทั้งหมดมาเก็บไว้ใน Store
  }, [dispatch]);

  useEffect(() => {
    if (shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0].id);
    }
  }, [shops, selectedShopId]);

  useEffect(() => {
    if (selectedShopId) {
      dispatch(fetchBookings(selectedShopId));
      const intervalId = setInterval(() => dispatch(fetchBookings(selectedShopId)), 30000);
      return () => clearInterval(intervalId);
    }
  }, [dispatch, selectedShopId]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", selectedEmail: null, selectedPhone: null, pax: 1, dateTime: "", tableType: "", selectedShopOption: null }
  });

  const watchedShop = useWatch({ control, name: "selectedShopOption" });
  const watchedDateTime = useWatch({ control, name: "dateTime" });
  const watchedPax = useWatch({ control, name: "pax" });
  const currentTableType = useWatch({ control, name: "tableType" });

  const availableTableTypes = useMemo(() => {
    if (!watchedShop || !watchedShop.id) return [];
    
    const shopData = allShops.find(s => s.id === watchedShop.id);
    const tables = (shopData as any)?.TableType || shopData?.tableTypes || [];
    const selectedDate = watchedDateTime ? watchedDateTime.split("T")[0] : "";

    return tables.map((table: any) => {
      const tableName = table.label || table.name;
      
      const bookedCount = bookings.filter(b => 
        (b.placeId === watchedShop.id) && // 🌟 ตรวจสอบด้วย placeId
        b.tableType === tableName &&
        b.bookDate === selectedDate &&
        (b.status === "Waiting" || b.status === "Serving")
      ).length;

      const isEditingThisTable = editingBooking?.tableType === tableName && editingBooking?.bookDate === selectedDate;
      const isFull = selectedDate ? (bookedCount >= table.capacity && !isEditingThisTable) : false;

      return {
        id: table.id || tableName,
        label: tableName,
        capacity: table.capacity,
        booked: bookedCount,
        isFull
      };
    });
  }, [watchedShop, watchedDateTime, allShops, bookings, editingBooking]);

  useEffect(() => {
    if (availableTableTypes.length > 0 && watchedPax) {
      type TableInfo = typeof availableTableTypes[0];
      type TableWithMax = TableInfo & { maxPax: number };

      const tablesWithMaxPax: TableWithMax[] = availableTableTypes.map((t: TableInfo) => ({
        ...t,
        maxPax: getTableMaxPax(t.label)
      }));

      const sortedTables = tablesWithMaxPax.sort((a: TableWithMax, b: TableWithMax) => a.maxPax - b.maxPax);
      let matchedTable = sortedTables.find((t: TableWithMax) => t.maxPax >= watchedPax);
      if (!matchedTable) {
        matchedTable = sortedTables[sortedTables.length - 1];
      }

      if (matchedTable && currentTableType !== matchedTable.label) {
        setValue("tableType", matchedTable.label, { shouldValidate: true });
      }
    } else if (availableTableTypes.length === 0 && currentTableType !== "") {
      setValue("tableType", "");
    }
  }, [watchedPax, availableTableTypes, setValue, currentTableType]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const statusValue: TicketStatus = editingBooking ? editingBooking.status : "Waiting";
      const payload = {
        name: data.name,
        email: data.selectedEmail?.label, 
        guests: data.pax,
        placeId: data.selectedShopOption?.id, // 🌟 ส่งไปเป็น placeId ตามความต้องการของ Service
        service: "ร้านอาหาร", 
        tableType: data.tableType,
        bookDate: data.dateTime.split("T")[0],
        bookTime: data.dateTime.split("T")[1],
        status: statusValue,
      };

      if (editingBooking) {
        await axios.put(`${API_BASE_URL}/tickets/${editingBooking.id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/tickets`, payload);
      }
      
      if (data.selectedShopOption?.id) {
        dispatch(fetchBookings(data.selectedShopOption.id));
        setSelectedShopId(data.selectedShopOption.id);
      }
      
      setIsAddPanelOpen(false);
      reset();
      alert("ดำเนินการสำเร็จ");
    } catch (error: any) { 
      alert("Error: " + (error.response?.data?.message || error.message)); 
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TicketStatus) => {
    await dispatch(updateStatusAsync({ id, status: newStatus }));
    if (selectedShopId) dispatch(fetchBookings(selectedShopId));
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm("คุณต้องการลบการจองนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`${API_BASE_URL}/tickets/${id}`);
        dispatch(deleteBooking(id));
        if (selectedShopId) dispatch(fetchBookings(selectedShopId));
      } catch (error: any) {
        alert("ลบข้อมูลไม่สำเร็จ: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (booking: Ticket) => {
    setEditingBooking(booking);
    const shop = allShops.find(s => s.id === booking.placeId);
    const user = allUsers?.find(u => u.email === booking.email);
    
    reset({
      name: booking.name,
      pax: booking.guests,
      dateTime: `${booking.bookDate}T${booking.bookTime}`,
      tableType: booking.tableType || "",
      selectedShopOption: shop ? { id: shop.id, label: shop.name, subLabel: shop.branch, originalData: shop } : null,
      selectedEmail: user 
        ? { id: user.id, label: user.email, subLabel: user.name, originalData: user } 
        : (booking.email ? { id: "temp", label: booking.email, subLabel: booking.name } : null),
      selectedPhone: (user && user.phone)
        ? { id: user.id, label: user.phone, subLabel: user.name, originalData: user }
        : null
    });
    setIsAddPanelOpen(true);
  };

  const shopOptions: SearchOption<Place>[] = useMemo(() => 
    shops.map(s => ({ id: s.id, label: s.name, subLabel: s.branch, originalData: s })), [shops]
  );

  const emailOptions: SearchOption<UserType>[] = useMemo(() => 
    (allUsers || []).map(u => ({ id: u.id, label: u.email, subLabel: u.name, originalData: u })), [allUsers]
  );

  const phoneOptions: SearchOption<UserType>[] = useMemo(() => 
    (allUsers || []).filter(u => u.phone).map(u => ({ id: u.id, label: u.phone!, subLabel: u.name, originalData: u })), [allUsers]
  );

  const filteredData = useMemo(() => {
    let result = [...bookings];
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (timeFilter !== "All") {
      result = result.filter(b => {
        const d = b.bookDate ? new Date(b.bookDate) : new Date(b.createdAt);
        if (timeFilter === "Today") return isToday(d);
        if (timeFilter === "Week") return isThisWeek(d);
        if (timeFilter === "Month") return isThisMonth(d);
        return true;
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(b => b.status === statusFilter);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.id && b.id.toLowerCase().includes(lowerQ)) || 
        (b.name && b.name.toLowerCase().includes(lowerQ))
      );
    }
    return result;
  }, [bookings, statusFilter, timeFilter, searchQuery]);

  const columns: Column<Ticket>[] = [
    { 
      header: "QUEUE NO", 
      key: "id", 
      className: "w-[15%] font-black text-[#5AB2A8] pl-4 uppercase" 
    },
    { 
      header: "CUSTOMER", 
      key: "name", 
      className: "w-[30%]", 
      render: (row) => (
        <div className="flex flex-col">
          <p className="font-bold text-slate-800">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-slate-400">
            <Users size={12} className="text-slate-300"/>
            <span>{row.guests} Pax ({row.tableType || "General"})</span>
          </div>
        </div>
      )
    },
    { 
      header: "SHOP NAME", 
      key: "placeId", // 🌟 ใช้ placeId เป็น key
      className: "w-[25%] text-left text-slate-700 font-medium text-sm", 
      render: (row) => { 
        // 🌟 ค้นหาชื่อร้านค้าจาก allShops โดยใช้ placeId
        const shop = allShops.find((p: Place) => p.id === row.placeId); 
        return <span>{shop ? shop.name : "Unknown"}</span>; 
      }
    },
    { 
      header: "STATUS", 
      key: "status", 
      className: "w-[15%] text-center", 
      render: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ) 
    },
    { 
      header: "ACTIONS", 
      key: "actions", 
      className: "w-[15%] text-right pr-6", 
      render: (row) => (
        <div className="flex justify-end">
          <Dropdown align="right" trigger={<button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"><MoreHorizontal size={18} /></button>}
            items={[
              { label: "Edit Booking", icon: <Clock size={16} />, onClick: () => handleEdit(row) },
              { label: "Mark Serving", icon: <CheckCircle2 size={16} className="text-blue-500" />, onClick: () => handleUpdateStatus(row.id, "Serving") },
              { label: "Mark Completed", icon: <CheckCircle2 size={16} className="text-emerald-500" />, onClick: () => handleUpdateStatus(row.id, "Completed") },
              { label: "Cancel Booking", icon: <XCircle size={16} className="text-rose-500" />, onClick: () => handleUpdateStatus(row.id, "Cancelled") },
              { label: "Delete", icon: <Trash2 size={16} />, className: "text-rose-600", onClick: () => handleDeleteBooking(row.id) }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar size={15} />
            </div>
            <select 
              value={timeFilter} 
              onChange={(e) => { setTimeFilter(e.target.value as any); setCurrentPage(1); }}
              className="appearance-none pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none hover:border-[#5AB2A8] focus:ring-4 focus:ring-teal-50 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter size={15} />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="appearance-none pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 outline-none hover:border-[#5AB2A8] focus:ring-4 focus:ring-teal-50 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Waiting">Waiting</option>
              <option value="Serving">Serving</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <button 
          onClick={() => { 
            setEditingBooking(null); 
            reset({ 
              name: "", 
              selectedEmail: null, 
              selectedPhone: null,
              pax: 1, 
              dateTime: "", 
              tableType: "",
              selectedShopOption: null 
            }); 
            setIsAddPanelOpen(true); 
          }} 
          className="bg-[#5AB2A8] text-white px-7 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#4a968d] transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={3}/><span>New Booking</span>
        </button>
      </div>

      <div className="relative bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-[#5AB2A8]">Loading Tickets...</div>}
        <Table data={filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} columns={columns} emptyMessage={selectedShopId ? (searchQuery ? "ไม่พบผลลัพธ์การค้นหา" : "ไม่มีข้อมูลการจองในหมวดหมู่นี้") : "กรุณาเลือกร้านค้า"} />
      </div>
      
      {filteredData.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredData.length / itemsPerPage)} onChange={setCurrentPage} />
        </div>
      )}

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title={editingBooking ? "Edit Booking" : "New Booking"}>
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 relative">
              <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black tracking-widest text-slate-400 uppercase rounded-full border border-slate-100">Customer Identity</span>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Controller control={control} name="selectedEmail" render={({ field }) => (
                    <SearchSelect 
                      label="Search Email" 
                      placeholder="ค้นหาด้วยอีเมล..." 
                      options={emailOptions} 
                      value={field.value} 
                      onChange={(selected) => {
                        field.onChange(selected);
                        if (selected && selected.originalData) {
                          setValue("name", selected.originalData.name);
                          const matchedPhone = phoneOptions.find(p => p.id === selected.id);
                          setValue("selectedPhone", matchedPhone || null);
                        } else {
                          setValue("name", "");
                          setValue("selectedPhone", null);
                        }
                      }} 
                    />
                  )} />
                </div>

                <div>
                  <Controller control={control} name="selectedPhone" render={({ field }) => (
                    <SearchSelect 
                      label="Search Phone" 
                      placeholder="หรือ ค้นหาด้วยเบอร์โทรศัพท์..." 
                      options={phoneOptions} 
                      value={field.value} 
                      onChange={(selected) => {
                        field.onChange(selected);
                        if (selected && selected.originalData) {
                          setValue("name", selected.originalData.name);
                          const matchedEmail = emailOptions.find(e => e.id === selected.id);
                          setValue("selectedEmail", matchedEmail || null);
                        } else {
                          setValue("name", "");
                          setValue("selectedEmail", null);
                        }
                      }} 
                    />
                  )} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <Controller control={control} name="name" render={({ field }) => (
                  <div className="opacity-70 pointer-events-none">
                    <Input label="Customer Name (Auto-filled)" icon={<User size={16}/>} {...field} readOnly error={errors.name?.message} />
                  </div>
                )} />
              </div>
            </div>
            
            <div className="space-y-1">
              <Controller control={control} name="selectedShopOption" render={({ field }) => (
                <SearchSelect 
                  label="1. Select Shop" 
                  placeholder="พิมพ์เพื่อค้นหาสาขา..." 
                  options={shopOptions} 
                  value={field.value} 
                  onChange={(val) => {
                    field.onChange(val);
                    setValue("tableType", ""); 
                  }} 
                />
              )} />
              {errors.selectedShopOption && <p className="text-xs text-red-500 mt-1">{errors.selectedShopOption.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller control={control} name="pax" render={({ field: { onChange, value } }) => (
                <Input label="2. Number of Pax" type="number" icon={<Users size={16}/>} value={value} onChange={e => onChange(parseInt(e.target.value) || 1)} error={errors.pax?.message} />
              )} />
              
              <Controller control={control} name="dateTime" render={({ field }) => (
                <Input label="3. Date & Time" type="datetime-local" icon={<CalendarDays size={16}/>} {...field} error={errors.dateTime?.message} />
              )} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">4. Table Type (Auto-selected)</label>
              <select 
                {...control.register("tableType")}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none text-slate-600 transition-all cursor-not-allowed"
              >
                {!watchedShop ? (
                  <option value="">-- กรุณาเลือกร้านค้าก่อน --</option>
                ) : !watchedDateTime ? (
                  <option value="">-- กรุณาเลือกวันและเวลาก่อน --</option>
                ) : availableTableTypes.length === 0 ? (
                  <option value="">-- ร้านนี้ยังไม่มีข้อมูลโต๊ะ --</option>
                ) : (
                  <option value="">-- กำลังคำนวณโต๊ะ --</option>
                )}
                
                {availableTableTypes.map((type: any) => (
                  <option 
                    key={type.id} 
                    value={type.label} 
                  >
                    {type.label} {type.isFull ? "(คิวเต็มแล้ว)" : `(ว่าง ${type.capacity - type.booked} โต๊ะ)`}
                  </option>
                ))}
              </select>
              {errors.tableType && <p className="text-xs text-red-500 mt-1">{errors.tableType.message as string}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-[#5AB2A8] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg mt-6 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-[#4a968d]">
              {editingBooking ? "Save Changes" : "Confirm Booking"}
            </button>
          </form>
        </div>
      </SidePanelEdit>
    </div>
  );
}