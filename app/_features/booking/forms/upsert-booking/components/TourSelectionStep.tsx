import { StepProps } from "../types";
import CustomSideCalendar from "@/app/_components/calendar/CustomSideCalendar";
import BookingSummary from "@/app/_features/booking/forms/upsert-booking/components/BookingSummary";

export default function TourSelectionStep({
  register,
  errors,
  watch,
  setValue,
  selectedTour,
  tours,
  schedules,
  isLoadingSchedules,
}: StepProps) {
  const tourId = watch("tourId");
  // Get current form values to preserve them when navigating back
  const currentSpots = watch("spots") || 1;
  const currentDate = watch("date") || new Date();

  // Handle selection changes from BookingSummary
  const handleSelectionChange = (values: {
    date: string;
    start_time: string;
    spots: number;
    total_price: number;
  }) => {
    // Update form values
    setValue("date", values.date);
    setValue("start_time", values.start_time);
    setValue("spots", values.spots);
    setValue("total_price", values.total_price);
  };

  // Extract relevant errors for BookingSummary
  const bookingErrors = {
    date: errors.date,
    start_time: errors.start_time,
    spots: errors.spots,
    total_price: errors.total_price,
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Tours
        </label>
        <select
          {...register("tourId")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.tourId
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        >
          <option value="">Select a tour</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.title}
            </option>
          ))}
        </select>
        {errors.tourId && (
          <p className="text-red-500 text-sm">{errors.tourId.message}</p>
        )}
      </div>

      {selectedTour && (
        <div>
          {isLoadingSchedules ? (
            <div>Loading...</div>
          ) : (
            <CustomSideCalendar
              initialSchedules={schedules}
              tourId={tourId}
              rate={selectedTour?.rate || 0}
              defaultSelectedDate={new Date(currentDate)}
            >
              {(props) => (
                <BookingSummary
                  {...props}
                  onSelectionChange={handleSelectionChange}
                  errors={bookingErrors}
                  initialSlots={currentSpots}
                />
              )}
            </CustomSideCalendar>
          )}
        </div>
      )}
    </div>
  );
}
