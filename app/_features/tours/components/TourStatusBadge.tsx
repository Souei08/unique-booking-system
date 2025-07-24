import React from "react";

interface TourStatusBadgeProps {
  status?: string;
  className?: string;
}

export function TourStatusBadge({ status, className = "" }: TourStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Active";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status || "active")} ${className}`}>
      {displayStatus}
    </span>
  );
} 