import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, ClipboardList, Settings, LogOut } from "lucide-react"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#30364F] text-white min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6 text-xl font-bold tracking-wide border-b border-white/10">
        QBuddy Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        <SidebarItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarItem to="/queues" icon={<ClipboardList size={18} />} label="Queues" />
        <SidebarItem to="/users" icon={<Users size={18} />} label="Users" />
        <SidebarItem to="/settings" icon={<Settings size={18} />} label="Settings" />

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-2 text-sm hover:text-red-300 transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </aside>
  )
}

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

function SidebarItem({ to, icon, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition
         ${
           isActive
             ? "bg-white text-[#30364F] font-medium"
             : "text-white/80 hover:bg-white/10 hover:text-white"
         }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}