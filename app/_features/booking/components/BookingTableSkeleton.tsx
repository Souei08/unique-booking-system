import { Skeleton } from "@/components/ui/skeleton";

export function BookingTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filters skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg">
        {/* Table header */}
        <div className="border-b bg-muted/50">
          <div className="grid grid-cols-9 gap-4 p-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
          >
            <div className="grid grid-cols-9 gap-4 p-4">
              {Array.from({ length: 9 }).map((_, colIndex) => (
                <div key={colIndex} className="flex items-center">
                  {colIndex === 8 ? (
                    // Actions column
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : colIndex === 3 ? (
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
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
