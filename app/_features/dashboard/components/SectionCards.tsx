import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardSummary } from "../api/GetDashboardCardSummary";

interface SectionCardsProps {
  dashboardSummary: DashboardSummary;
}

export function SectionCards({ dashboardSummary }: SectionCardsProps) {
  const {
    today_tours,
    today_tours_change_pct,
    month_bookings,
    month_bookings_change_pct,
    promo_used,
    promo_used_change_pct,
  } = dashboardSummary;

  const getBadgeStyles = (changePct: number) => {
    if (changePct > 0) {
      return "border-green-500 text-green-600 bg-green-50";
    } else if (changePct < 0) {
      return "border-red-500 text-red-600 bg-red-50";
    } else {
      return "border-gray-400 text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = (changePct: number) => {
    if (changePct > 0) {
      return <TrendingUp className="h-4 w-4" />;
    } else if (changePct < 0) {
      return <TrendingDown className="h-4 w-4" />;
    } else {
      return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIconFooter = (changePct: number) => {
    if (changePct > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (changePct < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPercentageText = (changePct: number) => {
    if (changePct > 0) {
      return `+${changePct}%`;
    } else if (changePct < 0) {
      return `${changePct}%`;
    } else {
      return `${changePct}%`;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="@container/card bg-background border-stroke-weak hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardDescription className="text-weak">Today's Tours</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-strong">
            {today_tours}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={getBadgeStyles(today_tours_change_pct)}
            >
              {getTrendIcon(today_tours_change_pct)}
              {getPercentageText(today_tours_change_pct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-text">
            Tours scheduled today {getTrendIconFooter(today_tours_change_pct)}
          </div>
          <div className="text-weak">Daily tour operations</div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-background border-stroke-weak hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardDescription className="text-weak">
            This Month Bookings
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-strong">
            {month_bookings}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={getBadgeStyles(month_bookings_change_pct)}
            >
              {getTrendIcon(month_bookings_change_pct)}
              {getPercentageText(month_bookings_change_pct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-text">
            {month_bookings_change_pct > 0
              ? "Strong booking growth"
              : month_bookings_change_pct < 0
                ? "Booking decline"
                : "Stable booking performance"}{" "}
            {getTrendIconFooter(month_bookings_change_pct)}
          </div>
          <div className="text-weak">Monthly booking performance</div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-background border-stroke-weak hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardDescription className="text-weak">
            This Month Promo Used
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-strong">
            {promo_used}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={getBadgeStyles(promo_used_change_pct)}
            >
              {getTrendIcon(promo_used_change_pct)}
              {getPercentageText(promo_used_change_pct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-text">
            {promo_used_change_pct > 0
              ? "Promo usage increasing"
              : promo_used_change_pct < 0
                ? "Promo usage decreasing"
                : "Stable promo usage"}{" "}
            {getTrendIconFooter(promo_used_change_pct)}
          </div>
          <div className="text-weak">
            {promo_used_change_pct > 0
              ? "More customers using discounts"
              : promo_used_change_pct < 0
                ? "Fewer customers using discounts"
                : "Consistent promo usage"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
