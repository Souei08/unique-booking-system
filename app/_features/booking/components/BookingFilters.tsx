"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  X,
  Filter,
  Search,
  RefreshCw,
  Users,
  Clock,
  MapPin,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface BookingFilters {
  status_filter: string;
  date_range: {
    from: Date | undefined;
    to: Date | undefined;
  };
  selected_time_filter: string;
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
  { value: "all", label: "All Statuses", color: "bg-gray-100 text-gray-700" },
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-green-100 text-green-700",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  {
    value: "completed",
    label: "Completed",
    color: "bg-blue-100 text-blue-700",
  },
];

const timeSlots = [
  { value: "all", label: "All Times" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState(
    filters.customer_name_filter
  );
  const [bookingIdInput, setBookingIdInput] = useState(
    filters.booking_id_filter
  );

  // Debounced search for customer name
  const debouncedCustomerNameSearch = useCallback(
    debounce((value: string) => {
      updateFilter("customer_name_filter", value);
    }, 500),
    []
  );

  // Debounced search for booking ID
  const debouncedBookingIdSearch = useCallback(
    debounce((value: string) => {
      updateFilter("booking_id_filter", value);
    }, 500),
    []
  );

  // Debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  // Update local state when filters change externally
  useEffect(() => {
    setCustomerNameInput(filters.customer_name_filter);
    setBookingIdInput(filters.booking_id_filter);
  }, [filters.customer_name_filter, filters.booking_id_filter]);

  const updateFilter = (key: keyof BookingFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status_filter: "all",
      date_range: { from: undefined, to: undefined },
      selected_time_filter: "all",
      tour_filter: "all",
      booking_id_filter: "",
      customer_name_filter: "",
    });
    setSearchQuery("");
    setCustomerNameInput("");
    setBookingIdInput("");
  };

  const hasActiveFilters = () => {
    return (
      (filters.status_filter && filters.status_filter !== "all") ||
      filters.date_range.from ||
      filters.date_range.to ||
      (filters.selected_time_filter &&
        filters.selected_time_filter !== "all") ||
      (filters.tour_filter && filters.tour_filter !== "all") ||
      filters.booking_id_filter ||
      filters.customer_name_filter ||
      searchQuery
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    updateFilter("customer_name_filter", searchQuery);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerNameInput(value);
    debouncedCustomerNameSearch(value);
  };

  const handleBookingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingIdInput(value);
    debouncedBookingIdSearch(value);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status_filter !== "all") count++;
    if (filters.date_range.from) count++;
    if (filters.date_range.to) count++;
    if (filters.selected_time_filter !== "all") count++;
    if (filters.tour_filter !== "all") count++;
    if (filters.booking_id_filter) count++;
    if (filters.customer_name_filter) count++;
    return count;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Enhanced Filter Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Booking Filters
              </h3>
              <p className="text-xs text-gray-500">
                Refine your booking search
              </p>
            </div>
          </div>
          {hasActiveFilters() && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isLoading}
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
            disabled={isLoading}
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name, booking ID, or tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="h-10 px-4"
          >
            Search
          </Button>
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              className="h-10 px-4"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
          )}
        </form>
      </div>

      {/* Enhanced Filter Controls */}
      {isExpanded && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Name Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                Customer Name
              </Label>
              <Input
                placeholder="Filter by customer name..."
                value={customerNameInput}
                onChange={handleCustomerNameChange}
                className="h-9"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Search will trigger after you stop typing
              </p>
            </div>

            {/* Booking ID Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                Booking ID
              </Label>
              <Input
                placeholder="Search booking ID..."
                value={bookingIdInput}
                onChange={handleBookingIdChange}
                className="h-9"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Search will trigger after you stop typing
              </p>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Booking Status</Label>
              <Select
                value={filters.status_filter}
                onValueChange={(value) => updateFilter("status_filter", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {bookingStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("w-2 h-2 rounded-full", status.color)}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tour Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Tour
              </Label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={filters.tour_filter}
                  onValueChange={(value) => updateFilter("tour_filter", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select tour" />
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
            </div>

            {/* Time Slot Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Time Slot
              </Label>
              <Select
                value={filters.selected_time_filter}
                onValueChange={(value) =>
                  updateFilter("selected_time_filter", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 justify-start text-left font-normal text-sm",
                        !filters.date_range.from && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date_range.from ? (
                        format(filters.date_range.from, "MMM dd")
                      ) : (
                        <span>From</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.date_range.from}
                      onSelect={(date) =>
                        updateFilter("date_range", {
                          ...filters.date_range,
                          from: date,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 justify-start text-left font-normal text-sm",
                        !filters.date_range.to && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date_range.to ? (
                        format(filters.date_range.to, "MMM dd")
                      ) : (
                        <span>To</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.date_range.to}
                      onSelect={(date) =>
                        updateFilter("date_range", {
                          ...filters.date_range,
                          to: date,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Quick Filter Actions */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Quick Filters:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("status_filter", "pending")}
                className="h-7 text-xs"
              >
                Pending Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter("status_filter", "confirmed")}
                className="h-7 text-xs"
              >
                Confirmed Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  updateFilter("date_range", {
                    from: today,
                    to: today,
                  });
                }}
                className="h-7 text-xs"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  updateFilter("date_range", {
                    from: today,
                    to: tomorrow,
                  });
                }}
                className="h-7 text-xs"
              >
                Next 2 Days
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
