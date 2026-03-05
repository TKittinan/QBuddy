import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar"; // ✅ ใช้ Sidebar โค้ดเดิมของคุณ
import Header from "../components/ui/Tabbar/Header";

export default function LiveQueueLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ คุมการเปิด/ปิด Sidebar บน Mobile/iPad Portrait

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative font-sans">
      
      {/* 1. Sidebar: ซ่อนอัตโนมัติเมื่อจอเล็กกว่า lg (1024px) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-out 
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
      </aside>

      {/* 2. Overlay: แสดงเมื่อเปิด Sidebar บน iPad แนวตั้ง/Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ✅ ส่ง title และฟังก์ชันเปิดเมนูไปที่ Header */}
        <Header 
          title="Live Queue Management" 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}