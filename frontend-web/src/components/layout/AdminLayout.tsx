import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}