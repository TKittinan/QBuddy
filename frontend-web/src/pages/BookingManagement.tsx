import { useState } from "react";
import { 
  Plus, Search, Filter, ChevronDown, 
  Clock, CheckCircle2, XCircle, 
  BarChart2, Hourglass, Timer, MoreHorizontal // ✅ นำเข้า MoreHorizontal กลับมา และเอา Eye ออก
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import type { Column } from "../types";

type Booking = {
  id: string;
  bookingId: string;
  user: { name: string; email: string };
  placeName: string;
  queueNo: string;
  dateTime: string;
  status: "Waiting" | "Served" | "Cancelled";
};

const mockBookings: Booking[] = [
  { id: "1", bookingId: "#BK-2024-001", user: { name: "Sarah Jenkins", email: "sarah.j@email.com" }, placeName: "Downtown Branch", queueNo: "Q-104", dateTime: "Oct 24, 10:30 AM", status: "Waiting" },
  { id: "2", bookingId: "#BK-2024-002", user: { name: "Michael Chen", email: "m.chen@tech.co" }, placeName: "Westside Clinic", queueNo: "Q-105", dateTime: "Oct 24, 10:45 AM", status: "Served" },
  { id: "3", bookingId: "#BK-2024-003", user: { name: "Emma Wilson", email: "emma.w@mail.net" }, placeName: "Downtown Branch", queueNo: "Q-106", dateTime: "Oct 24, 11:00 AM", status: "Cancelled" },
  { id: "4", bookingId: "#BK-2024-004", user: { name: "James Rodriguez", email: "j.rod@email.com" }, placeName: "North Point Office", queueNo: "Q-107", dateTime: "Oct 24, 11:15 AM", status: "Waiting" },
  { id: "5", bookingId: "#BK-2024-005", user: { name: "Lisa Wong", email: "lisa.wong@design.io" }, placeName: "Westside Clinic", queueNo: "Q-108", dateTime: "Oct 24, 11:30 AM", status: "Waiting" },
  { id: "6", bookingId: "#BK-2024-006", user: { name: "Robert Fox", email: "r.fox@company.com" }, placeName: "Downtown Branch", queueNo: "Q-109", dateTime: "Oct 24, 11:45 AM", status: "Served" },
];

export default function BookingManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<Booking>[] = [
    { 
      header: "BOOKING ID", 
      key: "bookingId", 
      className: "font-medium text-slate-500 text-xs" 
    },
    { 
      header: "USER", 
      key: "user",
      render: (item) => (
        <div>
          <p className="font-bold text-slate-800 text-sm">{item.user.name}</p>
          <p className="text-xs text-slate-400">{item.user.email}</p>
        </div>
      )
    },
    { 
      header: "PLACE NAME", 
      key: "placeName", 
      className: "text-slate-600 font-medium" 
    },
    { 
      header: "QUEUE NO.", 
      key: "queueNo", 
      className: "font-bold text-[#5AB2A8]"
    },
    { 
      header: "DATE / TIME", 
      key: "dateTime",
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span className="text-xs">{item.dateTime}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      render: (item) => {
        if (item.status === "Waiting") {
          return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Waiting</span>;
        }
        if (item.status === "Served") {
          return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100"><CheckCircle2 size={12} /> Served</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100"><XCircle size={12} /> Cancelled</span>;
      },
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item) => (
        // ✅ เปลี่ยนมาใช้ Dropdown แทนปุ่ม Eye 
        <Dropdown 
          trigger={
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          }
          items={[
            { 
              label: "Success", 
              icon: <CheckCircle2 size={16} />, 
              className: "text-indigo-600", // สีม่วงครามให้เข้ากับสถานะ Served
              onClick: () => console.log("Mark as Success:", item.bookingId) 
            },
            { 
              label: "Cancel", 
              icon: <XCircle size={16} />, 
              className: "text-rose-600", // สีแดง
              divider: true, 
              onClick: () => confirm(`Are you sure you want to cancel booking ${item.bookingId}?`) 
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 🔝 Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Booking Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all customer appointments</p>
        </div>
      </div>

      {/* 🔍 Filters & Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown 
            trigger={<Button variant="outline" className="bg-white shadow-sm flex items-center gap-2">All Locations <ChevronDown size={14}/></Button>}
            items={[{label: "Downtown Branch"}, {label: "Westside Clinic"}]}
          />
          <Dropdown 
            trigger={<Button variant="outline" className="bg-white shadow-sm flex items-center gap-2">All Statuses <ChevronDown size={14}/></Button>}
            items={[{label: "Waiting"}, {label: "Served"}, {label: "Cancelled"}]}
          />
          <Button variant="ghost" className="text-[#5AB2A8] hover:text-[#4a968d] hover:bg-teal-50 flex items-center gap-2 font-semibold">
            <Filter size={16} /> More Filters
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:max-w-md">
            <Input 
              icon={<Search size={18} />}
              type="text" 
              placeholder="Search bookings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white shadow-sm border-slate-200 py-2.5"
            />
          </div>
          <Button className="w-full sm:w-auto bg-[#1E1E2D] hover:bg-slate-800 text-white shadow-lg flex items-center justify-center gap-2 px-6 py-2.5">
            <Plus size={18} /> New Booking
          </Button>
        </div>
      </div>

      {/* 📊 Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-1">
          <Table data={mockBookings} columns={columns} />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-white">
          <p className="text-xs text-slate-500 font-medium">Showing <span className="font-bold text-slate-700">1</span> to <span className="font-bold text-slate-700">6</span> of <span className="font-bold text-slate-700">48</span> results</p>
          <Pagination 
            currentPage={currentPage} 
            totalPages={8} 
            onChange={(p) => setCurrentPage(p)} 
          />
        </div>
      </div>

      {/* 📉 Bottom Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-slate-800">1,248</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <BarChart2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Waiting List</p>
            <h3 className="text-3xl font-bold text-[#5AB2A8]">42</h3>
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

    </div>
  );
}