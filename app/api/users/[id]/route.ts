import { NextRequest, NextResponse } from "next/server";
import { updateUserServerAction } from "@/app/_features/users/api/updateUser";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user_id = params.id;
    const body = await request.json();
    const { first_name, last_name, role, phone_number } = body;

    // Validate required fields
    if (!first_name || !last_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: first_name, last_name, role" },
        { status: 400 }
      );
    }

    // Call the server action
    const result = await updateUserServerAction({
      user_id,
      first_name,
      last_name,
      role,
      phone_number,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in user update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
