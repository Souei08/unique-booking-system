"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ChevronLeft, ChevronRight, Filter, MapPin } from "lucide-react";
import { Tour } from "@/app/_features/tours/tour-types";

interface CalendarFiltersProps {
  month: number;
  year: number;
  selectedTour: string;
  onlyAvailable: boolean;
  isLoading: boolean;
  tourOptions: string[];
  tours: Tour[];
  onFiltersChange: (filters: {
    month: number;
    year: number;
    selectedTour: string;
    onlyAvailable: boolean;
  }) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCreateBookingType?: () => void;
}

export function CalendarFilters({
  month,
  year,
  selectedTour,
  onlyAvailable,
  isLoading,
  tourOptions,
  tours,
  onFiltersChange,
  onPrevMonth,
  onNextMonth,
  onCreateBookingType,
}: CalendarFiltersProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the selected tour object
  const getSelectedTourObject = () => {
    if (selectedTour === "All" || !selectedTour) return null;
    return tours.find((t) => t.title === selectedTour) || null;
  };

  const selectedTourObj = getSelectedTourObject();

  return (
    <div className="space-y-4 mb-6">
      {/* Month/Year Navigation and Filters Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            className="h-12 w-12"
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <span className="text-4xl font-bold select-none px-8">
            {monthNames[month - 1]} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="h-12 w-12"
            aria-label="Next Month"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </div>

        {/* Right side: Selected Tour Display and Filter */}
        <div className="flex items-center gap-4">
          {/* Selected Tour Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-weak font-medium">
              Filtered Tour:
            </span>
            <div className="flex items-center gap-2 bg-fill rounded-full px-3 py-1.5 border border-stroke-weak">
              {selectedTourObj && selectedTour !== "All" ? (
                <>
                  {/* Tour image */}
                  <div className="w-5 h-5 relative flex-shrink-0 rounded-full overflow-hidden">
                    {(() => {
                      if (selectedTourObj.images) {
                        try {
                          const images = JSON.parse(selectedTourObj.images);
                          const featureImage = images.find(
                            (image: any) => image.isFeature
                          );
                          return (
                            <img
                              src={featureImage?.url || images[0]?.url}
                              alt={selectedTourObj.title}
                              className="w-full h-full object-cover"
                            />
                          );
                        } catch (error) {
                          return (
                            <div className="w-full h-full bg-background flex items-center justify-center">
                              <MapPin className="h-2.5 w-2.5 text-weak" />
                            </div>
                          );
                        }
                      }
                      return (
                        <div className="w-full h-full bg-background flex items-center justify-center">
                          <MapPin className="h-2.5 w-2.5 text-weak" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tour title */}
                  <span className="text-sm font-medium text-strong">
                    {selectedTourObj.title}
                  </span>
                </>
              ) : (
                <>
                  {/* Default icon for "All" */}
                  <div className="w-5 h-5 relative flex-shrink-0 rounded-full overflow-hidden bg-background flex items-center justify-center">
                    <MapPin className="h-2.5 w-2.5 text-weak" />
                  </div>

                  {/* "All Tours" message */}
                  <span className="text-sm font-medium text-strong">
                    All Tours
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-5 flex items-center gap-2 border-stroke-strong bg-background text-text"
                type="button"
                disabled={isLoading}
              >
                <Filter className="h-5 w-5 text-weak" />
                <span className="text-sm font-medium">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 bg-background border-stroke-strong"
              align="end"
            >
              <div className="flex flex-col gap-4 p-2 min-w-[220px]">
                {/* Month Filter */}
                <div>
                  <label className="block text-xs text-weak mb-1">Month</label>
                  <Select
                    value={month.toString()}
                    onValueChange={(value) =>
                      onFiltersChange({
                        month: parseInt(value),
                        year,
                        selectedTour: selectedTour,
                        onlyAvailable,
                      })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-text">
                      {monthNames.map((monthName, index) => (
                        <SelectItem
                          key={index + 1}
                          value={(index + 1).toString()}
                        >
                          {monthName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Year Filter */}
                <div>
                  <label className="block text-xs text-weak mb-1">Year</label>
                  <Select
                    value={year.toString()}
                    onValueChange={(value) =>
                      onFiltersChange({
                        month,
                        year: parseInt(value),
                        selectedTour: selectedTour,
                        onlyAvailable,
                      })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-text">
                      {[2024, 2025, 2026].map((yearOption) => (
                        <SelectItem
                          key={yearOption}
                          value={yearOption.toString()}
                        >
                          {yearOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Tour Type Filter */}
                <div>
                  <label className="block text-xs text-weak mb-1">
                    Tour Type
                  </label>
                  <Select
                    value={selectedTour}
                    onValueChange={(value) =>
                      onFiltersChange({
                        month,
                        year,
                        selectedTour: value,
                        onlyAvailable,
                      })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full h-9 text-sm border-stroke-strong focus:border-brand focus:ring-brand bg-background text-text">
                      <SelectValue placeholder="Tour Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-text">
                      {tourOptions.map((tour) => (
                        <SelectItem key={tour} value={tour}>
                          {tour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Show Only Available Toggle */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={() =>
                      onFiltersChange({
                        month,
                        year,
                        selectedTour: selectedTour,
                        onlyAvailable: !onlyAvailable,
                      })
                    }
                    className="form-checkbox h-4 w-4 text-brand border-stroke-strong rounded focus:ring-brand"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-strong">
                    Show only available
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
