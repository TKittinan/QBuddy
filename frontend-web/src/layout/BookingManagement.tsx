import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar"; 
import Header from "../components/ui/Tabbar/Header";

export default function BookingManagementLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative font-sans">
      
      {/* 1. Sidebar Container: ซ่อนเมื่อจอเล็กกว่า lg (1024px) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-out 
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
      </aside>

      {/* 2. Overlay: แสดงเมื่อเปิดเมนูบนมือถือ หรือ iPad แนวตั้ง */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* ส่งชื่อหน้าและฟังก์ชันเปิดเมนูไปที่ Header */}
        <Header 
          title="Booking Management" 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* พื้นที่สำหรับ Render หน้า BookingManagement.tsx */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}