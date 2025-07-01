"use client";

import { Button } from "@/components/ui/button";
import { Table, Grid3X3 } from "lucide-react";

interface ViewToggleProps {
  view: "table" | "cards";
  onViewChange: (view: "table" | "cards") => void;
  className?: string;
}

export function ViewToggle({
  view,
  onViewChange,
  className = "",
}: ViewToggleProps) {
  return (
    <div
      className={`flex items-center gap-1 p-1 bg-gray-100 rounded-lg ${className}`}
    >
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-8 px-3 flex items-center gap-2"
      >
        <Table className="h-4 w-4" />
        <span className="text-xs font-medium">Table</span>
      </Button>
      <Button
        variant={view === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className="h-8 px-3 flex items-center gap-2"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="text-xs font-medium">Cards</span>
      </Button>
    </div>
  );
}
