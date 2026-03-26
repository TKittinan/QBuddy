import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar"; 
import Header from "../components/ui/Tabbar/Header";

export default function BookingManagementLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 🌟 เพิ่ม State สำหรับค้นหา
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative font-sans">
      
      {/* 1. Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-out 
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
      </aside>

      {/* 2. Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 🌟 ส่ง searchQuery ให้ Header เพื่อใช้งานช่องค้นหา */}
        <Header 
          title="Booking Management" 
          onMenuClick={() => setIsSidebarOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-[1400px] mx-auto">
            {/* 🌟 ส่งคำค้นหาลงหน้าลูก */}
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
        
      </div>
    </div>
  );
}