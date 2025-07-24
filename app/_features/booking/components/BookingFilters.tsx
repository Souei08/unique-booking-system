"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewToggle } from "@/app/_components/common/ViewToggle";

export interface BookingFilters {
  status_filter: string;
  selected_time_filter: string;
  tour_filter: string;
  search_query: string;
  needs_attention?: boolean;
}

type FilterKey = keyof BookingFilters;

interface BookingFiltersProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  tours: Array<{ id: string; title: string }>;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  resultCount?: number;
  viewMode?: "table" | "cards";
  onViewChange?: (view: "table" | "cards") => void;
}

const bookingStatuses = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "refunded", label: "Refunded" },
];

export function BookingFilters({
  filters,
  onFiltersChange,
  tours,
  isLoading = false,
  onSearch,
  onRefresh,
  isRefreshing = false,
  resultCount,
  viewMode,
  onViewChange,
}: BookingFiltersProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search_query);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearch && searchInput !== filters.search_query) {
        onSearch(searchInput);
      }
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, onSearch, filters.search_query]);

  // Sync search input with filters when filters change externally
  useEffect(() => {
    setSearchInput(filters.search_query);
  }, [filters.search_query]);

  // Handlers for filter changes in the popover (update parent immediately)
  const handleFilterChange = (key: FilterKey, value: string) => {
    if (key === "needs_attention") {
      onFiltersChange({ ...filters, [key]: value === "true" });
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  // Search input change - only update local state
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (onSearch) onSearch(searchInput);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: BookingFilters = {
      status_filter: "all",
      selected_time_filter: "all",
      tour_filter: "all",
      search_query: "",
      needs_attention: false,
    };
    onFiltersChange(clearedFilters);
    setSearchInput("");
    if (onSearch) onSearch("");
  };

  // Remove a single filter
  const handleRemoveFilter = (key: FilterKey) => {
    const updatedFilters = { ...filters };
    if (key === "status_filter" || key === "tour_filter") {
      updatedFilters[key] = "all";
    } else if (key === "search_query") {
      updatedFilters[key] = "";
      setSearchInput("");
    } else if (key === "needs_attention") {
      updatedFilters[key] = false;
    }
    onFiltersChange(updatedFilters);
    if (key === "search_query" && onSearch) onSearch("");
  };

  // Determine if any filter is active
  const hasActiveFilters =
    filters.status_filter !== "all" ||
    filters.tour_filter !== "all" ||
    (filters.search_query && filters.search_query.trim() !== "") ||
    filters.needs_attention === true;

  // Filter summary for dropdown
  const filterSummary: { label: string; value: string }[] = [];

  if (filters.status_filter !== "all") {
    filterSummary.push({
      label: "Status",
      value: filters.status_filter,
    });
  }
  if (filters.tour_filter !== "all") {
    filterSummary.push({
      label: "Tour",
      value: filters.tour_filter,
    });
  }
  if (filters.needs_attention) {
    filterSummary.push({
      label: "Needs Attention",
      value: "true",
    });
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-2 relative">
        {/* Search input and button */}

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-weak" />
        <input
          type="text"
          placeholder="Search by name, ID"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyPress}
          className="pl-10 h-8 w-full flex-1 border border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text rounded-md text-sm"
          disabled={isLoading}
        />
        {/* Attention Filter Button */}
        <Button
          variant={filters.needs_attention ? "default" : "outline"}
          size="sm"
          className={`h-8 px-3 flex items-center gap-2 ${
            filters.needs_attention 
              ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
              : "border-stroke-strong bg-background text-text hover:bg-red-50 hover:border-red-200"
          }`}
          onClick={() => handleFilterChange("needs_attention", filters.needs_attention ? "false" : "true")}
          disabled={isLoading}
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">Needs Attention</span>
        </Button>
        {/* Filter button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 flex items-center gap-2 border-stroke-strong bg-background text-text"
              type="button"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 text-weak" />
              <span className="text-xs font-medium">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 bg-background border-stroke-strong"
            align="start"
          >
            <div className="flex flex-col gap-4 p-2">
              {/* Status Filter */}
              <div>
                <label className="block text-xs text-weak mb-1">Status</label>
                <Select
                  value={filters.status_filter}
                  onValueChange={(val) =>
                    handleFilterChange("status_filter", val)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-text">
                    {bookingStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Tour Filter */}
              <div>
                <label className="block text-xs text-weak mb-1">Tour</label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full bg-fill" />
                ) : (
                  <Select
                    value={filters.tour_filter}
                    onValueChange={(val) =>
                      handleFilterChange("tour_filter", val)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                      <SelectValue placeholder="Tour" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-text">
                      <SelectItem value="all">All Tours</SelectItem>
                      {tours.map((tour) => (
                        <SelectItem key={tour.id} value={tour.id}>
                          {tour.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* View Toggle */}
        {viewMode && onViewChange && (
          <ViewToggle view={viewMode} onViewChange={onViewChange} />
        )}
      </div>

      {/* Filter summary at the bottom */}
      {filterSummary.length > 0 && (
        <div className="mt-4 border-t border-stroke-weak pt-3">
          <div className="text-xs text-weak font-medium mb-2">
            Active Filters:
          </div>
          <div className="flex flex-wrap gap-2">
            {filterSummary.map((summary) => (
              <span
                key={summary.value}
                className="inline-flex items-center rounded-full border border-stroke-weak bg-fill px-3 py-1.5 text-xs font-medium text-text gap-2 shadow-sm hover:bg-neutral transition-colors duration-200"
              >
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full hover:bg-stroke-weak focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 transition-colors duration-200"
                  style={{ width: 16, height: 16 }}
                  onClick={() =>
                    handleRemoveFilter(
                      summary.label === "Status"
                        ? "status_filter"
                        : summary.label === "Tour"
                        ? "tour_filter"
                        : "needs_attention"
                    )
                  }
                  tabIndex={0}
                  aria-label={`Remove ${summary.label} filter`}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 2L8 8M8 2L2 8"
                      stroke="#64748B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <span className="text-weak font-semibold">{summary.label}</span>
                <span className="text-stroke-strong">|</span>
                <span className="text-text font-medium">
                  {summary.label === "Status"
                    ? bookingStatuses.find((s) => s.value === summary.value)
                        ?.label || summary.value
                    : summary.label === "Tour"
                      ? tours.find((t) => t.id === summary.value)?.title ||
                        summary.value
                      : summary.value}
                </span>
              </span>
            ))}

            <span
              className="items-center rounded-full  px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200  cursor-pointer"
              onClick={handleClearFilters}
            >
              Clear Filters
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
