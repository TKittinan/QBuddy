import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="font-semibold text-gray-800 text-size-lg">
          QBuddy
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <Outlet />
      </div>

    </div>
  );
};

export default AuthLayout;