import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Tabbar/Sidebar";
import Header from "../components/ui/Tabbar/Header";

const UserManageLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header title="User Management" />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserManageLayout;