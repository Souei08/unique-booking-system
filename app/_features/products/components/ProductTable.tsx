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
import UpdateProduct from "./UpdateProduct";
import AssignProductToTour from "./AssignProductToTour";
import { Tooltip } from "@/components/ui/tooltip";
import MainModal, {
  ImagePreviewModal,
} from "@/app/_components/custom-modals/main-modal";
import { DeleteAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

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
    }
  };

  const handleImagePreview = (imageUrl: string, productName: string) => {
    setPreviewImage({ url: imageUrl, name: productName });
    setIsPreviewOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image_url",
      header: "Product Image",
      size: 120,
      cell: ({ row }) => (
        <div className="flex justify-center items-center w-full">
          <div className="relative h-24 w-full flex items-center justify-center rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            {row.original.image_url ? (
              <>
                <Image
                  src={row.original.image_url}
                  alt={`${row.original.name} product image`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  sizes="96px"
                  priority={false}
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
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
                  <span className="text-gray-500 text-xs">📷</span>
                </div>
                <span className="text-gray-500 text-xs font-medium text-center px-2">
                  No Image
                </span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.original.description || "No description"}
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
          <MainModal
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            title="Edit Product"
            description="Edit the product details"
            maxWidth="2xl"
            trigger={
              <Tooltip content="Edit product details">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(row.original)}
                  className="h-8 px-3 text-xs font-medium text-weak"
                >
                  <Pencil className="h-2 w-2 mr-1 text-weak" />
                  Edit Product
                </Button>
              </Tooltip>
            }
            onClose={() => setIsEditDialogOpen(false)}
          >
            {editingProduct && (
              <UpdateProduct
                product={editingProduct}
                onSuccess={() => setIsEditDialogOpen(false)}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </MainModal>
          <AssignProductToTour product={row.original} tours={tours as any} />
          <Tooltip content="Permanently delete this product">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
              disabled={isDeleting}
              className="h-8 px-3 text-xs font-medium text-weak"
            >
              <Trash2 className="h-4 w-4 text-weak" />
              Remove Product
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

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageSrc={previewImage?.url || ""}
        imageAlt={previewImage?.name || "Product image"}
      />
      {/* <MainModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title="Product Image Preview"
        maxWidth="4xl"
        showCloseButton={true}
        className="p-0 overflow-hidden"
      >
        <div className="relative">
          {previewImage && (
            <div className="relative w-full flex items-center justify-center">
              <div className="relative max-w-full max-h-[80vh]">
                <Image
                  src={previewImage.url}
                  alt={`${previewImage.name} product image`}
                  width={0}
                  height={0}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, (max-width: 1600px) 80vw, 1600px"
                  priority={true}
                  quality={95}
                  unoptimized={false}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h3 className="text-white text-lg font-semibold">
                  {previewImage.name}
                </h3>
              </div>
            </div>
          )}
        </div>
      </MainModal> */}

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
