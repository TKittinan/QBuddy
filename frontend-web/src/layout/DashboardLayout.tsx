import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar";
import {
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full">

        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">

          {/* Left Title */}
          <h1 className="text-xl font-semibold text-slate-800">
            Dashboard Overview
          </h1>
          

          {/* Right Section */}
          <div className="flex items-center gap-6">

            {/* Search Box */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search queues, staff, or settings..."
                className="pl-10 pr-4 py-2 w-72 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Notification Buttons */}
            <div className="flex items-center gap-2">

              {/* Bell */}
              <button
                className="relative p-2 rounded-lg hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <BellIcon className="text-slate-600" width={20} height={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Mail */}
              <button
                className="p-2 rounded-lg hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <EnvelopeClosedIcon className="text-slate-600" width={20} height={20} />
              </button>

            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  Alex Morgan
                </p>
                <p className="text-xs text-slate-500">
                  Super Admin
                </p>
              </div>

              <img
                src="https://i.pravatar.cc/40"
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            </div>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}