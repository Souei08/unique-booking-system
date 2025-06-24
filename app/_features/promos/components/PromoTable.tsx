"use client";

import React, { useState, useEffect } from "react";
import { TableV2 } from "@/app/_components/common/TableV2";
import { Promo } from "../types/promo-types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import UpdatePromo from "./UpdatePromo";
import { getAllPromos } from "../api/getAllPromos";

interface PromoTableProps {
  initialPromos: Promo[];
}

export default function PromoTable({ initialPromos }: PromoTableProps) {
  const router = useRouter();
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const refreshPromos = async () => {
    try {
      const updatedPromos = await getAllPromos();
      setPromos(updatedPromos);
    } catch (error) {
      console.error("Error refreshing promos:", error);
      toast.error("Failed to refresh promos");
    }
  };

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
        return type.charAt(0).toUpperCase() + type.slice(1);
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
    },
    {
      accessorKey: "times_used",
      header: "Times Used",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
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
              onClick={() => handleDelete(promo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/promos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete promo");
      }

      toast.success("Promo deleted successfully");
      await refreshPromos();
    } catch (error) {
      console.error("Error deleting promo:", error);
      toast.error("Failed to delete promo");
    }
  };

  return (
    <div className="mt-7">
      <TableV2 columns={columns} data={promos} />
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Promo</DialogTitle>
          </DialogHeader>
          {selectedPromo && (
            <UpdatePromo
              promo={selectedPromo}
              onSuccess={() => {
                setIsUpdateDialogOpen(false);
                refreshPromos();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
