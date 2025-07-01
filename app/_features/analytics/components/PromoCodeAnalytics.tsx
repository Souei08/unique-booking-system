"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import type {
  PromoCodeAnalytics,
  PromoAnalyticsSummary,
} from "../types/promo-analytics-types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface PromoCodeAnalyticsProps {
  promoCodeAnalytics: PromoCodeAnalytics[];
  promoSummary: PromoAnalyticsSummary;
}

export function PromoCodeAnalytics({
  promoCodeAnalytics,
  promoSummary,
}: PromoCodeAnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never used";
    return format(new Date(date), "MMM d, yyyy");
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  const getDiscountTypeColor = (type: string) => {
    return type === "percentage"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  // Prepare data for charts
  const topPromoCodes = promoCodeAnalytics
    .sort((a, b) => Number(b.total_bookings) - Number(a.total_bookings))
    .slice(0, 10);

  const revenueByPromo = promoCodeAnalytics
    .filter((promo) => promo.total_revenue > 0)
    .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
    .slice(0, 8);

  const discountTypeDistribution = promoCodeAnalytics.reduce(
    (acc, promo) => {
      const type = promo.discount_type;
      acc[type] = (acc[type] || 0) + Number(promo.total_bookings);
      return acc;
    },
    {} as Record<string, number>
  );

  const discountTypeData = Object.entries(discountTypeDistribution).map(
    ([type, bookings]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      bookings,
    })
  );

  return (
    <div className="space-y-6">
      {/* Promo Code Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoSummary.total_promos}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoSummary.active_promos}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Promo Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(promoSummary.total_promo_revenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(promoSummary.total_promo_discounts)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Discount Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(promoSummary.average_discount_value)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Promo Codes by Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Promo Codes by Bookings</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPromoCodes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="code"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Promo Code */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Promo Code</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPromo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="code"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total_revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Discount Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Discount Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={discountTypeData}
                  dataKey="bookings"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, bookings }) => `${type} (${bookings})`}
                >
                  {discountTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Promo Code Usage Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Usage Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={promoCodeAnalytics.filter((p) => p.first_used)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="first_used"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    format(new Date(value), "MMM d, yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total_bookings"
                  stroke="#FF8042"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Promo Code Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Slots</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>First Used</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodeAnalytics.map((promo) => (
                <TableRow key={promo.promo_code_id}>
                  <TableCell className="font-mono font-medium">
                    {promo.code}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getDiscountTypeColor(promo.discount_type)}
                    >
                      {formatDiscount(
                        promo.discount_type,
                        promo.discount_value
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.total_bookings}</TableCell>
                  <TableCell>{promo.total_slots}</TableCell>
                  <TableCell>{formatCurrency(promo.total_revenue)}</TableCell>
                  <TableCell>{formatDate(promo.first_used)}</TableCell>
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
