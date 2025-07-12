import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "../types/product-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { createProduct } from "../api/createProduct";
import { updateProduct } from "../api/updateProduct";
import { deleteProductImage } from "../api/deleteProductImage";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than $1,000,000"),
  image_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface UpsertProductProps {
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

const UpsertProductV2: React.FC<UpsertProductProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageMarkedForRemoval, setImageMarkedForRemoval] = useState(false);

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      image_url: product?.image_url || "",
    },
    mode: "onChange",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    setImageMarkedForRemoval(false);

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageError("Image size must be less than 2MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Please upload a valid image file (PNG, JPG, or WEBP)");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageMarkedForRemoval(true);
  };

  // Separate function to handle image upload
  const uploadImage = async (file: File): Promise<string> => {
    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (uploadError) {
      throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || "";
  };

  // Separate function to handle image deletion
  const deleteOldImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    try {
      console.log("Deleting old product image:", imageUrl);
      await deleteProductImage(imageUrl);
      // Add a small delay to ensure deletion is processed
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw error here as it shouldn't prevent the update
    }
  };

  // Separate function for creating a new product
  const handleCreateProduct = async (data: ProductFormData) => {
    let imageUrl: string | undefined;

    // Upload new image if provided
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const newProduct = await createProduct({
      name: data.name.trim(),
      description: data.description?.trim() || "",
      price: data.price,
      image_url: imageUrl,
    });

    toast.success("Product created successfully");
    reset();
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    setImageMarkedForRemoval(false);

    if (onSuccess) onSuccess(newProduct);
  };

  // Separate function for updating an existing product
  const handleUpdateProduct = async (data: ProductFormData) => {
    let imageUrl: string | undefined = data.image_url;

    // Handle image changes
    if (imageFile || imageMarkedForRemoval) {
      // Delete old image if it exists
      if (product?.image_url) {
        await deleteOldImage(product.image_url);
      }

      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else {
        // Image was marked for removal
        imageUrl = undefined;
      }
    }

    const updatedProduct = await updateProduct(product!.id, {
      name: data.name.trim(),
      description: data.description?.trim() || "",
      price: data.price,
      image_url: imageUrl,
    });

    toast.success("Product updated successfully");
    setImageMarkedForRemoval(false);
    setImageFile(null);
    setImagePreview(imageUrl || null);

    if (onSuccess) onSuccess(updatedProduct);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (isLoading) return;

    if (!data.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (data.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        await handleUpdateProduct(data);
      } else {
        await handleCreateProduct(data);
      }

      router.refresh();
    } catch (err) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} product:`,
        err
      );
      toast.error(`Failed to ${isEditing ? "update" : "create"} product`);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputBorderClasses = (fieldName: keyof ProductFormData) => {
    if (errors[fieldName]) return "border-red-500";
    return "border-gray-300";
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name */}
        <div>
          <Label htmlFor="name" className="mb-2 block">
            Product Name *
          </Label>
          <Input
            id="name"
            {...register("name")}
            className={cn(getInputBorderClasses("name"))}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="mb-2 block">
            Description
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={3}
            className={cn(getInputBorderClasses("description"))}
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price" className="mb-2 block">
            Price *
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              type="number"
              id="price"
              step="0.01"
              min="0.01"
              {...register("price", { valueAsNumber: true })}
              className={cn("pl-7", getInputBorderClasses("price"))}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <Label htmlFor="image" className="mb-2 block">
            Product Image
          </Label>

          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
                imageError
                  ? "border-red-300 bg-red-50"
                  : imagePreview
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {!imagePreview ? (
                // Empty state
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Upload product image
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    PNG, JPG or WEBP • Max 2MB
                  </p>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                // Image preview state
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Image uploaded
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Click below to change the image
                    </p>
                    <label
                      htmlFor="image"
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Change Image
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {imageError && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>{imageError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpsertProductV2;
