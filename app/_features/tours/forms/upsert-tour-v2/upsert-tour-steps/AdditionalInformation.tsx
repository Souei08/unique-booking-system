import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Info,
  AlertCircle,
  FileText,
  Shield,
  Clock,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface AdditionalInformationProps {
  form: UseFormReturn<any>;
  title?: string;
  description?: string;
}

const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
  form,
  title = "Additional Information",
  description = "Add any additional details, policies, or special instructions for your tour",
}) => {
  // Get current FAQ values from form
  const faqs = form.watch("faq") || [];

  const addFAQ = () => {
    const newFAQ = { question: "", answer: "" };
    const updatedFAQs = [...faqs, newFAQ];
    form.setValue("faq", updatedFAQs);
  };

  const removeFAQ = (index: number) => {
    const updatedFAQs = faqs.filter((_: any, i: number) => i !== index);
    form.setValue("faq", updatedFAQs);
  };

  const updateFAQ = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const updatedFAQs = [...faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    form.setValue("faq", updatedFAQs);
  };

  return (
    <div className="space-y-8">
      {/* FAQ Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Info className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Frequently Asked Questions
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Add common questions and answers for your customers
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addFAQ}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No FAQs yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Start building your FAQ section to help customers
              </p>
              <Button
                onClick={addFAQ}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First FAQ
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {faqs.map((faq: any, index: number) => (
                <div
                  key={index}
                  className="relative group bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-6 transition-all duration-300 hover:border-indigo-400"
                >
                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFAQ(index)}
                    className="absolute top-4 right-4 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Info className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-base">
                          FAQ {index + 1}
                        </span>
                        <p className="text-sm text-indigo-600 font-medium">
                          Configure question and answer
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                        Question <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <Input
                          placeholder="What would you like to know about this tour?"
                          value={faq.question || ""}
                          onChange={(e) =>
                            updateFAQ(index, "question", e.target.value)
                          }
                          className="pl-12 h-12 border-1 border-gray-300 focus:border-indigo-600 focus:ring-indigo-600/20 text-base  transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                        Answer <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-4 w-5 h-5 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <Textarea
                          placeholder="Provide a clear and helpful answer..."
                          value={faq.answer || ""}
                          onChange={(e) =>
                            updateFAQ(index, "answer", e.target.value)
                          }
                          className="min-h-[100px] resize-none pl-12 border-1 border-gray-300 focus:border-indigo-600 focus:ring-indigo-600/20 text-base transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new FAQ button */}
              <div
                className="h-full min-h-[320px] border-2 border-dashed border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl transition-all duration-300 group cursor-pointer bg-white"
                onClick={addFAQ}
              >
                <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
                  <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <Plus className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-indigo-600 group-hover:text-indigo-900 transition-colors">
                      Add FAQ
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Create a new frequently asked question and answer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation & Refund Policy Section - COMMENTED OUT */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Cancellation & Refund Policies
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Set clear terms for cancellations and refunds
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cancellation_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Cancellation Policy <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    How far in advance can customers cancel?
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors">
                        <SelectValue placeholder="Select cancellation policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flexible">
                        Flexible (24 hours before)
                      </SelectItem>
                      <SelectItem value="moderate">
                        Moderate (48 hours before)
                      </SelectItem>
                      <SelectItem value="strict">
                        Strict (7 days before)
                      </SelectItem>
                      <SelectItem value="no_refund">No Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refund_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Refund Policy
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    What percentage of refund do customers get?
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors">
                        <SelectValue placeholder="Select refund policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_refund">Full Refund</SelectItem>
                      <SelectItem value="partial_refund">
                        Partial Refund (50%)
                      </SelectItem>
                      <SelectItem value="credit_only">Credit Only</SelectItem>
                      <SelectItem value="no_refund">No Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Additional Notes Section - COMMENTED OUT */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Info className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Additional Notes
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Important information and special instructions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="additional_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Additional Notes
                </FormLabel>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  Important information, tips, or special instructions for
                  customers
                </FormDescription>
                <FormControl>
                  <div className="relative">
                    <Info className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Textarea
                      placeholder="e.g., Weather-dependent activity, Bring sunscreen and water, Arrive 15 minutes early..."
                      className="min-h-[120px] resize-none pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card> */}

      {/* Terms & Conditions Section - COMMENTED OUT */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Terms & Conditions
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Legal terms and conditions for booking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="terms_conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Terms & Conditions
                </FormLabel>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  Legal terms that customers must agree to when booking
                </FormDescription>
                <FormControl>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Textarea
                      placeholder="Enter your terms and conditions here..."
                      className="min-h-[120px] resize-none pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card> */}

      {/* Safety Information Section - COMMENTED OUT */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Safety Information
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Safety guidelines and emergency procedures
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="safety_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Safety Information
                </FormLabel>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  Safety guidelines, emergency procedures, and contact
                  information
                </FormDescription>
                <FormControl>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Textarea
                      placeholder="e.g., Emergency contact: +1-555-0123, Safety equipment provided, Follow guide instructions..."
                      className="min-h-[120px] resize-none pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default AdditionalInformation;
