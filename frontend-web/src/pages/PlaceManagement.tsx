import { useState } from "react";
import { 
  Plus, Search, Filter, MoreHorizontal, Calendar, 
  Clock, ChevronDown, Eye, CheckCircle2, XCircle 
} from "lucide-react";
import { Table } from "../components/ui/Table/Table";
import StatCard from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
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
];

export default function PlaceManagement() {
  const [currentPage, setCurrentPage] = useState(1);

  const columns: Column<Booking>[] = [
    { header: "BOOKING ID", key: "bookingId", className: "text-xs font-medium text-slate-500" },
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
    { header: "PLACE NAME", key: "placeName" },
    { header: "QUEUE NO.", key: "queueNo", className: "font-bold text-emerald-600" },
    { 
      header: "DATE / TIME", 
      key: "dateTime",
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} /> <span className="text-xs">{item.dateTime}</span>
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      render: (item) => {
        const styles = { Waiting: "bg-emerald-50 text-emerald-600", Served: "bg-indigo-50 text-indigo-600", Cancelled: "bg-rose-50 text-rose-600" };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${styles[item.status]}`}>● {item.status}</span>;
      },
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item) => (
        <Dropdown 
          trigger={<button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreHorizontal size={18} /></button>}
          items={[
            { label: "View Details", icon: <Eye size={16} />, onClick: () => console.log(item.id) },
            { label: "Mark Served", icon: <CheckCircle2 size={16} />, className: "text-indigo-600" },
            { label: "Cancel", icon: <XCircle size={16} />, className: "text-red-600", divider: true }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Overview of all location bookings</p>
        <Button variant="outline" className="flex items-center gap-2 bg-white">
          <Calendar size={16} /> Date Range <ChevronDown size={14} />
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <Dropdown trigger={<Button variant="outline">All Locations <ChevronDown size={14}/></Button>} items={[{label: "Main Branch"}]} />
          <Button variant="ghost" className="text-indigo-600 flex items-center gap-2"><Filter size={16} /> Filter</Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none" />
          </div>
          <Button className="w-full sm:w-auto bg-[#1E1E2D] hover:bg-slate-800"><Plus size={18} /> New Place Booking</Button>
        </div>
      </div>

      <Table data={mockBookings} columns={columns} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">Showing results for Place Management</p>
        <Pagination currentPage={currentPage} totalPages={5} onChange={setCurrentPage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Places" value="12" />
        <StatCard title="Active Bookings" value="156" />
        <StatCard title="Avg. Occupancy" value="84%" />
      </div>
    </div>
  );
}