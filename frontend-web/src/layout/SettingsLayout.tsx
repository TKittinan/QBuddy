import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar"; 
import Header from "../components/ui/Tabbar/Header";

export default function SettingsLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative font-sans">
      
      {/* Sidebar: ซ่อนอัตโนมัติเมื่อจอเล็กกว่า lg (1024px) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-out 
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
      </aside>

      {/* Overlay สำหรับ Mobile / iPad Portrait */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* ส่งชื่อหน้าและฟังก์ชันเปิดเมนูไปที่ Header */}
        <Header 
          title="System Settings" 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-[1200px] mx-auto"> {/* ปรับ max-w ให้พอดีกับฟอร์ม */}
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}