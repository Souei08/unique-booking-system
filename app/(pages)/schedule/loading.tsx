export default function LoadingSchedule() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-4 h-[400px] bg-gray-200 rounded"></div>
                </div>
              </div>

              <div>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
