export default function TourNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tour not found</h1>
        <p className="mt-2 text-gray-600">
          The tour you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>
  );
}
