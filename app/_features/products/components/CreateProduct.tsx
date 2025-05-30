import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "../types/product-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { createProduct } from "../api/createProduct";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  image_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductProps {
  onSuccess?: (product: Product) => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image_url: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      const supabase = await createClient();

      let imageUrl = data.image_url;

      // Upload image if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error("Failed to upload image");
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create product using the API function
      const newProduct = await createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: imageUrl,
      });

      toast.success("Product created successfully");
      reset();
      setImageFile(null);
      setImagePreview(null);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newProduct);
      }

      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Product Name
              </Label>
              <Input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1.5"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
                className="mt-1.5 resize-none"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
                Price
              </Label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  id="price"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="image"
                className="text-sm font-medium text-gray-700"
              >
                Product Image
              </Label>
              <div className="mt-1.5">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or WEBP (MAX. 2MB)
                          </p>
                        </div>
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
                  {imagePreview && (
                    <div className="relative h-32 w-32">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setImageFile(null);
                setImagePreview(null);
              }}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
