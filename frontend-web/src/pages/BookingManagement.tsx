import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Plus, ChevronDown, Clock, CheckCircle2, XCircle, 
  BarChart2, Hourglass, Timer, MoreHorizontal, Edit, Trash2, User, Mail, MapPin, CalendarDays
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { SidePanelEdit } from "../components/ui/Tabbar/SidePanelEdit";
import { SearchSelect, type SearchOption } from "../components/ui/SearchSelect";
import type { Column } from "../types";

type BookingStatus = "Waiting" | "Completed" | "Cancelled";

type Booking = {
  id: string;
  bookingId: string;
  user: { name: string; email: string };
  placeId: string;
  placeName: string;
  queueNo: string;
  dateTime: string;
  status: BookingStatus;
  createdAt: string;
};

// ฟังก์ชันช่วยจัดรูปแบบวันที่และเวลาให้ดูสวยงาม
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

// 🌟 ฟังก์ชันหาเวลาปัจจุบันในรูปแบบที่ input type="datetime-local" ต้องการ (YYYY-MM-DDTHH:mm)
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shops, setShops] = useState<any[]>([]); 

  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const context = useOutletContext<{ searchQuery: string }>();
  const searchQuery = context?.searchQuery || "";

  // Add Panel States
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addDateTime, setAddDateTime] = useState("");
  const [selectedShopOption, setSelectedShopOption] = useState<SearchOption | null>(null);

  // Edit Panel States
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDateTime, setEditDateTime] = useState("");

  // ==========================================
  // 1. โหลดข้อมูลตอนเปิดหน้าแรก
  // ==========================================
  useEffect(() => {
    const savedBookings = localStorage.getItem("booking_db");
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  // โหลดร้านค้าเฉพาะตอนเปิดแผงจอง (เอาเฉพาะ Active)
  useEffect(() => {
    if (isAddPanelOpen) {
      const savedShops = localStorage.getItem("local_shops_db");
      if (savedShops) {
        const parsedShops = JSON.parse(savedShops);
        const activeShops = parsedShops.filter((s: any) => s.status === "Active");
        setShops(activeShops);
      }
    }
  }, [isAddPanelOpen]);

  const saveBookingsToLocal = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem("booking_db", JSON.stringify(newBookings));
  };

  const shopOptions: SearchOption[] = useMemo(() => {
    return shops.map(shop => ({
      id: shop.id,
      label: shop.name,
      subLabel: `${shop.placeId}`, 
      originalData: shop
    }));
  }, [shops]);

  // ==========================================
  // 2. ฟังก์ชันเพิ่มการจอง (Add Booking)
  // ==========================================
  const handleConfirmAdd = () => {
    if (!addName || !addEmail || !addDateTime || !selectedShopOption) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // 🌟 เช็คว่าเวลาที่เลือกน้อยกว่าเวลาปัจจุบันหรือไม่ (กันเคสพิมพ์ใส่คีย์บอร์ด)
    const selectedDate = new Date(addDateTime);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      alert("ไม่สามารถเลือกวันและเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาใหม่");
      return;
    }

    const shopData = selectedShopOption.originalData;
    const shopId = shopData.id;

    // หารันนิ่งนัมเบอร์ของร้านค้านี้
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

    const updated = [...bookings, newBooking];
    saveBookingsToLocal(updated);
    
    setAddName("");
    setAddEmail("");
    setAddDateTime("");
    setSelectedShopOption(null);
    setIsAddPanelOpen(false);
  };

  // ==========================================
  // 3. ฟังก์ชันอัปเดตและแก้ไขข้อมูล
  // ==========================================
  const updateStatus = (id: string, newStatus: BookingStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    saveBookingsToLocal(updated);
  };

  const handleEditClick = (item: Booking) => {
    setEditingBooking(item);
    setEditName(item.user.name);
    setEditEmail(item.user.email);
    setEditDateTime(item.dateTime);
  };

  const handleConfirmEdit = () => {
    if (!editingBooking) return;

    // 🌟 เช็คเวลาย้อนหลังสำหรับตอนแก้ไขเช่นกัน
    const selectedDate = new Date(editDateTime);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      alert("ไม่สามารถเลือกวันและเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาใหม่");
      return;
    }

    const updated = bookings.map(b => 
      b.id === editingBooking.id 
        ? { ...b, user: { name: editName, email: editEmail }, dateTime: editDateTime } 
        : b
    );
    saveBookingsToLocal(updated);
    setEditingBooking(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      const updated = bookings.filter(b => b.id !== id);
      saveBookingsToLocal(updated);
    }
  };

  // ==========================================
  // 4. การกรอง การค้นหา และแบ่งหน้า
  // ==========================================
  const filteredData = useMemo(() => {
    let result = [...bookings];

    if (statusFilter !== "All") {
      result = result.filter(b => b.status === statusFilter);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.bookingId.toLowerCase().includes(lowerQ) || 
        b.user.name.toLowerCase().includes(lowerQ) ||
        b.user.email.toLowerCase().includes(lowerQ) ||
        b.placeName.toLowerCase().includes(lowerQ)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [bookings, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery, bookings.length]);

  const stats = useMemo(() => {
    const waiting = bookings.filter(b => b.status === "Waiting").length;
    return {
      total: bookings.length,
      waiting: waiting,
    };
  }, [bookings]);

  // ==========================================
  // 5. โครงสร้างคอลัมน์ตาราง
  // ==========================================
  const columns: Column<Booking>[] = [
    { header: "BOOKING ID", key: "bookingId", className: "font-bold text-slate-500 text-xs uppercase" },
    { 
      header: "USER", 
      key: "user",
      render: (item) => (
        <div>
          <p className="font-bold text-slate-800 text-sm">{item.user.name}</p>
          <p className="text-[11px] text-slate-400 font-medium">{item.user.email}</p>
        </div>
      )
    },
    { header: "PLACE NAME", key: "placeName", className: "text-slate-700 font-medium text-sm" },
    { header: "QUEUE NO.", key: "queueNo", className: "font-bold text-[#5AB2A8] text-sm" },
    { 
      header: "DATE / TIME", 
      key: "dateTime",
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs">{formatDateTime(item.dateTime)}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      render: (item) => {
        if (item.status === "Waiting") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Waiting</span>;
        if (item.status === "Completed") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={12} /> Completed</span>;
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100"><XCircle size={12} /> Cancelled</span>;
      },
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item) => (
        <Dropdown 
          align="right"
          trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => updateStatus(item.id, "Completed") },
            { label: "Mark Cancelled", icon: <XCircle size={16} />, className: "text-rose-600", divider: true, onClick: () => updateStatus(item.id, "Cancelled") },
            { label: "Edit Booking", icon: <Edit size={16} />, onClick: () => handleEditClick(item) },
            { label: "Delete Booking", icon: <Trash2 size={16} />, className: "text-slate-400 hover:text-red-600", divider: true, onClick: () => handleDelete(item.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Booking Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage and track all customer appointments</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Dropdown 
            align="left"
            trigger={
              <Button variant="outline" className="bg-white shadow-sm flex items-center justify-between min-w-[140px] whitespace-nowrap">
                <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/>
              </Button>
            }
            items={[
              {label: "All Status", onClick: () => setStatusFilter("All")},
              {label: "Waiting", onClick: () => setStatusFilter("Waiting")},
              {label: "Completed", onClick: () => setStatusFilter("Completed")},
              {label: "Cancelled", onClick: () => setStatusFilter("Cancelled")}
            ]}
          />
        </div>

        <Button 
          className="bg-[#5AB2A8] hover:bg-[#4a968d] text-white shadow-lg flex items-center justify-center gap-2 px-6"
          onClick={() => setIsAddPanelOpen(true)}
        >
          <Plus size={18} /> New Booking
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table data={paginatedData} columns={columns} />
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onChange={setCurrentPage} 
        />
      </div>

      {/* Bottom Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <BarChart2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Waiting List</p>
            <h3 className="text-3xl font-bold text-[#5AB2A8]">{stats.waiting}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#5AB2A8]">
            <Hourglass size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Wait Time</p>
            <h3 className="text-3xl font-bold text-slate-800">12m</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Timer size={24} />
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* 🟢 Panel สร้างการจอง (Add Booking) */}
      {/* ======================================= */}
      <SidePanelEdit
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        title="New Booking"
        footer={
          <button 
            onClick={handleConfirmAdd}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> Confirm Booking
          </button>
        }
      >
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</h4>
          <div className="space-y-4">
            <Input 
              label="Full Name" icon={<User size={16} />} type="text" 
              value={addName} onChange={(e) => setAddName(e.target.value)}
              placeholder="Enter customer name..." className="bg-slate-50"
            />
            <Input 
              label="Email Address" icon={<Mail size={16} />} type="email" 
              value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
              placeholder="name@example.com" className="bg-slate-50"
            />
          </div>
          
          <div className="h-px w-full bg-slate-100 my-6"></div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appointment Details</h4>
          <div className="space-y-4">
            <SearchSelect
              label="Select Place"
              placeholder={shops.length === 0 ? "No active places available" : "Search for a place..."}
              options={shopOptions}
              value={selectedShopOption}
              onChange={setSelectedShopOption}
            />
            
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarDays size={18} /></div>
                <input
                  type="datetime-local"
                  value={addDateTime}
                  min={getCurrentDateTimeLocal()} // 🌟 ชั้นที่ 1 บังคับหน้า UI ไม่ให้เลือกอดีต
                  onChange={(e) => setAddDateTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5AB2A8] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </SidePanelEdit>

      {/* ======================================= */}
      {/* 🔵 Panel แก้ไขการจอง (Edit Booking) */}
      {/* ======================================= */}
      <SidePanelEdit
        isOpen={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        title="Edit Booking"
        footer={
          <button 
            onClick={handleConfirmEdit}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#5AB2A8] rounded-2xl text-white font-bold hover:bg-[#4a968d] shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={18} /> Update Booking
          </button>
        }
      >
        {editingBooking && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <MapPin size={16} /> <span className="text-sm font-bold">{editingBooking.placeName}</span>
              </div>
              <p className="text-xs text-slate-400">Queue No: <span className="font-bold text-[#5AB2A8]">{editingBooking.queueNo}</span></p>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Customer</h4>
            <div className="space-y-4">
              <Input 
                label="Full Name" icon={<User size={16} />} type="text" 
                value={editName} onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-50"
              />
              <Input 
                label="Email Address" icon={<Mail size={16} />} type="email" 
                value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                className="bg-slate-50"
              />
            </div>
            
            <div className="h-px w-full bg-slate-100 my-6"></div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Appointment</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date & Time</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarDays size={18} /></div>
                  <input
                    type="datetime-local"
                    value={editDateTime}
                    min={getCurrentDateTimeLocal()} // 🌟 กันในตอนแก้ไขด้วยเช่นกัน
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