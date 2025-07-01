import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles, Globe, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLoaderProps {
  type?: "spinner" | "skeleton" | "full-page" | "content";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  showLogo?: boolean;
}

export function DashboardLoader({
  type = "spinner",
  size = "md",
  message = "Loading...",
  className,
  showLogo = false,
}: DashboardLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const messageSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (type === "full-page") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {showLogo && (
          <div className="mb-8 flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-brand animate-pulse" />
              <div className="absolute inset-0 w-10 h-10 bg-brand/20 rounded-full animate-ping" />
            </div>
            <span className="text-2xl font-bold text-foreground bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
              Unique Tours & Rentals
            </span>
          </div>
        )}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className={cn(
                "animate-spin rounded-full border-3 border-slate-200 dark:border-slate-700 border-t-brand",
                sizeClasses[size]
              )}
            />
            <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p
              className={cn(
                "text-slate-600 dark:text-slate-300 font-medium",
                messageSizeClasses[size]
              )}
            >
              {message}
            </p>
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-1 h-1 bg-brand rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1 h-1 bg-brand rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1 h-1 bg-brand rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "content") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div
            className={cn(
              "animate-spin rounded-full border-3 border-slate-200 dark:border-slate-700 border-t-brand",
              sizeClasses[size]
            )}
          />
          <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-pulse" />
        </div>
        <div className="text-center space-y-3">
          <p
            className={cn(
              "text-slate-600 dark:text-slate-300 font-medium",
              messageSizeClasses[size]
            )}
          >
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2
            className={cn("animate-spin text-brand", sizeClasses[size])}
          />
          <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p
            className={cn(
              "text-slate-600 dark:text-slate-300 font-medium",
              messageSizeClasses[size]
            )}
          >
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized loaders for common dashboard patterns
export function DashboardPageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-8">
        {/* Simple Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Unique Tours & Rentals
          </h1>
        </div>

        {/* Simple Loading Animation */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-slate-200 dark:border-slate-700 border-t-brand rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Search and filters skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="grid grid-cols-6 gap-6 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="grid grid-cols-6 gap-6 p-4">
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <div key={colIndex} className="flex items-center">
                  {colIndex === 5 ? (
                    // Actions column
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ) : colIndex === 2 ? (
                    // Status column
                    <Skeleton className="h-6 w-20 rounded-full" />
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CardGridLoader({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
