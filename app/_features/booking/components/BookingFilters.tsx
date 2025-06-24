"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface BookingFilters {
  status_filter: string;
  selected_time_filter: string; // This is no longer used in the UI but kept for interface compatibility
  tour_filter: string;
  booking_id_filter: string;
  customer_name_filter: string;
}

interface BookingFiltersProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  tours: Array<{ id: string; title: string }>;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const bookingStatuses = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export function BookingFilters({
  filters,
  onFiltersChange,
  tours,
  isLoading = false,
  onSearch,
  onRefresh,
  isRefreshing = false,
}: BookingFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const updateFilter = (key: keyof BookingFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status_filter: "all",
      selected_time_filter: "all",
      tour_filter: "all",
      booking_id_filter: "",
      customer_name_filter: "",
    });
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const hasActiveFilters = () => {
    return (
      filters.status_filter !== "all" ||
      filters.tour_filter !== "all" ||
      !!filters.booking_id_filter ||
      !!filters.customer_name_filter
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="space-y-4 mb-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {bookingStatuses.map((status) => (
            <Button
              key={status.value}
              variant={
                filters.status_filter === status.value ? "default" : "ghost"
              }
              size="sm"
              className="h-8 text-sm "
              onClick={() => updateFilter("status_filter", status.value)}
              disabled={isLoading}
            >
              {status.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 w-48"
              disabled={isLoading}
            />
          </form>
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              className="h-9 w-9"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <Select
            value={filters.tour_filter}
            onValueChange={(value) => updateFilter("tour_filter", value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 w-auto min-w-[150px] text-sm">
              <SelectValue placeholder="All Tours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tours</SelectItem>
              {tours.map((tour) => (
                <SelectItem key={tour.id} value={tour.id}>
                  {tour.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="sm" className="h-9" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add filter
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-red-600 hover:text-red-700"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
