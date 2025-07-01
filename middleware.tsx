import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/supabase/middleware";
import { createClient } from "@/supabase/server";

// Define protected routes & required roles with more efficient structure
const protectedRoutes = new Map([
  ["/dashboard", ["admin", "reservation_agent"]], // General dashboard access
  ["/dashboard/bookings", ["admin", "reservation_agent"]], // Only admin and reservation agents
  ["/dashboard/calendar", ["admin", "reservation_agent"]], // Only admin and reservation agents
  ["/dashboard/settings", ["admin", "reservation_agent"]], // Only admin and reservation agents
  ["/api/users", ["admin", "reservation_agent"]],
  ["/api/bookings", ["admin", "reservation_agent"]],
  ["/api/reviews", ["admin", "reservation_agent"]],
  ["/api/tours/manage", ["admin", "reservation_agent"]],
  ["/api/admin", ["admin"]],
]);

// Cache for user roles to avoid repeated database calls
const userRoleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Batch requests for better performance
const pendingRoleRequests = new Map<string, Promise<string | null>>();

async function getUserRole(userId: string, supabase: any) {
  const now = Date.now();
  const cached = userRoleCache.get(userId);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.role;
  }

  // Check if there's already a pending request for this user
  if (pendingRoleRequests.has(userId)) {
    return await pendingRoleRequests.get(userId)!;
  }

  // Create a new request
  const rolePromise = (async () => {
    try {
      // Try to get role from JWT claims first (if implemented)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("user", user);

      if (user?.user_metadata?.role) {
        const role = user.user_metadata.role;
        userRoleCache.set(userId, { role, timestamp: now });
        return role;
      }

      // Fallback to database query using optimized function
      const { data: userData, error } = await supabase.rpc("get_user_role", {
        user_id: userId,
      });

      if (error || !userData) {
        return null;
      }

      userRoleCache.set(userId, { role: userData, timestamp: now });
      return userData;
    } finally {
      // Clean up pending request
      pendingRoleRequests.delete(userId);
    }
  })();

  pendingRoleRequests.set(userId, rolePromise);
  return await rolePromise;
}

function hasRequiredRole(userRole: string, requestPath: string): boolean {
  for (const [route, allowedRoles] of protectedRoutes) {
    if (requestPath.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true; // If no specific route match, allow access
}

export async function middleware(request: NextRequest) {
  const requestPath = request.nextUrl.pathname;

  // Allow all requests to auth routes immediately
  if (requestPath.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Allow public routes (widget, static assets, etc.)
  if (
    requestPath.startsWith("/widget") ||
    requestPath.startsWith("/_next") ||
    requestPath.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Update session with Supabase authentication
  let response = await updateSession(request);

  const supabase = await createClient();

  // Get user session from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthorized users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Get user role (with caching and batching)
  const userRole = await getUserRole(user.id, supabase);

  if (!userRole) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  // Handle root path redirect
  if (requestPath === "/") {
    if (userRole === "customer") {
      // Redirect customers to public tours page
      return NextResponse.redirect(new URL("/tours", request.url));
    } else if (userRole === "staff") {
      // Redirect staff to forbidden page
      return NextResponse.redirect(new URL("/forbidden", request.url));
    } else {
      // Admin and reservation agents get redirected to their dashboard
      return NextResponse.redirect(new URL("/dashboard/", request.url));
    }
  }

  // Check if the route is protected and user has the required role
  if (!hasRequiredRole(userRole, requestPath)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return response;
}

// Apply middleware to API routes and protected pages
export const config = {
  matcher: [
    "/", // Handle root path for role-based redirection
    "/api/:path((?!webhooks/stripe).*)", // Protect all API routes
    "/dashboard/:path*", // Protect dashboard pages
  ],
};
