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
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <TicketIcon className="h-6 w-6" />
            <span>New Booking</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <CalendarIcon className="h-6 w-6" />
            <span>Schedule Tour</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <UserGroupIcon className="h-6 w-6" />
            <span>Manage Guides</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
          >
            <HomeIcon className="h-6 w-6" />
            <span>Equipment</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
