import React from "react";

interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  condition?: boolean;
  children?: React.ReactNode;
}

interface StepsProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

const Steps: React.FC<StepsProps> = ({ steps, onStepClick }) => {
  return (
    <div className="lg:border-t lg:border-b lg:border-gray-200">
      <nav className="mx-auto max-w-7xl" aria-label="Progress">
        <ol
          role="list"
          className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-r lg:border-l lg:border-gray-200  px-4 sm:px-6 lg:px-8"
        >
          {steps.map((step, index) => (
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={`overflow-hidden ${
                  index === 0
                    ? "rounded-t-md border border-b-0"
                    : index === steps.length - 1
                    ? "rounded-b-md border border-t-0"
                    : "border"
                } border-gray-200 lg:border-0`}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (step.condition !== false) {
                      onStepClick?.(step.id);
                    }
                  }}
                  className={`group ${
                    step.condition === false
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  aria-current={step.status === "current" ? "step" : undefined}
                >
                  <span
                    className={`absolute top-0 left-0 h-full w-1 lg:top-auto lg:bottom-0 lg:h-1 lg:w-full ${
                      step.status === "current"
                        ? "bg-indigo-600"
                        : "bg-transparent group-hover:bg-gray-200"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex items-start px-6 py-5 text-sm font-medium lg:pl-9">
                    <span className="shrink-0">
                      {step.status === "completed" ? (
                        <span className="flex size-10 items-center justify-center rounded-full bg-indigo-600">
                          <svg
                            className="size-6 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span
                          className={`flex size-10 items-center justify-center rounded-full border-2 ${
                            step.status === "current"
                              ? "border-indigo-600"
                              : "border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              step.status === "current"
                                ? "text-indigo-600"
                                : "text-gray-500"
                            }
                          >
                            {String(step.id).padStart(2, "0")}
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                      <span
                        className={`text-sm font-medium ${
                          step.status === "current"
                            ? "text-indigo-600"
                            : step.status === "upcoming"
                            ? "text-gray-500"
                            : ""
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {step.description}
                      </span>
                      {step.children && (
                        <div className="mt-2">{step.children}</div>
                      )}
                    </span>
                  </span>
                </a>
                {index < steps.length - 1 && (
                  <div
                    className="absolute inset-0 top-0 left-0 hidden w-3 lg:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="size-full text-gray-300"
                      viewBox="0 0 12 82"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0.5 0V31L10.5 41L0.5 51V82"
                        stroke="currentcolor"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Steps;
