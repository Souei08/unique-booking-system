"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface CardListProps<TData> {
  data: TData[];
  renderCard: (item: TData, index: number) => ReactNode;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  entityName?: string;
  className?: string;
}

export function CardList<TData>({
  data,
  renderCard,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onNextPage,
  onPreviousPage,
  onPageChange,
  isLoading,
  entityName = "results",
  className = "",
}: CardListProps<TData>) {
  const showPagination = onNextPage && onPreviousPage && onPageChange;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPaginationRange = () => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

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

  const paginationRange = totalPages > 1 ? getPaginationRange() : [];

  return (
    <div className={`w-full font-['Montserrat'] ${className}`}>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-white rounded-sm border border-stroke-strong shadow-sm p-6">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="w-full">
              {renderCard(item, index)}
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center h-32 text-gray-500">
            No {entityName} found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && paginationRange.length > 0 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
        >
          <div className="flex flex-1 justify-end items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviousPage}
              disabled={page === 1 || isLoading}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="mx-4 flex items-center gap-1">
              {paginationRange.map((pageNumber, index) =>
                typeof pageNumber === "string" ? (
                  <span key={index} className="px-2 py-1 text-sm">
                    ...
                  </span>
                ) : (
                  <Button
                    key={index}
                    onClick={() => onPageChange(pageNumber)}
                    disabled={isLoading}
                    variant={page === pageNumber ? "default" : "outline"}
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
              onClick={onNextPage}
              disabled={page * pageSize >= totalCount || isLoading}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
