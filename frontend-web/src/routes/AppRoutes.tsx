import { Routes, Route } from "react-router-dom"
import AdminLayout from "../components/layout/AdminLayout"
import Dashboard from "../Pages/Dashboard"

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}