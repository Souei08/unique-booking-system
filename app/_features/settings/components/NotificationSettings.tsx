"use client";

import { useState } from "react";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    bookingUpdates: true,
    marketingEmails: false,
    systemAlerts: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10  md:grid-cols-3">
      <div>
        <h2 className="text-base/7 font-semibold text-strong">Notifications</h2>
        <p className="mt-1 text-sm/6 text-weak">
          Configure how you receive notifications and updates.
        </p>
      </div>

      <div className="md:col-span-2">
        <div className="space-y-8">
          {/* Email Notifications */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-strong">
              Email Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    Email Notifications
                  </label>
                  <p className="text-sm text-weak">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("email")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.email ? "bg-brand" : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.email ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    Booking Updates
                  </label>
                  <p className="text-sm text-weak">
                    Get notified about booking changes and confirmations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("bookingUpdates")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.bookingUpdates ? "bg-brand" : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.bookingUpdates
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    Marketing Emails
                  </label>
                  <p className="text-sm text-weak">
                    Receive promotional emails and special offers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("marketingEmails")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.marketingEmails
                      ? "bg-brand"
                      : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.marketingEmails
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-strong">
              Push Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    Push Notifications
                  </label>
                  <p className="text-sm text-weak">
                    Receive push notifications in your browser
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("push")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.push ? "bg-brand" : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.push ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    System Alerts
                  </label>
                  <p className="text-sm text-weak">
                    Get notified about system maintenance and updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("systemAlerts")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.systemAlerts ? "bg-brand" : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.systemAlerts
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-strong">
              SMS Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-strong">
                    SMS Notifications
                  </label>
                  <p className="text-sm text-weak">
                    Receive SMS notifications for urgent updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("sms")}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    notifications.sms ? "bg-brand" : "bg-stroke-weak"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.sms ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex">
          <button
            type="button"
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
