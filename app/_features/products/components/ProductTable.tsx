"use client";

import React, { useState } from "react";
import { TableV2 } from "@/app/_components/common/TableV2";
import { Product } from "../types/product-types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "../api/deleteProduct";
import { useRouter } from "next/navigation";
import AssignProductToTour from "./AssignProductToTour";
import { Tooltip } from "@/components/ui/tooltip";

import { DeleteAlertDialog } from "@/app/_components/custom-modals/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UpsertProductV2 from "./UpsertProductV2";

interface ProductTableProps {
  products: Product[];
  tours: { id: string; title: string }[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products, tours }) => {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete);
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleImagePreview = (imageUrl: string, productName: string) => {
    setPreviewImage({ url: imageUrl, name: productName });
    setIsPreviewOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            {row.original.image_url ? (
              <>
                <Image
                  src={row.original.image_url}
                  alt={`${row.original.name} product image`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  sizes="56px"
                  priority={false}
                  quality={90}
                />
                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
                  onClick={() =>
                    handleImagePreview(
                      row.original.image_url!,
                      row.original.name
                    )
                  }
                >
                  <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-sm">📷</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-base leading-tight truncate">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed mt-1 line-clamp-2">
              {row.original.description || "No description available"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-medium">${row.original.price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({ row }) => (
        <div>{format(new Date(row.original.created_at), "MMM d, yyyy")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Tooltip content="Edit this product">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
              className="h-8 px-3 text-xs font-medium"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Tooltip>

          <Tooltip content="Assign to tours">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignDialogOpen(true)}
              className="h-8 px-3 text-xs font-medium"
            >
              Assign to tour
            </Button>
          </Tooltip>

          <Tooltip content="Permanently delete this product">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
              disabled={isDeleting}
              className="h-8 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <TableV2
        columns={columns}
        data={products}
        filterColumn="name"
        filterPlaceholder="Filter products..."
      />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Edit the product details</DialogDescription>
          </DialogHeader>

          <UpsertProductV2
            product={editingProduct || undefined}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Product to Tour Dialog */}
      <AssignProductToTour
        product={
          products.find((p) => p.id === editingProduct?.id) || products[0]
        }
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      />

      {/* Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full flex items-center justify-center bg-gray-50">
            {previewImage && (
              <div className="relative max-w-full max-h-[80vh] ">
                <Image
                  src={previewImage.url}
                  alt={`${previewImage.name} product image`}
                  width={0}
                  height={0}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, (max-width: 1600px) 80vw, 1600px"
                  priority={true}
                  quality={95}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="this product"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ProductTable;
