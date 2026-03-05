import React from "react";
import type { Column } from "../../../types";

interface TableRowProps<T> {
  row: T;
  columns: Column<T>[];
}

export function TableRow<T>({ row, columns }: TableRowProps<T>) {
  return (
    <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
      {columns.map((col, index) => {
        // ดึงค่าจาก Object อัตโนมัติ (เช่น row.name, row.email)
        const value = row[col.key as keyof T] as React.ReactNode;
        
        return (
          <td 
            key={`${String(col.key)}-${index}`} 
            className={`py-4 px-6 text-sm ${col.className || "text-left"}`}
          >
            {col.render ? col.render(row) : value}
          </td>
        );
      })}
    </tr>
  );
}