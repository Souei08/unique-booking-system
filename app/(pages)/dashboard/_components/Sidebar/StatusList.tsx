import type { BookingStatus } from "../shared/types";

interface StatusListProps {
  statuses: BookingStatus[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const StatusList = ({ statuses }: StatusListProps) => {
  return (
    <div className="mt-8">
      <h3 className="px-3 text-sm font-medium text-gray-500">Booking Status</h3>
      <div className="mt-1 space-y-1">
        {statuses.map((status) => (
          <a
            key={status.name}
            href={status.href}
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <span
              className={classNames(
                status.bgColorClass,
                "mr-4 h-2.5 w-2.5 rounded-full"
              )}
            />
            <span className="truncate">{status.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
