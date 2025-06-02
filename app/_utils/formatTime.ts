/**
 * Formats a Date object or time string into 12-hour format with AM/PM
 * @param time - Date object or time string (HH:mm or HH:mm:ss format) to format
 * @returns Formatted time string in HH:MMam/pm format
 */
export function formatTime(time: Date | string): string {
  let date: Date;

  if (typeof time === "string") {
    // Handle HH:mm:ss format
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes] = time.split(":").map(Number);
      date = new Date();
      date.setHours(hours, minutes);
    }
    // Handle HH:mm format
    else if (time.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = time.split(":").map(Number);
      date = new Date();
      date.setHours(hours, minutes);
    } else {
      date = new Date(time);
    }
  } else {
    date = time;
  }

  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}
