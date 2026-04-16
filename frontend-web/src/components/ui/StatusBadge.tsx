import React from "react";
import type { TicketStatus, PlaceStatus } from "../../types";

interface StatusBadgeProps {
  status: TicketStatus | PlaceStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalizedStatus = status.toUpperCase();
  let badgeClass = "bg-slate-100 text-slate-600"; 

  switch (normalizedStatus) {
    case "WAITING":
    case "PENDING":
    case "OPEN":
      badgeClass = "bg-amber-50 text-amber-600 border border-amber-200";
      break;
    case "SERVING":
      badgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
      break;
    case "COMPLETED":
    case "ACTIVE":
    case "ONLINE":
      badgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
      break;
    case "CANCELLED":
    case "SKIPPED":
    case "DISABLED":
    case "INACTIVE":
    case "CLOSED":
      badgeClass = "bg-rose-50 text-rose-600 border border-rose-200";
      break;
  }

  const displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${badgeClass} ${className}`}>
      {displayText}
    </span>
  );
};