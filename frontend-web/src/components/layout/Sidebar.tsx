import { NavLink } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col bg-[#30364F] text-white px-4 py-6">
      <h1 className="text-xl font-bold mb-8">QBuddy</h1>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg ${
              isActive
                ? "bg-white text-[#30364F]"
                : "hover:bg-white/10"
            }`
          }
        >
          Dashboard
        </NavLink>
      </nav>
    </aside>
  )
}