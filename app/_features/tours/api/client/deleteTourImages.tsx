import { createClient } from "@/supabase/client";

export async function deleteRemovedImages(
  oldImages: { url: string }[],
  newImages: { url: string }[]
) {
  const supabase = await createClient();

  const removed = oldImages.filter((oldImg) => {
    const oldUrl = oldImg.url;
    return (
      !newImages.some((newImg) => newImg.url === oldUrl) &&
      oldUrl.startsWith("https://")
    );
  });

  const pathsToDelete = removed
    .map((img) => {
      try {
        const url = new URL(img.url);
        const parts = url.pathname.split("/");
        const bucketIndex = parts.findIndex((p) => p === "tour-images");

        if (bucketIndex === -1) return null;

        return parts.slice(bucketIndex + 1).join("/");
      } catch (e) {
        console.warn("Invalid URL format:", img.url);
        return null;
      }
    })
    .filter(Boolean) as string[];

  if (pathsToDelete.length > 0) {
    const { error } = await supabase.storage
      .from("tour-images")
      .remove(pathsToDelete);

    if (error) {
      console.error("Error deleting images from bucket:", error);
    } else {
      console.log("Deleted from Supabase:", pathsToDelete);
    }
  } else {
    console.log("No images to delete.");
  }
}
