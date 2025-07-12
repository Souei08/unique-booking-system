"use client";

import React, { useState, useEffect } from "react";
import { TableV2 } from "@/app/_components/common/TableV2";
import { Promo } from "../types/promo-types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Infinity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UpsertPromo from "./UpsertPromo";
import { getAllPromos } from "../api/getAllPromos";
import { AlertDialog } from "@/components/ui/dialog";
import { PromoFilters, PromoFilters as PromoFiltersType } from "./PromoFilters";

// Table Skeleton Component
const PromoTableSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg">
        {/* Table header */}
        <div className="border-b bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-6 py-4">
            <div className="grid grid-cols-7 gap-4 items-center">
              {Array.from({ length: 7 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-16" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

interface PromoTableProps {
  initialPromos?: Promo[];
}

export default function PromoTable({ initialPromos = [] }: PromoTableProps) {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Pagination state - simplified like BookingTableV2
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState<PromoFiltersType>({
    search_query: "",
    status_filter: "all",
    discount_type_filter: "all",
  });

  const fetchPromos = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const offset = (pageNum - 1) * pageSize;

      // Convert filters to API format
      const statusFilter =
        filters.status_filter === "all" ? null : filters.status_filter;
      const discountTypeFilter =
        filters.discount_type_filter === "all"
          ? null
          : filters.discount_type_filter;

      const response = await getAllPromos({
        limit: pageSize,
        offset,
        searchText: filters.search_query || null,
        statusFilter,
        discountTypeFilter,
      });

      setPromos(response.data);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error("Error fetching promos:", error);
      toast.error("Failed to fetch promos");
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPromos(page);
  }, [page, filters]);

  const handleNext = () => {
    if (page * pageSize < totalCount) {
      setPage((p) => p + 1);
    }
  };

  const handlePrevious = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (promo: Promo) => {
    setPromoToDelete(promo);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete-promo/${promoToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete promo");
      }

      toast.success("Promo deleted successfully");
      await fetchPromos(page);
    } catch (error) {
      console.error("Error deleting promo:", error);
      toast.error("Failed to delete promo");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPromoToDelete(null);
    }
  };

  const handleFiltersChange = (newFilters: PromoFiltersType) => {
    setIsFilterLoading(true);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setIsFilterLoading(true);
    setPage(1); // Reset to first page when search changes
    setFilters((prev) => ({
      ...prev,
      search_query: query.trim(),
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPromos(page);
    } catch (error) {
      console.error("Error refreshing promos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Clear filter loading when fetchPromos completes
  useEffect(() => {
    if (!isLoading && isFilterLoading) {
      setIsFilterLoading(false);
    }
  }, [isLoading, isFilterLoading]);

  const columns: ColumnDef<Promo>[] = [
    {
      accessorKey: "code",
      header: "Promo Code",
    },
    {
      accessorKey: "discount_type",
      header: "Discount Type",
      cell: ({ row }) => {
        const type = row.getValue("discount_type") as string;
        let displayText = "";
        let badgeClasses = "";

        if (type === "fixed_amount") {
          displayText = "FIXED AMOUNT";
          badgeClasses = "bg-blue-100 text-blue-800 border-blue-200";
        } else if (type === "percentage") {
          displayText = "PERCENTAGE";
          badgeClasses = "bg-purple-100 text-purple-800 border-purple-200";
        } else {
          displayText = type.toUpperCase();
          badgeClasses = "bg-gray-100 text-gray-800 border-gray-200";
        }

        return (
          <Badge variant="outline" className={badgeClasses}>
            {displayText}
          </Badge>
        );
      },
    },
    {
      accessorKey: "discount_value",
      header: "Discount Value",
      cell: ({ row }) => {
        const type = row.getValue("discount_type") as string;
        const value = row.getValue("discount_value") as number;
        return type === "percentage" ? `${value}%` : `$${value}`;
      },
    },
    {
      accessorKey: "expires_at",
      header: "Expires At",
      cell: ({ row }) => {
        return format(new Date(row.getValue("expires_at")), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "max_uses",
      header: "Max Uses",
      cell: ({ row }) => {
        const value = row.getValue("max_uses") as number;
        return value === 0 ? <Infinity className="w-7 h-7" /> : value;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created_at")), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        const expiresAt = row.getValue("expires_at") as string;
        const now = new Date();
        const expiryDate = new Date(expiresAt);
        const isExpired = expiryDate < now;

        let statusText = "";
        let badgeClasses = "";

        if (isExpired) {
          statusText = "Expired";
          badgeClasses = "bg-red-100 text-red-800 border-red-200";
        } else if (isActive) {
          statusText = "Active";
          badgeClasses = "bg-green-100 text-green-800 border-green-200";
        }

        return (
          <Badge variant="outline" className={badgeClasses}>
            {statusText}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const promo = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedPromo(promo);
                setIsUpdateDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(promo)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Show loading skeleton when initially loading or when filters are being applied
  if ((isLoading && promos.length === 0) || isFilterLoading) {
    return <PromoTableSkeleton />;
  }

  return (
    <div className="mt-7">
      {/* Enhanced Filters with Search and Refresh */}
      <PromoFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isLoading={isFilterLoading}
      />

      {/* Loading overlay for table when refreshing */}
      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Refreshing promos...</span>
            </div>
          </div>
        )}

        <TableV2
          columns={columns}
          data={promos}
          isLoading={isLoading || isFilterLoading}
          entityName="promos"
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onNextPage={handleNext}
          onPreviousPage={handlePrevious}
          onPageChange={handlePageChange}
        />
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Promo</DialogTitle>
          </DialogHeader>
          {selectedPromo && (
            <UpsertPromo
              promo={selectedPromo}
              onSuccess={() => {
                setIsUpdateDialogOpen(false);
                fetchPromos(page);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        type="error"
        config={{
          title: "Delete Confirmation",
          message: `Are you sure you want to delete promo code "${promoToDelete?.code}"? 
          This action cannot be undone.`,
          confirmText: "Delete",
          cancelText: "Cancel",
        }}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  );
}
