import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/supabase/middleware";
import { createClient } from "@/supabase/server";

// Define protected routes & required roles
const protectedRoutes = {
  "/dashboard": ["admin", "staff"], // Only Admins can access
  "/api/users": ["admin"], // Only Admins can manage users
  "/api/bookings": ["customer", "staff", "admin"], // Customers book, staff/admin manage
  "/api/reviews": ["customer", "admin"], // Customers review, Admins moderate
  "/api/tours/manage": ["staff", "admin"], // Staff/Admins manage tours
  "/api/rentals/manage": ["staff", "admin"], // Staff/Admins manage rentals
  "/api/admin": ["admin"], // Admin-only routes
};

export async function middleware(request: NextRequest) {
  // Update session with Supabase authentication
  let response = await updateSession(request);

  const supabase = await createClient();

  // Get user session from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow all requests to auth routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return response;
  }

  // Redirect unauthorized users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Fetch user role from the database
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("supabase_id", user.id)
    .single();

  if (error || !userData) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  const userRole = userData.role;
  const requestPath = request.nextUrl.pathname;

  // Handle root path redirect
  if (requestPath === "/") {
    if (userRole === "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/tours", request.url));
    }
  }

  // Check if the route is protected and user has the required role
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (requestPath.startsWith(route) && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  return response;
}

// Apply middleware to API routes and protected pages
export const config = {
  matcher: [
    "/api/:path((?!webhooks/stripe).*)", // Protect all API routes
    "/dashboard/:path*", // Protect dashboard pages
  ],
};
