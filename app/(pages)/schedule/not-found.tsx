import Link from "next/link";
import Button from "@/app/_components/common/button/index";

export default function NotFoundSchedule() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Tour Schedule Not Found
          </h1>
          <p className="mt-2 text-gray-600">
            The tour schedule you're looking for doesn't exist or has been
            removed.
          </p>
          <div className="mt-6">
            <Link href="/tours">
              <Button variant="primary" className="inline-flex items-center">
                Browse Tours
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
