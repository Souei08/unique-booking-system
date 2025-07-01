import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TicketIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export const QuickActions = () => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg bg-background border-stroke-weak">
      <CardHeader className="border-b border-stroke-weak bg-neutral">
        <CardTitle className="text-h2 text-strong">Quick Actions</CardTitle>
        <CardDescription className="text-weak">
          Common tasks and operations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-fill hover:text-brand border-stroke-weak text-text"
          >
            <TicketIcon className="h-6 w-6" />
            <span className="text-small">New Booking</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-fill hover:text-brand border-stroke-weak text-text"
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-small">Schedule Tour</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-fill hover:text-brand border-stroke-weak text-text"
          >
            <UserGroupIcon className="h-6 w-6" />
            <span className="text-small">Manage Guides</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-fill hover:text-brand border-stroke-weak text-text"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-small">Equipment</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
