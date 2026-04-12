import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/Reduxindex";
import { addBooking, updateBookingStatus, updateBookingDetails, deleteBooking, type Booking, type BookingStatus } from "../redux/bookingSlice";
import { Plus, ChevronDown, Clock, CheckCircle2, XCircle, BarChart2, Hourglass, Timer, MoreHorizontal, Edit, Trash2, User, Mail, MapPin, CalendarDays, RefreshCcw } from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import { Status } from "../components/ui/Status";
import type { Column } from "../types";

// นำเข้า CATEGORY_LIST มาใช้ทำ Dropdown
import { CATEGORY_LIST } from "../components/ui/CategorySelect"; 

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
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
  // ดึงข้อมูลร้านค้าทั้งหมดมาเพื่อใช้เช็ค Category
  const allShops = useSelector((state: RootState) => state.places.places);
  const shops = allShops.filter(s => s.status === "Active");
  const autoCancelMins = useSelector((state: RootState) => parseInt(state.settings.autoCancelMins, 10));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");
  // เพิ่ม State สำหรับ Category Filter
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addDateTime, setAddDateTime] = useState("");
  const [selectedShopOption, setSelectedShopOption] = useState<SearchOption | null>(null);

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDateTime, setEditDateTime] = useState("");
  const [editSelectedShopOption, setEditSelectedShopOption] = useState<SearchOption | null>(null);

  const loadData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500); 
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      bookings.forEach(b => {
        if (b.status === "Waiting") {
          const bookingTime = new Date(b.dateTime).getTime();
          const cancelTime = bookingTime + (autoCancelMins * 60 * 1000);
          if (now > cancelTime) {
            dispatch(updateBookingStatus({ id: b.id, status: "Cancelled" }));
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [bookings, autoCancelMins, dispatch]);

  const shopOptions: SearchOption[] = useMemo(() => {
    return shops.map(shop => ({
      id: shop.id, label: shop.name, subLabel: `${shop.placeId}`, originalData: shop
    }));
  }, [shops]);

  const handleConfirmAdd = () => {
    if (!addName || !addEmail || !addDateTime || !selectedShopOption) { alert("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    if (new Date(addDateTime) < new Date()) { alert("ไม่สามารถเลือกวันและเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาใหม่"); return; }

    const shopData = selectedShopOption.originalData;
    const shopId = shopData.id;
    const samePlaceBookings = bookings.filter(b => b.placeId === shopId);
    const maxQueue = samePlaceBookings.reduce((max, b) => {
      const num = parseInt(b.queueNo.replace(/\D/g, '')) || 0; 
      return num > max ? num : max;
    }, 0);

    const nextQ = maxQueue + 1;
    const queueString = `Q-${String(nextQ).padStart(3, '0')}`;
    const bookingString = `BK-${shopId}-${String(nextQ).padStart(3, '0')}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      bookingId: bookingString,
      user: { name: addName, email: addEmail },
      placeId: shopId,
      placeName: shopData.name,
      queueNo: queueString,
      dateTime: addDateTime,
      status: "Waiting",
      createdAt: new Date().toISOString(),
    };

    dispatch(addBooking(newBooking));
    
    setAddName(""); setAddEmail(""); setAddDateTime(""); setSelectedShopOption(null); setIsAddPanelOpen(false);
  };

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    dispatch(updateBookingStatus({ id, status: newStatus }));
  };

  const handleEditClick = (item: Booking) => {
    setEditingBooking(item); 
    setEditName(item.user.name); 
    setEditEmail(item.user.email); 
    setEditDateTime(item.dateTime);

    const shop = shops.find(s => s.id === item.placeId);
    if (shop) {
      setEditSelectedShopOption({
        id: shop.id, label: shop.name, subLabel: `${shop.placeId}`, originalData: shop
      });
    } else {
      setEditSelectedShopOption({
        id: item.placeId, label: item.placeName, subLabel: "Inactive", originalData: { id: item.placeId, name: item.placeName }
      });
    }
  };

  const handleConfirmEdit = () => {
    if (!editingBooking) return;
    if (!editSelectedShopOption) { alert("กรุณาเลือกสถานที่"); return; }
    if (new Date(editDateTime) < new Date()) { alert("ไม่สามารถเลือกวันและเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาใหม่"); return; }

    let newPlaceId = editingBooking.placeId;
    let newPlaceName = editingBooking.placeName;
    let newQueueNo = editingBooking.queueNo;
    let newBookingId = editingBooking.bookingId;

    if (editSelectedShopOption.id !== editingBooking.placeId) {
      newPlaceId = editSelectedShopOption.id;
      newPlaceName = editSelectedShopOption.label;

      const samePlaceBookings = bookings.filter(b => b.placeId === newPlaceId);
      const maxQueue = samePlaceBookings.reduce((max, b) => {
        const num = parseInt(b.queueNo.replace(/\D/g, '')) || 0;
        return num > max ? num : max;
      }, 0);

      const nextQ = maxQueue + 1;
      newQueueNo = `Q-${String(nextQ).padStart(3, '0')}`;
      newBookingId = `BK-${newPlaceId}-${String(nextQ).padStart(3, '0')}`;
    }

    dispatch(updateBookingDetails({ 
      id: editingBooking.id, 
      user: { name: editName, email: editEmail }, 
      dateTime: editDateTime,
      placeId: newPlaceId,
      placeName: newPlaceName,
      queueNo: newQueueNo,
      bookingId: newBookingId
    }));
    
    setEditingBooking(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      dispatch(deleteBooking(id));
    }
  };

  const filteredData = useMemo(() => {
    let result = [...bookings];
    
    if (statusFilter !== "All") {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // ลอจิกกรองด้วย Category โดยไปค้นหาจากข้อมูลร้านค้าทั้งหมด (allShops)
    if (categoryFilter !== "All") {
      result = result.filter(b => {
        const shop = allShops.find(s => s.id === b.placeId);
        return shop?.categories?.includes(categoryFilter);
      });
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => b.bookingId.toLowerCase().includes(lowerQ) || b.user.name.toLowerCase().includes(lowerQ) || b.user.email.toLowerCase().includes(lowerQ) || b.placeName.toLowerCase().includes(lowerQ));
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [bookings, statusFilter, categoryFilter, searchQuery, allShops]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // เพิ่ม categoryFilter เข้าไปใน useEffect Dependency
  useEffect(() => { setCurrentPage(1); }, [statusFilter, categoryFilter, searchQuery, bookings.length]);

  const stats = useMemo(() => {
    const waiting = bookings.filter(b => b.status === "Waiting").length;
    return { total: bookings.length, waiting: waiting };
  }, [bookings]);

  const columns: Column<Booking>[] = [
    { header: "BOOKING ID", key: "bookingId", className: "w-[15%] text-left font-bold text-slate-500 text-xs uppercase" },
    { header: "USER", key: "user", className: "w-[20%] text-left", render: (item) => (
        <div><p className="font-bold text-slate-800 text-sm">{item.user.name}</p><p className="text-[11px] text-slate-400 font-medium">{item.user.email}</p></div>
      )
    },
    { header: "PLACE NAME", key: "placeName", className: "w-[15%] text-left text-slate-700 font-medium text-sm" },
    { header: "QUEUE NO.", key: "queueNo", className: "w-[10%] text-center font-bold text-[#5AB2A8] text-sm" },
    { header: "DATE / TIME", key: "dateTime", className: "w-[15%] text-left", render: (item) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium"><Clock size={14} className="text-slate-400 shrink-0" /><span className="text-xs">{formatDateTime(item.dateTime)}</span></div>
      )
    },
    { header: "STATUS", key: "status", className: "w-[15%] text-center", render: (item) => (<div className="flex justify-center"><Status status={item.status} /></div>) },
    { header: "ACTIONS", key: "id", className: "w-[10%] text-right", render: (item) => (
        <Dropdown align="right" trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => updateStatus(item.id, "Completed") },
            { label: "Mark Cancelled", icon: <XCircle size={16} />, className: "text-rose-600", divider: true, onClick: () => updateStatus(item.id, "Cancelled") },
            { label: "Edit Booking", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
            { label: "Delete Booking", icon: <Trash2 size={16} />, className: "text-slate-400 hover:text-red-600", divider: true, onClick: () => handleDelete(item.id) },
          ]}
        />
      )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* ปรับตรงนี้ให้มี 2 Dropdowns ต่อกัน */}
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<Button variant="outline" className="bg-white shadow-sm flex items-center justify-between min-w-[140px] whitespace-nowrap"><span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></Button>}
            items={[
              {label: "All Status", onClick: () => setStatusFilter("All")},
              {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
              {label: "Completed", onClick: () => setStatusFilter("Completed")},
              {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
            ]}
          />
          <Dropdown align="left" trigger={<Button variant="outline" className="bg-white min-w-[160px] flex items-center justify-between whitespace-nowrap shadow-sm"><span className="font-medium text-slate-600">Category: {categoryFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0" /></Button>} 
            items={[
              { label: "All Categories", onClick: () => setCategoryFilter("All") },
              ...CATEGORY_LIST.map(cat => ({ label: cat, onClick: () => setCategoryFilter(cat) }))
            ]}
          />
        </div>

        <div className="flex flex-row items-center gap-3">
          <Button variant="outline" className="flex flex-row items-center justify-center bg-white shadow-sm border-slate-200 hover:bg-slate-50" onClick={loadData} disabled={isRefreshing}>
            <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? "animate-spin text-teal-500" : "text-slate-600"}`} /> 
            <span className="text-slate-700 font-medium">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
          </Button>
          <Button className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center justify-center gap-2 px-6" onClick={() => setIsAddPanelOpen(true)}>
            <Plus size={18} /> New Booking
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table data={paginatedData} columns={columns} />
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onChange={setCurrentPage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p><h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><BarChart2 size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Waiting List</p><h3 className="text-3xl font-bold text-[#5AB2A8]">{stats.waiting}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#5AB2A8]"><Hourglass size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Avg. Wait Time</p><h3 className="text-3xl font-bold text-slate-800">12m</h3></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Timer size={24} /></div>
        </div>
      </div>

      <SidePanelEdit isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} title="New Booking"
        footer={<button onClick={handleConfirmAdd} className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"><Plus size={18} /> Confirm Booking</button>}
      >
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</h4>
          <div className="space-y-4">
            <Input label="Full Name" icon={<User size={16} />} type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Enter customer name..." className="bg-slate-50" />
            <Input label="Email Address" icon={<Mail size={16} />} type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="name@example.com" className="bg-slate-50" />
          </div>
          <div className="h-px w-full bg-slate-100 my-6"></div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appointment Details</h4>
          <div className="space-y-4">
            <SearchSelect label="Select Place" placeholder={shops.length === 0 ? "No active places available" : "Search for a place..."} options={shopOptions} value={selectedShopOption} onChange={setSelectedShopOption} />
            <div className="space-y-2 pt-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarDays size={18} /></div><input type="datetime-local" value={addDateTime} min={getCurrentDateTimeLocal()} onChange={(e) => setAddDateTime(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none" /></div></div>
          </div>
        </div>
      </SidePanelEdit>

      <SidePanelEdit isOpen={!!editingBooking} onClose={() => setEditingBooking(null)} title="Edit Booking"
        footer={<button onClick={handleConfirmEdit} className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"><CheckCircle2 size={18} /> Update Booking</button>}
      >
        {editingBooking && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <MapPin size={16} /> <span className="text-sm font-bold">{editSelectedShopOption?.label || editingBooking.placeName}</span>
              </div>
              <p className="text-xs text-slate-400">Queue No: <span className="font-bold text-[#5AB2A8]">{editSelectedShopOption?.id !== editingBooking.placeId ? "New Queue (Auto Generate)" : editingBooking.queueNo}</span></p>
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Customer</h4>
            <div className="space-y-4">
              <Input label="Full Name" icon={<User size={16} />} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-50" />
              <Input label="Email Address" icon={<Mail size={16} />} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-slate-50" />
            </div>
            <div className="h-px w-full bg-slate-100 my-6"></div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Appointment</h4>
            <div className="space-y-4">
              <SearchSelect
                label="Select Place"
                placeholder={shops.length === 0 ? "No active places available" : "Search for a place..."}
                options={shopOptions}
                value={editSelectedShopOption}
                onChange={setEditSelectedShopOption}
              />
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarDays size={18} /></div>
                  <input
                    type="datetime-local"
                    value={editDateTime}
                    min={getCurrentDateTimeLocal()}
                    onChange={(e) => setEditDateTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </SidePanelEdit>
    </div>
  );
}