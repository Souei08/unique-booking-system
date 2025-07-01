// "use client";

// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { StatusBadge } from "@/components/ui/status-badge";
// import {
//   CalendarDays,
//   Clock,
//   Users,
//   CreditCard,
//   Package,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   DollarSign,
//   FileText,
//   Plus,
//   Edit2,
//   Save,
//   X,
//   RefreshCw,
//   Tag,
//   ExternalLink,
//   Copy,
//   List,
//   Settings,
//   AlertCircle,
//   CheckCircle,
//   ArrowLeft,
// } from "lucide-react";
// import { formatTime } from "@/app/_lib/utils/formatTime";

// // Format date to be more readable
// const formatDate = (dateString: string | undefined) => {
//   if (!dateString) return "Not set";
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// // Additional Booking Interface
// interface AdditionalBooking {
//   id: string;
//   booking_id: string;
//   added_slots: number;
//   slot_details: any[];
//   created_at: string;
//   added_products: any[];
//   note: string | null;
//   payment_ref_id: string | null;
//   payment_status?: string;
//   payment_amount?: number;
//   payment_method?: string;
// }

// const UpdateBookingTest2Page: React.FC = () => {
//   const searchParams = useSearchParams();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);
//   const [booking, setBooking] = useState<any>(null);
//   const [additionalBookings, setAdditionalBookings] = useState<
//     AdditionalBooking[]
//   >([]);
//   const [isLoadingAdditional, setIsLoadingAdditional] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");

//   const bookingId = searchParams.get("booking_id");

//   // Mock data for additional bookings
//   const mockAdditionalBookings: AdditionalBooking[] = [
//     {
//       id: "add-1",
//       booking_id: bookingId || "",
//       added_slots: 2,
//       slot_details: [
//         { type: "Adult", price: 75 },
//         { type: "Child", price: 50 },
//       ],
//       created_at: "2024-01-15T10:30:00Z",
//       added_products: [
//         {
//           id: "prod-1",
//           name: "Photography Package",
//           quantity: 1,
//           unit_price: 25,
//         },
//         { id: "prod-2", name: "Lunch Option", quantity: 2, unit_price: 15 },
//       ],
//       note: "Added 2 more people and photography package",
//       payment_ref_id: "pay_ref_123456",
//       payment_status: "paid",
//       payment_amount: 195,
//       payment_method: "credit_card",
//     },
//     {
//       id: "add-2",
//       booking_id: bookingId || "",
//       added_slots: 1,
//       slot_details: [{ type: "Adult", price: 75 }],
//       created_at: "2024-01-16T14:20:00Z",
//       added_products: [
//         { id: "prod-3", name: "Transportation", quantity: 1, unit_price: 30 },
//       ],
//       note: "Added 1 person with transportation",
//       payment_ref_id: "pay_ref_789012",
//       payment_status: "pending",
//       payment_amount: 105,
//       payment_method: "credit_card",
//     },
//   ];

//   const fetchBooking = async () => {
//     if (isFetching) return;

//     setIsFetching(true);
//     try {
//       // Mock booking data
//       const mockBooking = {
//         id: "booking-1",
//         full_name: "John Doe",
//         email: "john.doe@example.com",
//         phone_number: "+1 (555) 123-4567",
//         booking_status: "confirmed",
//         payment_status: "paid",
//         booking_date: "2024-01-20",
//         selected_time: "09:00",
//         slots: 4,
//         tour_title: "Mountain Adventure Tour",
//         tour_description:
//           "Experience the thrill of mountain climbing with our expert guides.",
//         tour_rate: 75,
//         tour_featured_image:
//           "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
//         amount_paid: 300,
//         stripe_payment_id: "pi_1234567890",
//         payment_link: "https://checkout.stripe.com/pay/cs_test_123",
//         booked_products: [
//           {
//             id: "prod-1",
//             name: "Photography Package",
//             quantity: 1,
//             unit_price: 25,
//           },
//           { id: "prod-2", name: "Lunch Option", quantity: 4, unit_price: 15 },
//         ],
//         promo_code: "SAVE20",
//         discount_amount: 60,
//         total_price_before_discount: 360,
//       };

//       setBooking(mockBooking);
//     } catch (error) {
//       console.error("Error fetching booking:", error);
//       toast.error("Failed to fetch booking details");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const fetchAdditionalBookings = async () => {
//     if (!bookingId) return;

//     setIsLoadingAdditional(true);
//     try {
//       setAdditionalBookings(mockAdditionalBookings);
//     } catch (error) {
//       console.error("Error fetching additional bookings:", error);
//       toast.error("Failed to fetch additional bookings");
//     } finally {
//       setIsLoadingAdditional(false);
//     }
//   };

//   useEffect(() => {
//     fetchBooking();
//   }, []);

//   useEffect(() => {
//     fetchAdditionalBookings();
//   }, [bookingId]);

//   if (isFetching) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading booking details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-gray-600 hover:text-gray-900"
//               >
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back
//               </Button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Booking Management
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Reference: {booking?.reference_number || "BK-2024-001"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <StatusBadge
//                 status={
//                   (booking?.booking_status?.toLowerCase() as any) || "pending"
//                 }
//                 type="booking"
//               />
//               <StatusBadge
//                 status={
//                   (booking?.payment_status?.toLowerCase() as any) || "pending"
//                 }
//                 type="payment"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-3">
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="space-y-6"
//             >
//               {/* Tab Navigation */}
//               <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                 <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-gray-50">
//                   <TabsTrigger
//                     value="overview"
//                     className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <CalendarDays className="w-4 h-4" />
//                       <span className="hidden sm:inline">Overview</span>
//                     </div>
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="details"
//                     className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Edit2 className="w-4 h-4" />
//                       <span className="hidden sm:inline">Slot Details</span>
//                     </div>
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="products"
//                     className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Package className="w-4 h-4" />
//                       <span className="hidden sm:inline">Products</span>
//                     </div>
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="additional"
//                     className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Plus className="w-4 h-4" />
//                       <span className="hidden sm:inline">Additional</span>
//                     </div>
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="payments"
//                     className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <CreditCard className="w-4 h-4" />
//                       <span className="hidden sm:inline">Payments</span>
//                     </div>
//                   </TabsTrigger>
//                 </TabsList>
//               </div>

//               {/* Overview Tab */}
//               <TabsContent value="overview" className="space-y-8">
//                 {/* Customer Information Card */}
//                 <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                   {/* Header Section */}
//                   <div className="p-8 border-b border-gray-200">
//                     <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                       <User className="w-5 h-5" />
//                       Customer Information
//                     </h2>
//                     <p className="text-sm text-weak mt-1">
//                       View customer details and contact information
//                     </p>
//                   </div>

//                   {/* Content Section */}
//                   <div className="p-8">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                             <User className="w-5 h-5 text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {booking?.full_name}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Primary Contact
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                             <Mail className="w-5 h-5 text-green-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {booking?.email}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Email Address
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="space-y-4">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                             <Phone className="w-5 h-5 text-purple-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {booking?.phone_number}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Phone Number
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
//                             <MapPin className="w-5 h-5 text-orange-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {booking?.tour_title}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Selected Tour
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tour Details Card */}
//                 <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                   {/* Header Section */}
//                   <div className="p-8 border-b border-gray-200">
//                     <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                       <CalendarDays className="w-5 h-5" />
//                       Tour Details
//                     </h2>
//                     <p className="text-sm text-weak mt-1">
//                       View booking slot information and tour details
//                     </p>
//                   </div>

//                   {/* Content Section */}
//                   <div className="p-8 space-y-6">
//                     {/* Tour Summary */}
//                     <div className="flex flex-col items-center md:flex-row gap-6">
//                       {/* Tour Image */}
//                       <div className="relative h-[280px] w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
//                         <img
//                           src={booking?.tour_featured_image}
//                           alt={booking?.tour_title}
//                           className="absolute inset-0 h-full w-full object-cover"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
//                         <div className="absolute bottom-0 left-0 right-0 p-4">
//                           <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
//                             {booking?.slots}{" "}
//                             {booking?.slots === 1 ? "Person" : "People"}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Tour Info */}
//                       <div className="flex-1 min-w-0 space-y-4">
//                         <div>
//                           <h3 className="text-xl font-bold text-strong mb-2">
//                             {booking?.tour_title}
//                           </h3>
//                           <p className="text-sm text-weak line-clamp-2">
//                             {booking?.tour_description}
//                           </p>
//                         </div>

//                         {/* Tour Details Grid */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                           <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
//                             <div className="flex items-center gap-2 mb-2">
//                               <CalendarDays className="w-3 h-3 text-gray-500" />
//                               <p className="text-xs text-weak font-semibold">
//                                 Scheduled Date
//                               </p>
//                             </div>
//                             <p className="text-sm font-bold text-strong">
//                               {formatDate(booking?.booking_date)}
//                             </p>
//                           </div>
//                           <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
//                             <div className="flex items-center gap-2 mb-2">
//                               <Clock className="w-3 h-3 text-gray-500" />
//                               <p className="text-xs text-weak font-semibold">
//                                 Scheduled Time
//                               </p>
//                             </div>
//                             <p className="text-sm font-bold text-strong">
//                               {formatTime(booking?.selected_time || "")}
//                             </p>
//                           </div>
//                           <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
//                             <div className="flex items-center gap-2 mb-2">
//                               <Users className="w-3 h-3 text-gray-500" />
//                               <p className="text-xs text-weak font-semibold">
//                                 Booked Slots
//                               </p>
//                             </div>
//                             <p className="text-sm font-bold text-strong">
//                               {booking?.slots}{" "}
//                               {booking?.slots === 1 ? "Person" : "People"}
//                             </p>
//                           </div>
//                           <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
//                             <div className="flex items-center gap-2 mb-2">
//                               <DollarSign className="w-3 h-3 text-gray-500" />
//                               <p className="text-xs text-weak font-semibold">
//                                 Base Rate
//                               </p>
//                             </div>
//                             <p className="text-sm font-bold text-strong">
//                               ${booking?.tour_rate} per person
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Products Summary Card */}
//                 <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                   {/* Header Section */}
//                   <div className="p-8 border-b border-gray-200">
//                     <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                       <Package className="w-5 h-5" />
//                       Ordered Products
//                     </h2>
//                     <p className="text-sm text-weak mt-1">
//                       View ordered products and their details
//                     </p>
//                   </div>

//                   {/* Content Section */}
//                   <div className="p-8">
//                     {booking?.booked_products &&
//                     booking.booked_products.length > 0 ? (
//                       <div className="space-y-3">
//                         {booking.booked_products.map(
//                           (product: any, index: number) => (
//                             <div
//                               key={index}
//                               className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                                   <Package className="w-5 h-5 text-purple-600" />
//                                 </div>
//                                 <div>
//                                   <p className="font-medium text-gray-900">
//                                     {product.name}
//                                   </p>
//                                   <p className="text-sm text-gray-600">
//                                     Quantity: {product.quantity}
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="text-right">
//                                 <p className="font-bold text-gray-900">
//                                   $
//                                   {(
//                                     product.unit_price * product.quantity
//                                   ).toFixed(2)}
//                                 </p>
//                                 <p className="text-sm text-gray-600">
//                                   ${product.unit_price} each
//                                 </p>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8">
//                         <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-500">No products ordered</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </TabsContent>

//               {/* Additional Bookings Tab */}
//               <TabsContent value="additional" className="space-y-8">
//                 <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                   {/* Header Section */}
//                   <div className="p-8 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                       <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                         <Plus className="w-5 h-5" />
//                         Additional Bookings
//                       </h2>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => fetchAdditionalBookings()}
//                         disabled={isLoadingAdditional}
//                       >
//                         <RefreshCw
//                           className={`w-4 h-4 mr-2 ${isLoadingAdditional ? "animate-spin" : ""}`}
//                         />
//                         Refresh
//                       </Button>
//                     </div>
//                     <p className="text-sm text-weak mt-1">
//                       View additional services and products added to this
//                       booking
//                     </p>
//                   </div>

//                   {/* Content Section */}
//                   <div className="p-8">
//                     {isLoadingAdditional ? (
//                       <div className="flex items-center justify-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                         <p className="ml-3 text-gray-600">
//                           Loading additional bookings...
//                         </p>
//                       </div>
//                     ) : additionalBookings.length > 0 ? (
//                       <div className="space-y-4">
//                         {additionalBookings.map((additional) => (
//                           <div
//                             key={additional.id}
//                             className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
//                           >
//                             {/* Additional Booking Header */}
//                             <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-3">
//                                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                                     <Plus className="w-4 h-4 text-blue-600" />
//                                   </div>
//                                   <div>
//                                     <h3 className="font-semibold text-gray-900">
//                                       Additional Booking #
//                                       {additional.id.slice(-4)}
//                                     </h3>
//                                     <p className="text-sm text-gray-600">
//                                       Added on{" "}
//                                       {formatDate(additional.created_at)}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <StatusBadge
//                                   status={
//                                     (additional.payment_status as any) ||
//                                     "pending"
//                                   }
//                                   type="payment"
//                                 />
//                               </div>
//                             </div>

//                             {/* Additional Booking Content */}
//                             <div className="p-6 space-y-4">
//                               {/* Note */}
//                               {additional.note && (
//                                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                                   <div className="flex items-start gap-2">
//                                     <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                                     <p className="text-sm text-blue-800">
//                                       {additional.note}
//                                     </p>
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Added Slots */}
//                               {additional.added_slots > 0 && (
//                                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                                   <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-2">
//                                       <Users className="w-4 h-4 text-gray-500" />
//                                       <span className="text-sm font-medium text-gray-900">
//                                         Added Slots
//                                       </span>
//                                     </div>
//                                     <span className="text-sm font-bold text-gray-900">
//                                       {additional.added_slots}{" "}
//                                       {additional.added_slots === 1
//                                         ? "Person"
//                                         : "People"}
//                                     </span>
//                                   </div>

//                                   {/* Slot Details */}
//                                   {additional.slot_details &&
//                                     additional.slot_details.length > 0 && (
//                                       <div className="mt-3 space-y-2">
//                                         {additional.slot_details.map(
//                                           (slot: any, index: number) => (
//                                             <div
//                                               key={index}
//                                               className="flex items-center justify-between text-sm"
//                                             >
//                                               <span className="text-gray-600">
//                                                 {slot.type}
//                                               </span>
//                                               <span className="font-medium">
//                                                 ${slot.price}
//                                               </span>
//                                             </div>
//                                           )
//                                         )}
//                                       </div>
//                                     )}
//                                 </div>
//                               )}

//                               {/* Added Products */}
//                               {additional.added_products &&
//                                 additional.added_products.length > 0 && (
//                                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                                     <div className="flex items-center gap-2 mb-3">
//                                       <Package className="w-4 h-4 text-gray-500" />
//                                       <span className="text-sm font-medium text-gray-900">
//                                         Added Products
//                                       </span>
//                                     </div>
//                                     <div className="space-y-2">
//                                       {additional.added_products.map(
//                                         (product: any, index: number) => (
//                                           <div
//                                             key={index}
//                                             className="flex items-center justify-between text-sm"
//                                           >
//                                             <div>
//                                               <span className="font-medium">
//                                                 {product.name}
//                                               </span>
//                                               <span className="text-gray-600 ml-2">
//                                                 × {product.quantity}
//                                               </span>
//                                             </div>
//                                             <span className="font-medium">
//                                               $
//                                               {(
//                                                 product.unit_price *
//                                                 product.quantity
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         )
//                                       )}
//                                     </div>
//                                   </div>
//                                 )}

//                               {/* Payment Information */}
//                               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center gap-2">
//                                     <DollarSign className="w-4 h-4 text-gray-500" />
//                                     <span className="text-sm font-medium text-gray-900">
//                                       Payment Amount
//                                     </span>
//                                   </div>
//                                   <span className="text-lg font-bold text-gray-900">
//                                     ${additional.payment_amount?.toFixed(2)}
//                                   </span>
//                                 </div>

//                                 {additional.payment_ref_id && (
//                                   <div className="mt-2 flex items-center justify-between text-sm">
//                                     <span className="text-gray-600">
//                                       Payment Reference:
//                                     </span>
//                                     <span className="font-mono text-gray-600">
//                                       {additional.payment_ref_id}
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8">
//                         <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-500">
//                           No additional bookings found
//                         </p>
//                         <p className="text-sm text-gray-400 mt-2">
//                           Additional services and products will appear here
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </TabsContent>

//               {/* Payments Tab */}
//               <TabsContent value="payments" className="space-y-8">
//                 <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//                   {/* Header Section */}
//                   <div className="p-8 border-b border-gray-200">
//                     <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                       <CreditCard className="w-5 h-5" />
//                       Payment Information
//                     </h2>
//                     <p className="text-sm text-weak mt-1">
//                       View payment details and manage payment link
//                     </p>
//                   </div>

//                   {/* Content Section */}
//                   <div className="p-8 space-y-8">
//                     {/* Payment Status and Method */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
//                         <div className="mb-2">
//                           <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
//                             <CheckCircle className="w-3 h-3" />
//                             Payment Status
//                           </p>
//                         </div>
//                         <div className="text-base font-medium">
//                           <StatusBadge
//                             status={
//                               (booking?.payment_status?.toLowerCase() as any) ||
//                               "pending"
//                             }
//                             type="payment"
//                           />
//                         </div>
//                       </div>
//                       <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
//                         <div className="mb-2">
//                           <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
//                             <CreditCard className="w-3 h-3" />
//                             Payment Method
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <p className="text-xs font-bold text-strong uppercase">
//                             {booking?.payment_method || "Credit Card"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Payment Amount */}
//                     <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
//                       <div className="mb-2">
//                         <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
//                           <DollarSign className="w-3 h-3" />
//                           Payment Amount
//                         </p>
//                       </div>
//                       <div className="space-y-1">
//                         {booking?.discount_amount &&
//                         booking.discount_amount > 0 ? (
//                           <>
//                             <p className="text-sm font-bold text-strong">
//                               ${booking?.amount_paid.toFixed(2)}
//                             </p>
//                             <p className="text-xs text-gray-500 line-through">
//                               $
//                               {booking?.total_price_before_discount?.toFixed(2)}
//                             </p>
//                           </>
//                         ) : (
//                           <p className="text-base font-bold text-strong">
//                             ${booking?.amount_paid.toFixed(2)}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     {/* Payment Link */}
//                     {booking?.payment_status.toLowerCase() !== "paid" &&
//                       booking?.payment_link && (
//                         <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
//                           <div className="mb-3">
//                             <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
//                               <ExternalLink className="w-3 h-3" />
//                               Payment Link
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
//                             <div className="flex-1 min-w-0">
//                               <p className="text-sm text-gray-900 truncate">
//                                 {booking.payment_link}
//                               </p>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-8 w-8 p-0 hover:bg-gray-100"
//                                 onClick={() => {
//                                   navigator.clipboard.writeText(
//                                     booking.payment_link
//                                   );
//                                   toast.success(
//                                     "Payment link copied to clipboard"
//                                   );
//                                 }}
//                               >
//                                 <Copy className="w-4 h-4" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-8 w-8 p-0 hover:bg-gray-100"
//                                 onClick={() =>
//                                   window.open(booking.payment_link, "_blank")
//                                 }
//                               >
//                                 <ExternalLink className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                     {/* Transaction Details */}
//                     {booking?.stripe_payment_id && (
//                       <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
//                         <div className="mb-2">
//                           <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
//                             <Tag className="w-3 h-3" />
//                             Transaction ID
//                           </p>
//                         </div>
//                         <p className="text-xs font-bold text-strong break-all">
//                           {booking.stripe_payment_id}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>

//           {/* Right Column - Actions & Summary */}
//           <div className="space-y-8">
//             {/* Quick Actions */}
//             <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//               {/* Header Section */}
//               <div className="p-8 border-b border-gray-200">
//                 <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                   <List className="w-5 h-5" />
//                   Quick Actions
//                 </h2>
//                 <p className="text-sm text-weak mt-1">
//                   Manage booking details and actions
//                 </p>
//               </div>

//               {/* Content Section */}
//               <div className="p-8 space-y-6">
//                 <div className="space-y-3">
//                   <Button
//                     variant="outline"
//                     className="w-full h-12 border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
//                     disabled={isLoading}
//                   >
//                     <Edit2 className="w-5 h-5 text-blue-600" />
//                     <span>Edit Details</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="w-full h-12 border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
//                     disabled={isLoading}
//                   >
//                     <RefreshCw className="w-5 h-5 text-purple-600" />
//                     <span>Reschedule</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="w-full h-12 border-gray-200 hover:border-amber-200 hover:bg-amber-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
//                     disabled={isLoading}
//                   >
//                     <Package className="w-5 h-5 text-amber-600" />
//                     <span>Manage Products</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="w-full h-12 border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
//                     disabled={isLoading}
//                   >
//                     <Plus className="w-5 h-5 text-green-600" />
//                     <span>Add Services</span>
//                   </Button>
//                 </div>

//                 <div className="pt-4 border-t border-gray-200">
//                   <Button
//                     variant="outline"
//                     className="w-full h-12 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 flex items-center justify-start gap-3 px-4"
//                     disabled={isLoading}
//                   >
//                     <X className="w-5 h-5" />
//                     <span>Cancel Booking</span>
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Payment Summary */}
//             <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//               {/* Header Section */}
//               <div className="p-8 border-b border-gray-200">
//                 <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                   <CreditCard className="w-5 h-5" />
//                   Payment Summary
//                 </h2>
//                 <p className="text-sm text-weak mt-1">
//                   View payment breakdown and totals
//                 </p>
//               </div>

//               {/* Content Section */}
//               <div className="p-8 space-y-6">
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Tour Cost:</span>
//                     <span className="font-medium">
//                       $
//                       {(
//                         (booking?.tour_rate || 0) * (booking?.slots || 0)
//                       ).toFixed(2)}
//                     </span>
//                   </div>

//                   {booking?.booked_products &&
//                     booking.booked_products.length > 0 && (
//                       <>
//                         <div className="pt-3">
//                           <p className="text-sm font-medium text-gray-500 mb-2">
//                             Additional Products
//                           </p>
//                           {booking.booked_products.map(
//                             (product: any, index: number) => (
//                               <div
//                                 key={index}
//                                 className="flex justify-between text-sm mb-1"
//                               >
//                                 <span className="text-gray-600">
//                                   {product.name} × {product.quantity}
//                                 </span>
//                                 <span className="font-medium">
//                                   $
//                                   {(
//                                     product.unit_price * product.quantity
//                                   ).toFixed(2)}
//                                 </span>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       </>
//                     )}

//                   {booking?.discount_amount && booking.discount_amount > 0 && (
//                     <div className="flex justify-between text-sm text-green-600">
//                       <span>Discount:</span>
//                       <span className="font-medium">
//                         -${booking.discount_amount.toFixed(2)}
//                       </span>
//                     </div>
//                   )}

//                   <div className="h-px bg-gray-200 my-4"></div>

//                   <div className="flex justify-between font-semibold text-lg">
//                     <span>Total:</span>
//                     <span>${booking?.amount_paid.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Booking Info */}
//             <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
//               {/* Header Section */}
//               <div className="p-8 border-b border-gray-200">
//                 <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
//                   <Tag className="w-5 h-5" />
//                   Booking Info
//                 </h2>
//                 <p className="text-sm text-weak mt-1">
//                   View booking reference and details
//                 </p>
//               </div>

//               {/* Content Section */}
//               <div className="p-8 space-y-6">
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Booking ID:</span>
//                     <span className="font-medium">
//                       {booking?.id || "BK-2024-001"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Reference:</span>
//                     <span className="font-medium">
//                       {booking?.reference_number || "REF-001"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Created:</span>
//                     <span className="font-medium">
//                       {formatDate(
//                         booking?.booking_created_at || new Date().toISOString()
//                       )}
//                     </span>
//                   </div>
//                   {booking?.promo_code && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Promo Code:</span>
//                       <span className="font-medium text-green-600">
//                         {booking.promo_code}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateBookingTest2Page;
