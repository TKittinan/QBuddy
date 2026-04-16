import { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { RefreshCcw, Calendar, ChevronDown, Clock } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { Column, Ticket } from "../types"; // 🌟 ใช้แค่ Ticket เพราะเรายุบรวมข้อมูลหมดแล้ว

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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [statsData, setStatsData] = useState({
    totalVisitors: { value: 0, trend: 0 },
    activeQueues: { value: 0, trend: 0 },
    avgWaitTime: { value: 0, trend: 0 },
    completed: { value: 0, trend: 0 }
  });

  const getTimeBoundaries = (selectedRange: string) => {
    const now = new Date();
    const start = new Date(now);
    
    start.setHours(0, 0, 0, 0);

    if (selectedRange === "Week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
      start.setDate(diff);
    } else if (selectedRange === "Month") {
      start.setDate(1);
    }
    
    return start.getTime(); 
  };

  const loadData = () => {
    setIsRefreshing(true);

    try {
      const queues: Ticket[] = JSON.parse(localStorage.getItem("live_queue_tickets") || "[]");
      const bookings: Ticket[] = JSON.parse(localStorage.getItem("booking_db") || "[]");

      const startTime = getTimeBoundaries(range);

      let totalCount = 0;
      let activeCount = 0;
      let completedCount = 0;
      let totalWaitTime = 0;
      let queueWithWaitTimeCount = 0;

      const combinedActivities: ActivityItem[] = [];

      // 🌟 ใช้ Ticket[] เท่านั้น ไม่มีการใช้ any หรือ Partial อีกต่อไป
      const processItems = (items: Ticket[], type: "Queue" | "Booking") => {
        items.forEach((item) => {
          const itemDate = new Date(item.createdAt || Date.now());
          const itemTimestamp = itemDate.getTime();

          if (itemTimestamp >= startTime) {
            totalCount++;

            const status = (item.status || "Waiting").toUpperCase();
            
            if (status === "WAITING" || status === "SERVING") activeCount++;
            if (status === "COMPLETED") completedCount++;

            if (type === "Queue" && typeof item.waitTime === "number") {
              totalWaitTime += item.waitTime;
              queueWithWaitTimeCount++;
            }

            let displayDate = itemDate;
            if (item.bookDate && item.bookTime) {
              displayDate = new Date(`${item.bookDate}T${item.bookTime}`);
            }

            const formattedTime = displayDate.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });

            combinedActivities.push({
              id: item.id || Math.random().toString(),
              user: item.name || "Unknown",
              action: type === "Queue" ? "Joined Queue" : "Created Booking",
              time: formattedTime,
              status: status,
              timestamp: itemTimestamp
            });
          }
        });
      };

      processItems(queues, "Queue");
      processItems(bookings, "Booking");

      combinedActivities.sort((a, b) => b.timestamp - a.timestamp);

      setActivities(combinedActivities);
      setStatsData({
        totalVisitors: { value: totalCount, trend: totalCount > 0 ? 5 : 0 },
        activeQueues: { value: activeCount, trend: activeCount > 0 ? 2 : 0 },
        avgWaitTime: { value: queueWithWaitTimeCount > 0 ? Math.floor(totalWaitTime / queueWithWaitTimeCount) : 0, trend: -1 },
        completed: { value: completedCount, trend: 0 }
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener("storage", handleStorageChange);
    const intervalId = setInterval(loadData, 60000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [range]);

  const columns: Column<ActivityItem>[] = [
    { header: "USER", key: "user", className: "w-[30%] text-left font-medium text-slate-700" },
    { header: "ACTION", key: "action", className: "w-[30%] text-left text-slate-500" },
    { header: "TIME", key: "time", className: "w-[25%] text-left", render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs">{row.time}</span>
        </div>
      )
    },
    { header: "STATUS", key: "status", className: "w-[15%] text-right", render: (row) => <div className="flex justify-end"><StatusBadge status={row.status} /></div> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time statistics and recent activities</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData} disabled={isRefreshing} className="bg-white shadow-sm border-slate-200">
            <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" className="bg-white shadow-sm border-slate-200 flex items-center justify-between min-w-[160px]">
                <Calendar size={16} className="mr-2" />
                <span>{range}</span>
                <ChevronDown size={14} className="ml-2" />
              </Button>
            }
            items={[
              { label: "Today (00:00 - 23:59)", onClick: () => setRange("Day") },
              { label: "This Week (From Mon)", onClick: () => setRange("Week") },
              { label: "This Month (From 1st)", onClick: () => setRange("Month") },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Visitors" value={statsData.totalVisitors.value} change={statsData.totalVisitors.trend > 0 ? `+${statsData.totalVisitors.trend}%` : `${statsData.totalVisitors.trend}%`} />
        <StatCard title="Active Queues" value={statsData.activeQueues.value} change={statsData.activeQueues.trend > 0 ? `+${statsData.activeQueues.trend}` : `${statsData.activeQueues.trend}`} />
        <StatCard title="Avg. Wait Time" value={`${statsData.avgWaitTime.value} mins`} change={statsData.avgWaitTime.trend > 0 ? `+${statsData.avgWaitTime.trend}%` : `${statsData.avgWaitTime.trend}%`} />
        <StatCard title={`Completed ${range}`} value={statsData.completed.value} />
      </div>

      <div className="space-y-4 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Recent Activities</h2>
        <Table data={activities} columns={columns} emptyMessage="No activities found." />
      </div>
    </div>
  );
}