import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;   // (Optional) เอาไว้โชว์ข้อความ Showing X to Y of Z
  itemsPerPage?: number; // (Optional)
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onChange,
}) => {
  // ถ้ามีแค่หน้าเดียว หรือไม่มีข้อมูล ไม่ต้องแสดง Pagination
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 w-full gap-4">
      {/* ส่วนแสดงข้อความ (ถ้ามีการส่ง totalItems และ itemsPerPage มาให้) */}
      <div className="text-sm text-slate-500">
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <p>
            Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
            <span className="font-bold text-slate-700">{totalItems}</span> entries
          </p>
        ) : (
          <p>Page {currentPage} of {totalPages}</p>
        )}
      </div>

      {/* ส่วนปุ่มกดเปลี่ยนหน้า */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};