import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
  return (
    <div className="group flex rounded-lg border border-stroke-weak transition-all duration-200 hover:border-brand/50 hover:bg-fill overflow-hidden relative">
      {/* Content column */}
      <div className="flex-1 p-5 space-y-4">
        {/* Header with title and status */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32 flex-1" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Booking details in a 2x2 grid layout */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer with user info and avatar */}
        <div className="pt-3 border-t border-stroke-weak">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-4">
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-1.5 justify-end">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured image column skeleton */}
      <div className="relative w-32 flex-shrink-0">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Reference number pill skeleton - floating on bottom right */}
      <div className="absolute bottom-3 right-3 z-10">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
