import { RefreshCcw, Plus, MoreHorizontal, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { Table } from "../components/ui/Table/Table";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import type { Column } from "../types";

type Ticket = {
  id: string;
  name: string;
  service: string;
  wait: string;
  status: "Serving" | "Waiting" | "Completed";
};

const stats = [
  { title: "Total Waiting", value: 24, change: "+5%" },
  { title: "Currently Serving", value: 5 },
  { title: "Avg. Wait Time", value: "12m", change: "+2m" },
  { title: "Completed Today", value: 142 },
];

const tickets: Ticket[] = [
  { id: "A-101", name: "Mike Ross", service: "Billing", wait: "15m", status: "Serving" },
  { id: "B-054", name: "Jessica Pearson", service: "Technical Support", wait: "22m", status: "Waiting" },
  { id: "A-102", name: "Sarah Jenkins", service: "General Inquiry", wait: "4m", status: "Waiting" },
  { id: "C-003", name: "Louis Litt", service: "New Account", wait: "1m", status: "Waiting" },
  { id: "A-099", name: "Donna Paulsen", service: "General Inquiry", wait: "35m", status: "Completed" },
];

export default function LiveQueue() {
  
  const queueColumns: Column<Ticket>[] = [
    { header: "TICKET", key: "id", className: "font-bold text-indigo-600" },
    { header: "CUSTOMER NAME", key: "name", className: "font-medium text-slate-700" },
    { header: "SERVICE TYPE", key: "service" },
    { 
      header: "WAIT TIME", 
      key: "wait",
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} /> {item.wait}
        </div>
      )
    },
    {
      header: "STATUS",
      key: "status",
      render: (item) => {
        const styles = {
          Serving: "bg-blue-50 text-blue-600",
          Waiting: "bg-amber-50 text-amber-600",
          Completed: "bg-emerald-50 text-emerald-600",
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[item.status]}`}>{item.status}</span>;
      },
    },
    {
      header: "ACTIONS",
      key: "id",
      className: "text-right",
      render: (item) => (
        <Dropdown 
          trigger={
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          }
          items={[
            { label: "Start Serving", icon: <PlayCircle size={16} />, className: "text-blue-600", onClick: () => alert(`Serving ${item.id}`) },
            { label: "Mark Completed", icon: <CheckCircle2 size={16} />, className: "text-emerald-600", onClick: () => alert(`Completed ${item.id}`) },
            { label: "Cancel Ticket", className: "text-red-600", divider: true, onClick: () => confirm("Cancel?") },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* ✅ ใช้ Button Generic แทนปุ่ม Hardcode */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCcw size={16} /> Refresh Data
        </Button>

        <Button variant="primary" className="flex items-center gap-2 bg-[#1E1E2D] hover:bg-slate-800 border-none">
          <Plus size={16} /> New Ticket
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All Services", "Billing", "Technical Support"].map((tab, i) => (
              <Button key={i} variant={i === 0 ? "primary" : "ghost"} className={i === 0 ? "bg-indigo-600" : ""}>
                {tab}
              </Button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search ticket..."
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 w-full md:w-64"
          />
        </div>

        {/* ✅ ใช้ Table Generic */}
        <Table data={tickets} columns={queueColumns} />
      </div>
    </div>
  );
}