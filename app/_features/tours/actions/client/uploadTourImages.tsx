import { createClient } from "@/supabase/client";

type ImageItem = {
  file?: File;
  url?: string;
  isFeature?: boolean;
};

export async function uploadImagesToSupabase(
  images: ImageItem[],
  tourId: string
) {
  const supabase = await createClient();
  const uploaded: { url: string; isFeature: boolean }[] = [];

  for (const img of images) {
    if (img.file) {
      const ext = img.file.name.split(".").pop();
      const fileName = `${tourId}/${Date.now()}-${Math.random()}.${ext}`;
      const { data, error } = await supabase.storage
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
        url: img.url || "",
        isFeature: img.isFeature || false,
      });
    }
  }
  return uploaded;
}
