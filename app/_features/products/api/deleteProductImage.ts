import { createClient } from "@/supabase/client";

export async function deleteProductImage(imageUrl: string) {
  const supabase = await createClient();

  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\/object\/public\/products\/(.+)/);
    const relativePath = match ? match[1] : null;

    if (!relativePath) {
      console.warn("Could not compute relative path for deletion:", imageUrl);
      return;
    }

    console.log("Deleting from Supabase Storage path:", relativePath);
    const { error } = await supabase.storage
      .from("products")
      .remove([relativePath]);

    if (error) {
      console.error("Error deleting product image:", error);
    } else {
      console.log("Successfully deleted product image:", relativePath);
    }
  } catch (err) {
    console.error("Error deleting product image:", err);
  }
}

// import { createClient } from "@/supabase/client";

// export async function deleteProductImage(imageUrl: string) {
//   const supabase = await createClient();

//   try {
//     console.log("Attempting to delete image:", imageUrl);

//     const url = new URL(imageUrl);
//     const fileName = url.pathname.split("/").pop()?.split("?")[0];

//     if (!fileName) {
//       console.warn("Invalid or empty filename.");
//       return;
//     }

//     console.log("Looking for filename:", fileName);

//     const { data: files, error: listError } = await supabase.storage
//       .from("products")
//       .list("", { limit: 100 });

//     console.log("Files in 'products':", files);

//     if (listError) {
//       console.error("Failed to list files:", listError);
//       return;
//     }

//     console.log("All files in 'products':", files);

//     const match = files.find((f) => f.name === fileName);
//     if (!match) {
//       console.warn("No matching file found for deletion:", fileName);
//       return;
//     }

//     const { error } = await supabase.storage
//       .from("products")
//       .remove([match.name]);

//     if (error) {
//       console.error("Error deleting image:", error);
//     } else {
//       console.log("Successfully deleted image:", match.name);
//     }
//   } catch (err) {
//     console.error("Error deleting product image:", err);
//   }
// }
