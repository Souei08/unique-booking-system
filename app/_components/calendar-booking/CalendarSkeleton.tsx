import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <>
      {/* Weekday Headers */}
      <div className="hidden lg:grid grid-cols-7 col-span-7 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      {/* Calendar cells - 35 cells to match a typical month */}
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] p-2 sm:p-3 rounded-lg border border-gray-200 bg-background"
        >
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </>
  );
}
