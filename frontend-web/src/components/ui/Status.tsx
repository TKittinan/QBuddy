import React from "react";

interface StatusProps {
  status: string;
}

export const Status: React.FC<StatusProps> = ({ status }) => {
  // แปลงให้เป็นตัวพิมพ์ใหญ่ทั้งหมดเพื่อเช็คเงื่อนไขได้ง่าย
  const normalizedStatus = status.toUpperCase();

  let badgeClass = "bg-slate-100 text-slate-600"; // สีเริ่มต้น (Default)

  switch (normalizedStatus) {
    case "WAITING":
      badgeClass = "bg-amber-50 text-amber-600";
      break;
    case "SERVING":
      badgeClass = "bg-blue-50 text-blue-600";
      break;
    case "COMPLETED":
    case "ACTIVE":
    case "ONLINE":
      badgeClass = "bg-emerald-50 text-emerald-600";
      break;
    case "CANCELLED":
      badgeClass = "bg-rose-50 text-rose-600";
      break;
    case "INACTIVE":
    case "UNVERIFIED":
    case "OFFLINE":
      badgeClass = "bg-slate-100 text-slate-500";
      break;
    default:
      badgeClass = "bg-slate-100 text-slate-600";
  }

  // แปลงให้แสดงผลแบบ Title Case (เช่น WAITING -> Waiting)
  const displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}`}>
      {displayText}
    </span>
  );
};