import { useState } from "react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { RefreshCcw, Calendar, ChevronDown } from "lucide-react";
import type { Column } from "../types";

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  time: string;
};

export default function Dashboard() {
  const [range, setRange] = useState("Week");

  const stats = [
    { title: "Total Visitors", value: 1280, change: "+12%" },
    { title: "Active Queues", value: 8, change: "+2" },
    { title: "Avg. Wait Time", value: "14 mins", change: "-3%" },
    { title: "Completed Today", value: 342 },
  ];

  // ✅ 2. เปลี่ยนจาก Column<any> เป็น Column<ActivityItem> เพื่อแก้ Error ESLint
  const columns: Column<ActivityItem>[] = [
    { header: "USER", key: "user", className: "font-medium text-slate-700" },
    { header: "ACTION", key: "action" },
    { header: "TIME", key: "time" },
  ];

  // ข้อมูลตัวอย่างสำหรับแสดงผล
  const activityData: ActivityItem[] = [
    { id: "1", user: "Sarah Jenkins", action: "Created Reservation", time: "2 mins ago" },
    { id: "2", user: "Mike Ross", action: "Updated Settings", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Summary</h2>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCcw size={16} /> Refresh
          </Button>
          <Dropdown
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} /> {range} <ChevronDown size={16} />
              </Button>
            }
            items={[
              { label: "Day", onClick: () => setRange("Day") },
              { label: "Week", onClick: () => setRange("Week") },
              { label: "Month", onClick: () => setRange("Month") },
            ]}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Activity Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        <Table data={activityData} columns={columns} emptyMessage="No recent activities" />
      </div>
    </div>
  );
}