import { useState, useEffect, useMemo } from "react";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Clock, Filter, Calendar, ChevronDown, BarChart2, Hourglass, CheckCircle2 } from "lucide-react";
import type { Column, Ticket } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
  status: string;
  timestamp: number;
};

export default function Dashboard() {
  const [range, setRange] = useState<"Day" | "Week" | "Month">("Day");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [statsData, setStatsData] = useState({
    totalVisitors: 0,
    activeQueues: 0,
    completed: 0
  });

  // 🟢 โครงสร้าง API: GET ข้อมูลสถิติ
  const loadDashboardData = async () => {
    try {
      /* // 🚀 ฝั่ง Backend: เปลี่ยน URL และรองรับ Query Params ?range=...
      const response = await fetch(`${API_BASE_URL}/dashboard/stats?range=${range}`);
      if (!response.ok) throw new Error("Fetch error");
      const data = await response.json();
      setStatsData(data.stats); 
      setActivities(data.recentActivities);
      */
      console.log(`Fetching Dashboard Stats for period: ${range}`);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 30000); 
    return () => clearInterval(intervalId);
  }, [range]);

  const filteredActivities = useMemo(() => {
    if (statusFilter === "All") return activities;
    return activities.filter(act => act.status === statusFilter.toUpperCase());
  }, [activities, statusFilter]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentData = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  const columns: Column<ActivityItem>[] = [
    { header: "USER", key: "user", className: "w-[30%] text-left font-bold text-slate-700" },
    { header: "ACTION TYPE", key: "action", className: "w-[30%] text-left text-slate-500 font-medium" },
    { header: "TIME", key: "time", className: "w-[25%] text-left", render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs">{row.time}</span>
        </div>
      )
    },
    { header: "STATUS", key: "status", className: "w-[15%] text-right", render: (row) => <div className="flex justify-end"><StatusBadge status={row.status as any} /></div> }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[140px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Filter size={14} className="text-slate-400 mr-2"/> <span>Status: {statusFilter}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[
              { label: "All Status", onClick: () => setStatusFilter("All") },
              { label: "Waiting", onClick: () => setStatusFilter("Waiting") },
              { label: "Completed", onClick: () => setStatusFilter("Completed") },
              { label: "Cancelled", onClick: () => setStatusFilter("Cancelled") }
            ]}
          />
        </div>

        <div className="flex items-center">
          <Dropdown align="right" trigger={<button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm flex flex-row items-center justify-between min-w-[160px] whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Calendar size={14} className="text-[#5AB2A8] mr-2"/> <span>Period: {range}</span> <ChevronDown size={14} className="ml-2 text-slate-400 shrink-0"/></button>}
            items={[
              { label: "Today", onClick: () => setRange("Day") },
              { label: "This Week", onClick: () => setRange("Week") },
              { label: "This Month", onClick: () => setRange("Month") },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Total Visitors</p><h3 className="text-3xl font-black text-slate-800">{statsData.totalVisitors}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><BarChart2 size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Active Queues</p><h3 className="text-3xl font-black text-[#5AB2A8]">{statsData.activeQueues}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#5AB2A8]"><Hourglass size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Completed {range}</p><h3 className="text-3xl font-black text-emerald-600">{statsData.completed}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={24} /></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table data={currentData} columns={columns} emptyMessage="No activities found for this period." />
        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
      </div>
    </div>
  );
}