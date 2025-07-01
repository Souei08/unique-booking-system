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
import { Search, Filter, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface TourFilters {
  search_query: string;
}

type FilterKey = keyof TourFilters;

interface TourFiltersProps {
  filters: TourFilters;
  onFiltersChange: (filters: TourFilters) => void;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  resultCount?: number;
}

export function TourFilters({
  filters,
  onFiltersChange,
  isLoading = false,
  onSearch,
  onRefresh,
  isRefreshing = false,
  resultCount,
}: TourFiltersProps) {
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

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-2 relative">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-weak" />
          <input
            type="text"
            placeholder="Search tours..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyPress}
            className="pl-10 h-8 w-64 border border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text rounded-md text-sm"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
