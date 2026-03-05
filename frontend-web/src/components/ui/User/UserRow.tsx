import type { User } from "./index"; 

type Props = {
  user: User;
  onSelect: () => void;
};

const UserRow = ({ user, onSelect }: Props) => {
  return (
    <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
      <td className="py-4 font-medium text-gray-800">{user.name}</td>
      <td className="text-gray-500">{user.email}</td>
      
      {/* ✅ เพิ่มช่อง Role ตรงนี้ ข้อมูลจะได้ไม่เบี้ยวแล้ว */}
      <td>
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
          {user.role}
        </span>
      </td>

      {/* ✅ ช่อง Status ทำ Badge สีให้สวยเหมือนในรูปดีไซน์ */}
      <td>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : user.status === "INACTIVE"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.status === "ACTIVE" ? "Active" : user.status === "INACTIVE" ? "Inactive" : "Suspended"}
        </span>
      </td>

      {/* ช่อง Actions */}
      <td className="text-right">
        <button 
          onClick={onSelect}
          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default UserRow;