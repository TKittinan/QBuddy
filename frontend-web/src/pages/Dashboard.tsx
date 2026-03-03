import Sidebar from "../components/layout/Sidebar"
import StatCard from "../components/dashboard/StatCard"
import DataTable from "../components/ui/DataTable"
import Button from "../components/ui/Button"

interface QueueItem {
  ticketId: string
  customerName: string
  serviceType: string
  waitTime: string
  status: string
}

const queueData: QueueItem[] = [
  {
    ticketId: "A-101",
    customerName: "Maria Rosa",
    serviceType: "Billing",
    waitTime: "5m",
    status: "Serving",
  },
  {
    ticketId: "B-204",
    customerName: "Michael Peterson",
    serviceType: "Technical Support",
    waitTime: "12m",
    status: "Waiting",
  },
  {
    ticketId: "C-033",
    customerName: "Lucas Silva",
    serviceType: "New Account",
    waitTime: "8m",
    status: "In Progress",
  },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Live Queue Management</h1>
            <p className="text-gray-500 text-sm">
              Monitor and manage customer flow in real-time across all service points.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">Refresh Data</Button>
            <Button>New Ticket</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Waiting" value="24" change="+3 from last hour" />
          <StatCard title="Currently Serving" value="8" change="Active now" />
          <StatCard title="Avg. Wait Time" value="12m" change="-2m improvement" />
        </div>

        {/* Table */}
        <DataTable<QueueItem>
          columns={[
            { header: "Ticket ID", accessor: "ticketId" },
            { header: "Customer Name", accessor: "customerName" },
            { header: "Service Type", accessor: "serviceType" },
            { header: "Wait Time", accessor: "waitTime" },
            { header: "Status", accessor: "status" },
          ]}
          data={queueData}
        />
      </div>
    </div>
  )
}