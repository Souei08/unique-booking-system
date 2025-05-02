import { createClient } from "@/supabase/client";

export async function deleteRemovedImages(
  oldImages: { url: string }[],
  newImages: { url: string }[]
) {
  const supabase = await createClient();

  // Only consider images with a real Supabase URL
  const removed = oldImages.filter(
    (oldImg) =>
      !newImages.some((newImg) => newImg.url === oldImg.url) &&
      oldImg.url.startsWith("https://") // or your Supabase storage base URL
  );

  // Extract the file path from the public URL
  const pathsToDelete = removed.map((img) => {
    // Example: https://xyz.supabase.co/storage/v1/object/public/tour-images/folder/file.jpg
    // You want: folder/file.jpg
    const url = new URL(img.url);
    const parts = url.pathname.split("/");
    // Find the index of the bucket name, then get the rest as the path
    const bucketIndex = parts.findIndex((p) => p === "tour-images");
    return parts.slice(bucketIndex + 1).join("/");
  });

  if (pathsToDelete.length > 0) {
    const { data, error } = await supabase.storage
      .from("tour-images")
      .remove(pathsToDelete);

    if (error) {
      console.error("Error deleting images from bucket:", error);
    }
  }
}
