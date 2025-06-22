import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, HelpCircle, MessageSquare } from "lucide-react";

interface AdditionalInformationProps {
  form: UseFormReturn<any>;
  addItem: (field: any, value?: any) => void;
  removeItem: (field: any, index: number) => void;
  updateItem: (field: any, index: number, value: any) => void;
}

const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
  form,
  addItem,
  removeItem,
  updateItem,
}) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Additional Information
        </CardTitle>
        <p className="text-base text-weak leading-relaxed">
          Add important details and frequently asked questions to help customers
          understand your tour better.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* <FormField
          control={form.control}
          name="things_to_know"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand" />
                <FormLabel className="text-strong font-semibold text-base">
                  Things to Know
                </FormLabel>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Enter important information that participants should know before booking (e.g., what to bring, weather considerations, physical requirements)"
                  className="min-h-[120px] text-strong resize-none focus:ring-2 focus:ring-brand/20 transition-all duration-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="faq"
          render={({ field }) => {
            const value = Array.isArray(field.value)
              ? field.value
              : [{ question: "", answer: "" }];
            const hasFAQs = value.some(
              (faq) => faq.question.trim() !== "" && faq.answer.trim() !== ""
            );
            const hasCompleteFAQs = value.some(
              (faq) => faq.question.trim() !== "" && faq.answer.trim() !== ""
            );
            const error = form.formState.errors.faq?.message as string;

            return (
              <FormItem className="space-y-4">
                <FormLabel className="text-strong font-semibold">
                  Frequently Asked Questions
                </FormLabel>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Please add at least one complete FAQ with both question
                      and answer.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {value.map((faq, index) => {
                    const faqErrors = form.formState.errors.faq as any;
                    const questionError = faqErrors?.[index]?.question
                      ?.message as string;
                    const answerError = faqErrors?.[index]?.answer
                      ?.message as string;
                    const hasErrors = questionError || answerError;

                    return (
                      <div
                        key={index}
                        className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                          hasErrors
                            ? "border-red-300 bg-red-50/50"
                            : faq.question.trim() !== "" ||
                                faq.answer.trim() !== ""
                              ? "border-brand/20 bg-brand/5"
                              : "border-gray-200 bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                hasErrors
                                  ? "bg-red-100"
                                  : faq.question.trim() !== "" &&
                                      faq.answer.trim() !== ""
                                    ? "bg-green-100"
                                    : "bg-brand/10"
                              }`}
                            >
                              <span
                                className={`text-xs font-bold ${
                                  hasErrors
                                    ? "text-red-600"
                                    : faq.question.trim() !== "" &&
                                        faq.answer.trim() !== ""
                                      ? "text-green-600"
                                      : "text-brand"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-medium text-gray-600`}
                            >
                              FAQ #{index + 1}
                            </span>
                          </div>
                          {value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("faq", index)}
                              className={`h-8 w-8 ${
                                hasErrors
                                  ? "text-red-400 hover:text-red-600 hover:bg-red-100"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Input
                              value={faq.question}
                              onChange={(e) =>
                                updateItem("faq", index, {
                                  ...faq,
                                  question: e.target.value,
                                })
                              }
                              placeholder="What do customers often ask about? (e.g., What should I bring?)"
                              className={`transition-all duration-200 focus:ring-2 focus:ring-brand/20 ${
                                questionError
                                  ? "border-red-300 bg-red-50 focus:ring-red-200"
                                  : faq.question.trim() === ""
                                    ? "border-gray-300"
                                    : "border-brand/30 bg-white"
                              }`}
                            />
                            {questionError && (
                              <div className="flex items-center gap-1 mt-1 text-red-600">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                <span className="text-xs">{questionError}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) =>
                                updateItem("faq", index, {
                                  ...faq,
                                  answer: e.target.value,
                                })
                              }
                              placeholder="Provide a clear and helpful answer (e.g., Please bring comfortable walking shoes, water bottle, and sunscreen)"
                              className={`min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-brand/20 resize-none ${
                                answerError
                                  ? "border-red-300 bg-red-50 focus:ring-red-200"
                                  : faq.answer.trim() === ""
                                    ? "border-gray-300"
                                    : "border-brand/30 bg-white"
                              }`}
                            />
                            {answerError && (
                              <div className="flex items-center gap-1 mt-1 text-red-600">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                <span className="text-xs">{answerError}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {faq.question.trim() !== "" &&
                          faq.answer.trim() !== "" &&
                          !hasErrors && (
                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center gap-2 text-green-700">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium">
                                  Complete
                                </span>
                              </div>
                            </div>
                          )}

                        {hasErrors && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center gap-2 text-red-700">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-medium">
                                Please complete this FAQ
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem("faq")}
                    className="w-full border-dashed border-2 hover:border-solid hover:border-brand transition-all duration-200 group text-strong py-4"
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Add Another FAQ
                  </Button>
                </div>

                {hasCompleteFAQs && !error && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-800">
                          {
                            value.filter(
                              (faq) =>
                                faq.question.trim() !== "" &&
                                faq.answer.trim() !== ""
                            ).length
                          }{" "}
                          FAQ
                          {value.filter(
                            (faq) =>
                              faq.question.trim() !== "" &&
                              faq.answer.trim() !== ""
                          ).length !== 1
                            ? "s"
                            : ""}{" "}
                          ready
                        </div>
                        <div className="text-xs text-blue-600">
                          These will help customers understand your tour better
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AdditionalInformation;
