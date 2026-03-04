import { RefreshCcw, Plus } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import ActivityTableRow from "../components/dashboard/ActivityTableRow";

const stats = [
  { title: "Total Waiting", value: 24, change: "+5%" },
  { title: "Currently Serving", value: 5 },
  { title: "Avg. Wait Time", value: "12m", change: "+2m" },
  { title: "Completed Today", value: 142 },
];

const tickets = [
  { id: "A-101", name: "Mike Ross", service: "Billing", wait: "15m", status: "Serving" },
  { id: "B-054", name: "Jessica Pearson", service: "Technical Support", wait: "22m", status: "Waiting" },
  { id: "A-102", name: "Sarah Jenkins", service: "General Inquiry", wait: "4m", status: "Waiting" },
  { id: "C-003", name: "Louis Litt", service: "New Account", wait: "1m", status: "Waiting" },
  { id: "A-099", name: "Donna Paulsen", service: "General Inquiry", wait: "35m", status: "Completed" },
];

export default function LiveQueue() {
  return (
    <div className="space-y-8">

      {/* Top Buttons */}
      <div className="flex justify-end gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm hover:bg-slate-50">
          <RefreshCcw size={16} />
          Refresh Data
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600">
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Stats Section */}
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

      {/* Table Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex gap-3 text-sm">
            {["All Services","General Inquiry","Technical Support","Billing","New Account"].map((tab, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-xl ${
                  i === 0
                    ? "bg-slate-100 font-medium text-slate-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search ticket or customer..."
            className="px-4 py-2 border rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-3">Ticket</th>
              <th>Customer Name</th>
              <th>Service Type</th>
              <th>Wait Time</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket, i) => (
              <ActivityTableRow
                key={i}
                ticket={ticket.id}
                name={ticket.name}
                service={ticket.service}
                wait={ticket.wait}
                status={ticket.status}
              />
            ))}
          </tbody>
        </table>

        <p className="text-xs text-slate-400 mt-4">
          Showing 1 to 5 of 24 results
        </p>

      </div>
    </div>
  );
}