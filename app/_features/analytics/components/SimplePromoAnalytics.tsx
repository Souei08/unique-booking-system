"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PromoCodeAnalytics } from "../types/promo-analytics-types";

interface SimplePromoAnalyticsProps {
  promoCodeAnalytics: PromoCodeAnalytics[];
}

export function SimplePromoAnalytics({
  promoCodeAnalytics,
}: SimplePromoAnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never used";
    return new Date(date).toLocaleDateString();
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  // Filter only used promo codes
  const usedPromoCodes = promoCodeAnalytics.filter(
    (promo) => parseInt(promo.total_bookings) > 0
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodeAnalytics.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Used Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedPromoCodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings with Promos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usedPromoCodes.reduce(
                (sum, promo) => sum + parseInt(promo.total_bookings),
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Code Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Bookings</TableHead>
                {/* <TableHead>Revenue</TableHead> */}
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usedPromoCodes.map((promo) => (
                <TableRow key={promo.promo_code_id}>
                  <TableCell className="font-mono font-medium">
                    {promo.code}
                  </TableCell>
                  <TableCell>
                    {formatDiscount(promo.discount_type, promo.discount_value)}
                  </TableCell>
                  <TableCell>{promo.total_bookings}</TableCell>
                  {/* <TableCell>{formatCurrency(promo.total_revenue)}</TableCell> */}
                  <TableCell>{formatDate(promo.last_used)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
