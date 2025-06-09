import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface Tour {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  guide: string;
  status: "confirmed" | "pending";
}

interface UpcomingToursProps {
  tours: Tour[];
}

export const UpcomingTours = ({ tours }: UpcomingToursProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Upcoming Tours</CardTitle>
        <CardDescription>Next scheduled tours and activities</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:border-brand/50 hover:bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold group-hover:text-brand">
                    {tour.name}
                  </h3>
                  <Badge
                    variant={
                      tour.status === "confirmed" ? "default" : "secondary"
                    }
                    className="font-medium"
                  >
                    {tour.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {tour.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {tour.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {tour.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-brand/20">
                  <AvatarFallback className="bg-brand/10 text-brand">
                    {tour.guide[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{tour.guide}</div>
                  <div className="text-muted-foreground">
                    {tour.participants} participants
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
