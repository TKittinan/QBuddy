import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchDashboardData } from "../redux/Slice/dashboardSlice";

import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Pagination } from "../components/ui/Pagination";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Clock, Filter, Calendar, ChevronDown, BarChart2, Hourglass, CheckCircle2 } from "lucide-react";
import type { Column } from "../types";

// 🌟 ส่วนที่เพิ่ม 1: Import supabase client
import { supabase } from "../config";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  
  // 🌟 ส่วนที่เพิ่ม 2: ดึงข้อมูล User จาก Auth State เพื่อใช้ ID ในการส่งสัญญาณ
  const { user } = useAppSelector((state: any) => state.auth);
  const { stats, activities, loading } = useAppSelector((state: any) => state.dashboard);

  const [range, setRange] = useState<"All" | "Today" | "Week" | "Month">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ส่วนที่เพิ่ม 3: useEffect สำหรับส่งสัญญาณออนไลน์ (Presence)
  useEffect(() => {
    if (!user?.id) return;

    // เชื่อมต่อ Channel เดียวกับที่หน้า UserManagement รอฟังอยู่
    const channel = supabase.channel('online-status', {
      config: { 
        presence: { key: user.id } 
      }
    });

    channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id, // ส่งค่า ID เข้าไปในก้อนข้อมูลด้วย
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => { channel.unsubscribe(); };
  }, [user?.id]);

  useEffect(() => {
    dispatch(fetchDashboardData(range));
    
    const interval = setInterval(() => {
      dispatch(fetchDashboardData(range));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch, range]);

  const filteredActivities = useMemo(() => {
    if (statusFilter === "All") return activities;
    return activities.filter((act: any) => act.status === statusFilter);
  }, [activities, statusFilter]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentData = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, range]);

  const columns: Column<any>[] = [
    { header: "USER", key: "userName", className: "w-[25%] font-bold text-slate-700" },
    { header: "ACTION TYPE", key: "action", className: "w-[40%] text-slate-500 font-medium" },
    { header: "TIME", key: "createdAt", className: "w-[20%]", render: (row) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs">
            {new Date(row.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    { header: "STATUS", key: "status", className: "w-[15%] text-right", render: (row) => <div className="flex justify-end"><StatusBadge status={row.status} /></div> }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Dropdown align="left" trigger={<button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm"><Filter size={14} className="mr-2"/> Status: {statusFilter} <ChevronDown size={14} className="ml-2"/></button>}
          items={[
            { label: "All Status", onClick: () => setStatusFilter("All") },
            { label: "Waiting", onClick: () => setStatusFilter("Waiting") },
            { label: "Completed", onClick: () => setStatusFilter("Completed") },
            { label: "Cancelled", onClick: () => setStatusFilter("Cancelled") }
          ]}
        />
        <Dropdown align="right" trigger={<button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm"><Calendar size={14} className="mr-2 text-[#5AB2A8]"/> Period: {range} <ChevronDown size={14} className="ml-2"/></button>}
          items={[
            { label: "All Time", onClick: () => setRange("All") },
            { label: "Today", onClick: () => setRange("Today") },
            { label: "This Week", onClick: () => setRange("Week") },
            { label: "This Month", onClick: () => setRange("Month") },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p><h3 className="text-3xl font-black text-slate-800">{stats?.totalVisitors || 0}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><BarChart2 size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Active Queues</p><h3 className="text-3xl font-black text-[#5AB2A8]">{stats?.activeQueues || 0}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#5AB2A8]"><Hourglass size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500 mb-1">Completed ({range})</p><h3 className="text-3xl font-black text-emerald-600">{stats?.completed || 0}</h3></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={24} /></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-[#5AB2A8]">Loading Data...</div>}
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Global Activity Log</h3>
        <Table data={currentData} columns={columns} emptyMessage="ไม่พบกิจกรรมในช่วงเวลานี้" />
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />}
      </div>
    </div>
  );
}