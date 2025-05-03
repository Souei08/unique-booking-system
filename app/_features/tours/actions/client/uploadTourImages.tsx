import { createClient } from "@/supabase/client";
import { TourLocalImage } from "../../types/TourTypes";

export async function uploadImagesToSupabase(
  images: TourLocalImage[],
  tourId: string
): Promise<{ url: string; isFeature: boolean }[]> {
  const supabase = await createClient();
  const uploaded: { url: string; isFeature: boolean }[] = [];

  for (const img of images) {
    if (img.file) {
      const ext = img.file.name.split(".").pop();
      const fileName = `${tourId}/${Date.now()}-${Math.random()}.${ext}`;

      const { error } = await supabase.storage
        .from("tour-images")
        .upload(fileName, img.file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("tour-images")
        .getPublicUrl(fileName);

      uploaded.push({
        url: publicUrlData.publicUrl,
        isFeature: img.isFeature || false,
      });
    } else {
      uploaded.push({
        url: img.url, // use preview as fallback for Supabase URL
        isFeature: img.isFeature || false,
      });
    }
  }

  return uploaded;
}
