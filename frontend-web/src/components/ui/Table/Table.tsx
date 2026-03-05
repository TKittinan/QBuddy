import type { Column } from "../../../types";
import { TableRow } from "./TableRow";

// ✅ เพิ่ม emptyMessage กลับเข้าใน Interface
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string; 
}

export function Table<T extends { id?: string | number }>({ 
  data, 
  columns, 
  isLoading = false,
  emptyMessage = "No data found" // ✅ กำหนดค่า Default
}: TableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* ใช้ overflow-x-auto เพื่อรองรับมือถือ แต่ Dropdown จะไม่หายเพราะใช้ Portal แล้ว */}
      <div className="overflow-x-auto"> 
        <table className="w-full">
          <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`py-5 px-6 ${col.className || "text-left"}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={row.id || index} row={row} columns={columns} />
              ))
            ) : (
              // ✅ ใช้ค่า emptyMessage ที่ส่งมา
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400 italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}