"use client";

import React, { useState } from "react";
import Steps from "@/app/_components/common/steps";

const Page = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Job Details",
      description: "Vitae sed mi luctus laoreet.",
      status:
        activeStep > 1
          ? "completed"
          : activeStep === 1
          ? "current"
          : ("upcoming" as "completed" | "current" | "upcoming"),
      condition: true,
      children: (
        <div className="text-xs text-gray-500">
          <p>Additional information here</p>
          <button className="mt-1 text-indigo-600 hover:text-indigo-500">
            View Details
          </button>
        </div>
      ),
    },
    {
      id: 2,
      title: "Application form",
      description: "Cursus semper viverra.",
      status:
        activeStep > 2
          ? "completed"
          : activeStep === 2
          ? "current"
          : ("upcoming" as "completed" | "current" | "upcoming"),
      condition: activeStep >= 2,
      children: (
        <div className="text-xs">
          <span className="text-red-500">Required fields missing</span>
        </div>
      ),
    },
    {
      id: 3,
      title: "Preview",
      description: "Penatibus eu quis ante.",
      status:
        activeStep === 3
          ? "current"
          : ("upcoming" as "completed" | "current" | "upcoming"),
      condition: activeStep >= 3,
      children: (
        <div className="text-xs text-gray-500">
          <p>Not available yet</p>
        </div>
      ),
    },
  ];

  // Content for each step tab
  const stepContent = {
    1: (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Job Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    ),
    2: (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Application Form</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resume
            </label>
            <input
              type="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
      </div>
    ),
    3: (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium">Job Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review your job details here
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium">Application Information</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review your application information here
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium">Documents</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review your uploaded documents here
            </p>
          </div>
        </div>
      </div>
    ),
  };

  const handleStepClick = (stepId: number) => {
    // Only allow moving to steps that are available
    if (steps.find((step) => step.id === stepId)?.condition) {
      setActiveStep(stepId);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Steps steps={steps} onStepClick={handleStepClick} />

      <div className="mt-8">
        {stepContent[activeStep as keyof typeof stepContent]}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={activeStep === 1}
          className={`px-4 py-2 rounded-md ${
            activeStep === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={activeStep === steps.length}
          className={`px-4 py-2 rounded-md ${
            activeStep === steps.length
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {activeStep === steps.length ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Page;
