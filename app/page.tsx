import { getUser } from "@/app/_api/actions/auth/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect users based on their role
  if (user.role === "customer") {
    redirect("/tours");
  } else if (user.role === "staff") {
    redirect("/forbidden");
  } else {
    // Admin and reservation agents go to dashboard
    redirect("/dashboard/tours");
  }
}
