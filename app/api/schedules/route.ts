import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const tour_id = searchParams.get("tour_id");
  const rental_id = searchParams.get("rental_id");

  let query = supabase.from("schedules").select("*");

  if (tour_id) query = query.eq("tour_id", tour_id);
  if (rental_id) query = query.eq("rental_id", rental_id);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
