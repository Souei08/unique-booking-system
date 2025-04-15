"use client";

import React, { useState } from "react";
import {
  PencilIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import IconButton from "./button";

interface TableProps<T extends object> {
  title: string;
  description: string;
  buttonText: string;
  data: T[];
  columns: Array<{
    header: string;
    accessor: keyof T;
    isHiddenOnMobile?: boolean;
    maxWidth?: string;
  }>;
  isCollapsible?: boolean; // New parameter to control collapsibility
  handleEdit: (item: T) => void;
  handleSchedule: (item: T) => void;
  handleAdd: () => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Table<T extends object>({
  title,
  description,
  buttonText,
  data,
  columns,
  isCollapsible = false, // Default to non-collapsible
  handleEdit,
  handleSchedule,
  handleAdd,
}: TableProps<T>) {
  const [openRows, setOpenRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    setOpenRows((prevOpenRows) => {
      const newOpenRows = new Set(prevOpenRows);
      if (newOpenRows.has(index)) {
        newOpenRows.delete(index);
      } else {
        newOpenRows.add(index);
      }
      return newOpenRows;
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-h2 font-bold text-strong">{title}</h1>
          <p className="mt-2 text-lg text-weak">{description}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer"
            onClick={handleAdd}
          >
            {buttonText}
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {isCollapsible && (
                      <th
                        scope="col"
                        className="py-3.5 pr-3 pl-4 text-left text-body font-semibold text-strong sm:pl-6"
                      >
                        {/* Empty header for the collapse arrow */}
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.header}
                        scope="col"
                        className={classNames(
                          "py-3.5 pr-3 pl-4 text-left text-body font-semibold text-strong",
                          column.isHiddenOnMobile ? "hidden lg:table-cell" : "",
                          "sm:pl-6"
                        )}
                        style={
                          column.maxWidth
                            ? { maxWidth: column.maxWidth }
                            : undefined
                        }
                      >
                        {column.header}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="relative py-3.5 pr-4 pl-3 sm:pr-6 text-left text-body font-semibold text-strong"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((item, itemIdx) => (
                    <React.Fragment key={itemIdx}>
                      <tr className={`text-strong`}>
                        {isCollapsible && (
                          <td className="px-3 py-4 text-small whitespace-nowrap ">
                            <button
                              type="button"
                              className={classNames(
                                openRows.has(itemIdx)
                                  ? "text-brand"
                                  : "text-strong",
                                "cursor-pointer"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(itemIdx);
                              }}
                            >
                              {openRows.has(itemIdx) ? (
                                <ChevronDownIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronRightIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.header}
                            className={classNames(
                              "px-3 py-4 text-small whitespace-nowrap",
                              column.isHiddenOnMobile
                                ? "hidden lg:table-cell"
                                : "",
                              "truncate"
                            )}
                            style={
                              column.maxWidth
                                ? { maxWidth: column.maxWidth }
                                : undefined
                            }
                            title={String(item[column.accessor] ?? "")}
                          >
                            {String(item[column.accessor] ?? "")}
                          </td>
                        ))}
                        <td className="relative py-4 pr-4 pl-3 text-right text-base font-medium whitespace-nowrap sm:pr-6">
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleEdit(item);
                            }}
                            icon={
                              <PencilIcon
                                className="h-5 w-5 inline"
                                aria-hidden="true"
                              />
                            }
                            label={`Edit`}
                          />
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleSchedule(item);
                            }}
                            icon={
                              <CalendarIcon
                                className="h-5 w-5 inline"
                                aria-hidden="true"
                              />
                            }
                            label={`Schedule`}
                          />
                        </td>
                      </tr>
                      {isCollapsible && openRows.has(itemIdx) && (
                        <tr>
                          <td
                            colSpan={columns.length + 2}
                            className="px-3 py-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-small text-weak  p-4 ">
                              {Object.entries(item).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex flex-col md:flex-row"
                                >
                                  <span className="font-semibold capitalize text-strong">
                                    {key}:
                                  </span>
                                  <span className="mt-1 md:mt-0 md:ml-2">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
