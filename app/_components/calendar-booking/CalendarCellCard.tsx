import React from "react";

interface Slot {
  tour_type: string;
  date: string;
  slot_time?: string;
  booked: number | string;
  available: number;
  added: number;
}

interface CalendarCellCardProps {
  dateKey: string;
  isPastDate: (dateKey: string) => boolean;
  getDaySlots: (dateKey: string) => Slot[];
  expandedDates: Set<string>;
  toggleDateExpansion: (dateKey: string) => void;
  handleDateCardClick: (dateKey: string, time: string, tour: string) => void;
  formatTime: (time: string) => string;
  isFullyBooked: (slot: Slot) => boolean;
  isPartiallyBooked: (slot: Slot) => boolean;
}

export const CalendarCellCard: React.FC<CalendarCellCardProps> = ({
  dateKey,
  isPastDate,
  getDaySlots,
  expandedDates,
  toggleDateExpansion,
  handleDateCardClick,
  formatTime,
  isFullyBooked,
  isPartiallyBooked,
}) => {
  const slots = getDaySlots(dateKey);
  const showMore = slots.length > 2 && !expandedDates.has(dateKey);
  const showLess = slots.length > 2 && expandedDates.has(dateKey);

  // Check if this is today's date
  const isToday = (dateKey: string): boolean => {
    const today = new Date();
    const date = new Date(dateKey);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Color logic for background
  const getBgColor = (slot: Slot) => {
    // if (isFullyBooked(slot)) return "bg-red-100";
    if (isFullyBooked(slot)) return "bg-emerald-100"; // Use green instead of red
    if (isPartiallyBooked(slot)) return "bg-green-100";
    if (isPastDate(dateKey)) return "bg-gray-200";
    return "bg-emerald-100";
  };

  // Color logic for text in slot
  const getTextColor = (slot: Slot) => {
    if (isPastDate(dateKey)) return "text-gray-400";
    return "text-strong";
  };

  // Color logic for stat text in slot
  const getStatTextColor = (slot: Slot) => {
    if (isPastDate(dateKey)) return "text-gray-400";
    // if (isFullyBooked(slot)) return "text-red-700";
    if (isFullyBooked(slot)) return "text-green-700"; // Use green instead of red
    if (isPartiallyBooked(slot)) return "text-green-700";
    return "text-green-700";
  };

  return (
    <div
      className={`h-full w-full flex flex-col p-2 sm:p-3 md:p-4 bg-background shadow-sm ${
        isToday(dateKey)
          ? "border-t-3 border-blue-500 ring-offset-1 bg-blue-50/30"
          : ""
      }`}
    >
      {/* Date label */}
      <div
        className={`font-semibold mb-2 text-xs flex items-center gap-1 uppercase tracking-wide ${
          isToday(dateKey)
            ? "text-blue-700 font-bold"
            : isPastDate(dateKey)
              ? "text-weak"
              : "text-strong"
        }`}
      >
        <span>
          {new Date(dateKey).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {isToday(dateKey) && (
          <span className="ml-1 text-[10px] font-normal text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
            TODAY
          </span>
        )}
        {isPastDate(dateKey) && !isToday(dateKey) && (
          <span className="ml-1 text-[10px] font-normal text-weak">(Past)</span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
        {slots.length > 0 && (
          <>
            {slots
              .slice(0, expandedDates.has(dateKey) ? undefined : 2)
              .map((slot, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer ${getBgColor(slot)} hover:opacity-90 transition-all group`}
                  onClick={() =>
                    handleDateCardClick(
                      dateKey,
                      slot.slot_time || "",
                      slot.tour_type || ""
                    )
                  }
                  style={{ minHeight: 36 }}
                >
                  {/* Time */}
                  {slot.slot_time && (
                    <span
                      className={`text-xs font-semibold text-brand group-hover:text-brand/90 min-w-[48px] ${isPastDate(dateKey) ? "text-gray-400" : ""}`}
                    >
                      {formatTime(slot.slot_time)}
                    </span>
                  )}
                  {/* Title */}
                  <span
                    className={`flex-1 truncate text-xs font-medium ${getTextColor(slot)}`}
                  >
                    {slot.tour_type}
                  </span>
                  {/* Booked/Available */}
                  <span
                    className={`flex items-center gap-1 text-[11px] ${getStatTextColor(slot)}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span>
                    {typeof slot.booked === "number"
                      ? slot.booked + slot.added
                      : slot.booked}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[11px] ${isPastDate(dateKey) ? "text-gray-400" : "text-weak"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
                    {slot.available}
                  </span>
                </div>
              ))}
            {showMore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDateExpansion(dateKey);
                }}
                className="w-full text-xs text-brand hover:text-brand/80 font-medium py-1 hover:bg-brand/5 rounded-lg transition-colors mt-1"
              >
                +{slots.length - 2} more
              </button>
            )}
            {showLess && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDateExpansion(dateKey);
                }}
                className="w-full text-xs text-brand hover:text-brand/80 font-medium py-1 hover:bg-brand/5 rounded-lg transition-colors mt-1"
              >
                Show less
              </button>
            )}
          </>
        )}

        {/* // : (
          //   <div className="text-xs text-weak italic">No Schedule</div>
          // )} */}
      </div>
    </div>
  );
};
