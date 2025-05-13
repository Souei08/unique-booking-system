import { revalidatePath } from "next/cache";

export async function revalidateTours() {
  // Revalidate the tours page
  revalidatePath("/dashboard/tours");
  // Also revalidate the public tours page if it exists
  revalidatePath("/tours");
}
