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
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewToggle } from "@/app/_components/common/ViewToggle";

export interface PromoFilters {
  search_query: string;
  status_filter: "all" | "active" | "expired";
  discount_type_filter: "all" | "percentage" | "fixed_amount";
}

type FilterKey = keyof PromoFilters;

interface PromoFiltersProps {
  filters: PromoFilters;
  onFiltersChange: (filters: PromoFilters) => void;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  viewMode?: "table" | "cards";
  onViewChange?: (mode: "table" | "cards") => void;
}

const promoStatuses = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const discountTypes = [
  { value: "all", label: "All Types" },
  { value: "percentage", label: "Percentage" },
  { value: "fixed_amount", label: "Fixed Amount" },
];

export function PromoFilters({
  filters,
  onFiltersChange,
  onSearch,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  viewMode,
  onViewChange,
}: PromoFiltersProps) {
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
    onFiltersChange({ ...filters, [key]: value });
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
    const clearedFilters: PromoFilters = {
      search_query: "",
      status_filter: "all",
      discount_type_filter: "all",
    };
    onFiltersChange(clearedFilters);
    setSearchInput("");
    if (onSearch) onSearch("");
  };

  // Remove a single filter
  const handleRemoveFilter = (key: FilterKey) => {
    const updatedFilters = { ...filters };
    if (key === "status_filter" || key === "discount_type_filter") {
      updatedFilters[key] = "all";
    } else if (key === "search_query") {
      updatedFilters[key] = "";
      setSearchInput("");
    }
    onFiltersChange(updatedFilters);
    if (key === "search_query" && onSearch) onSearch("");
  };

  // Determine if any filter is active
  const hasActiveFilters =
    filters.status_filter !== "all" ||
    filters.discount_type_filter !== "all" ||
    (filters.search_query && filters.search_query.trim() !== "");

  // Filter summary for dropdown
  const filterSummary: { label: string; value: string }[] = [];

  if (filters.status_filter !== "all") {
    filterSummary.push({
      label: "Status",
      value: filters.status_filter,
    });
  }
  if (filters.discount_type_filter !== "all") {
    filterSummary.push({
      label: "Type",
      value: filters.discount_type_filter,
    });
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-2 relative">
        {/* Search input */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-weak" />
        <input
          type="text"
          placeholder="Search promo codes..."
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyPress}
          className="pl-10 h-8 w-full flex-1 border border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text rounded-md text-sm"
          disabled={isLoading}
        />

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
                    {promoStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Type Filter */}
              <div>
                <label className="block text-xs text-weak mb-1">
                  Discount Type
                </label>
                <Select
                  value={filters.discount_type_filter}
                  onValueChange={(val) =>
                    handleFilterChange("discount_type_filter", val)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                    <SelectValue placeholder="Discount Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-text">
                    {discountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        : "discount_type_filter"
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
                    ? promoStatuses.find((s) => s.value === summary.value)
                        ?.label || summary.value
                    : summary.label === "Type"
                      ? discountTypes.find((t) => t.value === summary.value)
                          ?.label || summary.value
                      : summary.value}
                </span>
              </span>
            ))}

            <span
              className="items-center rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
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
