"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TableV2Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  entityName?: string;
}

export function TableV2<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter...",
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onNextPage,
  onPreviousPage,
  onPageChange,
  isLoading,
  entityName = "results",
}: TableV2Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

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
    <div className="w-full font-['Montserrat']">
      {filterColumn && (
        <div className="flex items-center py-4">
          <Input
            placeholder={filterPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-sm bg-white border border-stroke-strong shadow-sm overflow-hidden">
        <Table className="font-['Montserrat'] bg-white">
          <TableHeader className="bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-6 py-3 bg-gray-100 text-left text-sm font-bold uppercase tracking-wide text-strong"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className=" bg-white"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-text font-medium"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Add empty rows to fill the table height */}
                {Array.from({
                  length: Math.max(
                    0,
                    pageSize - table.getRowModel().rows.length
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="bg-white">
                    {Array.from({ length: columns.length }).map(
                      (_, cellIndex) => (
                        <TableCell
                          key={`empty-cell-${index}-${cellIndex}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-text font-medium"
                        >
                          &nbsp;
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
