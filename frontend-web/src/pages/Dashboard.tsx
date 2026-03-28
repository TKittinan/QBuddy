import { useState, useEffect } from "react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { RefreshCcw, Calendar, ChevronDown, Clock } from "lucide-react";
import { Status } from "../components/ui/Status";
import type { Column } from "../types";

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

  /*
  // ==========================================
  // ส่วนดึงข้อมูลจาก Database จริงในอนาคต
  // ==========================================
  const fetchDashboardDataFromDB = async (startTimeStamp: number) => {
    try {
      const response = await fetch(`/api/dashboard/summary?startDate=${startTimeStamp}`);
      const data = await response.json();
      // setActivities(data.recentActivities);
      // setStatsData(data.statistics);
    } catch (error) {
      console.error("Failed to fetch database:", error);
    }
  };
  */

  const loadData = () => {
    setIsRefreshing(true);

    try {
      const queues = JSON.parse(localStorage.getItem("live_queue_tickets") || "[]");
      const bookings = JSON.parse(localStorage.getItem("booking_db") || "[]");

      const startTime = getTimeBoundaries(range);

      let totalCount = 0;
      let activeCount = 0;
      let completedCount = 0;
      let totalWaitTime = 0;
      let queueWithWaitTimeCount = 0;

      const combinedActivities: ActivityItem[] = [];

      const processItems = (items: any[], type: "Queue" | "Booking") => {
        items.forEach((item: any) => {
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
            if (type === "Booking" && item.dateTime) {
              displayDate = new Date(item.dateTime);
            }

            const formattedTime = displayDate.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });

            const customerName = type === "Queue" ? item.name : (item.user?.name || "Unknown");

            combinedActivities.push({
              id: item.id || Math.random().toString(),
              user: customerName,
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
    { header: "USER", key: "user", className: "font-medium text-slate-700" },
    { header: "ACTION", key: "action", className: "text-slate-500" },
    { 
      header: "TIME", 
      key: "time", 
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs">{row.time}</span>
        </div>
      )
    },
    { 
      header: "STATUS", 
      key: "status",
      // เปลี่ยนมาเรียกใช้ Component กลาง
      render: (row) => <Status status={row.status} />
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Summary</h2>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white"
            onClick={loadData}
            disabled={isRefreshing}
          >
            <RefreshCcw size={16} className={isRefreshing ? "animate-spin text-teal-500" : ""} /> 
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" className="flex items-center gap-2 bg-white min-w-[120px] justify-between">
                <div className="flex items-center gap-2"><Calendar size={16} /> {range}</div>
                <ChevronDown size={16} className="text-slate-400" />
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
        <h2 className="text-lg font-bold text-slate-800 border-b pb-4">Recent Activity</h2>
        <div className="pt-2">
          <Table data={activities} columns={columns} emptyMessage="No recent activities found in this time range." />
        </div>
      </div>
    </div>
  );
}