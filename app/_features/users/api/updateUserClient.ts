interface UpdateUserData {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}

export async function updateUserClient(data: UpdateUserData) {
  try {
    const response = await fetch(`/api/users/${data.user_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone_number: data.phone_number,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update user");
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}
