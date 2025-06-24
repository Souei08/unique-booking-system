import { createClient } from "@/supabase/client";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting promo:", error);
      return NextResponse.json(
        { error: "Failed to delete promo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Promo deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/promos/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
