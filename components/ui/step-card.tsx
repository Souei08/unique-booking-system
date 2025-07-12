import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepCardProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  backButtonText?: string;
  className?: string;
  showProgress?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
  onNext,
  onBack,
  nextButtonText = "Next Step",
  backButtonText = "Back",
  className,
  showProgress = true,
}) => {
  const progress = Math.round((stepNumber / totalSteps) * 100);
  return (
    <div className={cn("max-w-5xl mx-auto space-y-0", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full h-2 bg-gray-200 rounded-t-xl overflow-hidden mb-0">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main Form Content */}
      <Card className="shadow-xl border border-gray-100 bg-white rounded-b-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-8 bg-gray-50 min-h-[400px]">{children}</div>
          {/* Sticky Footer Navigation */}
          {(onNext || onBack) && (
            <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-between gap-4 px-8 py-6 z-10 rounded-b-2xl">
              <div>
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    {backButtonText}
                  </Button>
                )}
              </div>
              <div>
                {onNext && (
                  <Button
                    onClick={onNext}
                    className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {nextButtonText}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepCard;
