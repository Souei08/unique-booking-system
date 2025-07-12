import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { bulkAssignProductToTours } from "../api/bulkAssignProductToTours";
import { bulkRemoveProductFromTours } from "../api/bulkRemoveProductFromTours";
import { Product } from "../types/product-types";
import {
  Loader2,
  Plus,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getToursWithAssignmentStatus } from "../api/getToursWithAssignmentStatus";
import { Tour } from "@/app/_features/tours/tour-types";

interface AssignProductToTourProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TourWithAssignmentStatus extends Tour {
  is_assigned: boolean;
}

const ITEMS_PER_PAGE = 6;

const AssignProductToTour: React.FC<AssignProductToTourProps> = ({
  product,
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tours, setTours] = useState<TourWithAssignmentStatus[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [selectedTours, setSelectedTours] = useState<Set<string>>(new Set());

  // Fetch tours with assignment status
  useEffect(() => {
    if (open) {
      fetchTours();
    }
  }, [open, currentPage, searchQuery]);

  const fetchTours = async () => {
    setIsLoadingTours(true);
    try {
      const res = await getToursWithAssignmentStatus({
        product_id: product.id,
        search_query: searchQuery || null,
        limit_count: ITEMS_PER_PAGE,
        offset_count: (currentPage - 1) * ITEMS_PER_PAGE,
      });
      setTours(res.data);
      setTotalCount(res.total_count);

      // Initialize selected tours based on current assignment status
      const initialSelection = new Set<string>();
      res.data.forEach((tour) => {
        if (tour.is_assigned) {
          initialSelection.add(tour.id);
        }
      });
      setSelectedTours(initialSelection);
    } catch (error) {
      console.error("Error fetching tours:", error);
      toast.error("Failed to fetch tours");
      setTours([]);
      setTotalCount(0);
    } finally {
      setIsLoadingTours(false);
    }
  };

  const handleTourToggle = (tourId: string) => {
    const newSelection = new Set(selectedTours);
    if (newSelection.has(tourId)) {
      newSelection.delete(tourId);
    } else {
      newSelection.add(tourId);
    }
    setSelectedTours(newSelection);
  };

  const handleUpdateAssignments = async () => {
    try {
      setIsLoading(true);

      // Find tours to assign (selected but not currently assigned)
      const toursToAssign = tours
        .filter((tour) => selectedTours.has(tour.id) && !tour.is_assigned)
        .map((tour) => tour.id);

      // Find tours to remove (not selected but currently assigned)
      const toursToRemove = tours
        .filter((tour) => !selectedTours.has(tour.id) && tour.is_assigned)
        .map((tour) => tour.id);

      // Perform bulk operations
      if (toursToAssign.length > 0) {
        await bulkAssignProductToTours({
          product_id: product.id,
          tour_ids: toursToAssign,
        });
      }

      if (toursToRemove.length > 0) {
        await bulkRemoveProductFromTours({
          product_id: product.id,
          tour_ids: toursToRemove,
        });
      }

      const totalChanges = toursToAssign.length + toursToRemove.length;
      if (totalChanges > 0) {
        toast.success(`Updated ${totalChanges} tour assignment(s)`);
        fetchTours(); // Refresh the data
        router.refresh();
      } else {
        toast.info("No changes made");
      }
    } catch (error) {
      console.error("Error updating tour assignments:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update tour assignments"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage * ITEMS_PER_PAGE < totalCount) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedTours(new Set());
  };

  // Advanced pagination range logic
  const getPaginationRange = () => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + 1 + i
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }
    return [];
  };

  const paginationRange = getPaginationRange();

  const selectedCount = selectedTours.size;
  const totalTours = tours.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Assign "{product.name}" to Tours
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Click tours to select/deselect, then click Update to save changes
          </p>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex-shrink-0 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tours by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex-shrink-0 py-3 border-t border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedCount} of {totalTours} tours selected
            </div>
            <Button
              onClick={handleUpdateAssignments}
              disabled={isLoading || isLoadingTours}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Update Assignments
            </Button>
          </div>
        </div>

        {/* Tours List */}
        <div className="flex-1 py-4">
          {isLoadingTours ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading tours...
              </span>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No tours found matching your search."
                  : "No tours available."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tours.map((tour) => {
                const isSelected = selectedTours.has(tour.id);
                let imageUrl = "";

                // Parse the images field to get the first image
                try {
                  const images = JSON.parse(tour.images || "[]");
                  if (images.length > 0) {
                    imageUrl = images[0].url || images[0];
                  }
                } catch (error) {
                  // If parsing fails, treat images as a string
                  imageUrl = tour.images || "";
                }

                return (
                  <div
                    key={tour.id}
                    className={`flex items-center justify-between p-4 border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => handleTourToggle(tour.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="h-6 w-6 flex-shrink-0 rounded border-2 flex items-center justify-center">
                        {isSelected ? (
                          <Check className="h-4 w-4 text-blue-600" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </div>

                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={tour.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {tour.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium truncate">
                            {tour.title}
                          </h4>
                          {tour.is_assigned && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Currently Assigned
                            </Badge>
                          )}
                        </div>
                        {tour.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tour.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginationRange.length > 0 && (
          <div className="flex-shrink-0 py-4 border-t">
            <nav className="flex items-center justify-between">
              <div className="flex flex-1 justify-end items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || isLoadingTours}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="mx-4 flex items-center gap-1">
                  {paginationRange.map((pageNumber, index) =>
                    typeof pageNumber === "string" ? (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={index}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={isLoadingTours}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8 w-8 p-0 text-sm"
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    currentPage * ITEMS_PER_PAGE >= totalCount || isLoadingTours
                  }
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignProductToTour;
