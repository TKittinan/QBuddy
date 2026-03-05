import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar";

export default function LiveQueueLayout() {
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b px-8 py-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800">
            Live Queue Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and manage customer flow in real-time across all service points.
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}