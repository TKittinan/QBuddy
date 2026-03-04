import { useMemo, useState } from "react";

import StatCard from "../components/dashboard/StatCard";
import QueueItem from "../components/dashboard/QueueItem";
import TableRow from "../components/dashboard/TableRow";
import Dropdown from "../components/ui/Dropdown";

const stats = [
  { title: "Total Visitors", value: 1280, change: "+12%" },
  { title: "Active Queues", value: 8, change: "+2" },
  { title: "Completed Today", value: 342, change: "+5%" },
  { title: "Avg. Wait Time", value: "14 mins", change: "-3%" },
];

const queueData = [
  { name: "General Medicine", count: 12 },
  { name: "Billing", count: 5 },
  { name: "Laboratory", count: 8 },
  { name: "Pharmacy", count: 15 },
];

const activityData = [
  {
    user: "Sarah Jenkins",
    action: "Created Reservation",
    target: "Client #4592",
    time: "2 mins ago",
    status: "Completed",
  },
  {
    user: "System Bot",
    action: "Auto-closed Queue",
    target: "Pharmacy Counter 2",
    time: "15 mins ago",
    status: "System",
  },
  {
    user: "Mike Ross",
    action: "Updated Settings",
    target: "Global Configuration",
    time: "1 hour ago",
    status: "Pending",
  },
];

const generateMockChart = () =>
  Array.from({ length: 7 }, () =>
    Math.floor(Math.random() * 80) + 20
  );

const Dashboard = () => {
  const [range, setRange] = useState("Week");

  const chartData = useMemo(() => generateMockChart(), [range]);
  const maxValue = Math.max(...chartData);

  return (
    <div className="space-y-8">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </div>

      {/* Charts + Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Visitor Traffic */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Visitor Traffic Trends
              </h2>
              <p className="text-sm text-slate-500">
                Weekly overview of foot traffic
              </p>
            </div>

            <Dropdown
              options={["Day", "Week", "Month"]}
              defaultValue="Week"
              onChange={(value) => setRange(value)}
            />

          </div>

          {/* Chart */}
          <div className="h-64 flex items-end gap-3">
            {chartData.map((value, i) => {
              const height = (value / maxValue) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-teal-500 rounded-t-xl transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs mt-2 text-gray-400">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Queue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">
            Live Queue Status
          </h2>

          <div className="space-y-4">
            {queueData.map((queue, i) => (
              <QueueItem
                key={i}
                name={queue.name}
                count={queue.count}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-800 mb-4">
          Recent Activity Log
        </h2>

        <table className="w-full text-sm text-left">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-3">User</th>
              <th>Action</th>
              <th>Target</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((item, i) => (
              <TableRow key={i} {...item} />
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;