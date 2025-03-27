"use client";

import React, { useState } from "react";

interface TableProps<T extends object> {
  title: string;
  description: string;
  buttonText: string;
  data: T[];
  columns: Array<{
    header: string;
    accessor: keyof T;
    isHiddenOnMobile?: boolean;
  }>;
  isCollapsible?: boolean; // New parameter to control collapsibility
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
            className="block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                    {columns.map((column) => (
                      <th
                        key={column.header}
                        scope="col"
                        className={classNames(
                          "py-3.5 pr-3 pl-4 text-left text-body font-semibold text-strong",
                          column.isHiddenOnMobile ? "hidden lg:table-cell" : "",
                          "sm:pl-6"
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="relative py-3.5 pr-4 pl-3 sm:pr-6 "
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((item, itemIdx) => (
                    <React.Fragment key={itemIdx}>
                      <tr
                        className={classNames(
                          isCollapsible
                            ? "cursor-pointer hover:bg-brand hover:text-white"
                            : "",
                          openRows.has(itemIdx)
                            ? "bg-brand text-white"
                            : "text-strong"
                        )}
                        onClick={() => isCollapsible && toggleRow(itemIdx)}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.header}
                            className={classNames(
                              "px-3 py-4 text-small whitespace-nowrap ",
                              column.isHiddenOnMobile
                                ? "hidden lg:table-cell"
                                : ""
                              // itemIdx === 0 ? " " : ""
                            )}
                          >
                            {String(item[column.accessor] ?? "")}
                          </td>
                        ))}
                        <td className="relative py-4 pr-4 pl-3 text-right text-base font-medium whitespace-nowrap sm:pr-6">
                          <a
                            href="#"
                            className="text-brand-dark hover:text-brand-light"
                          >
                            Edit<span className="sr-only">, {itemIdx}</span>
                          </a>
                        </td>
                      </tr>
                      {isCollapsible && openRows.has(itemIdx) && (
                        <tr className="bg-gray-100">
                          <td
                            colSpan={columns.length + 1}
                            className="px-3 py-4"
                          >
                            <div className="grid grid-cols-2 gap-4 text-small text-weak">
                              {Object.entries(item).map(([key, value]) => (
                                <div key={key} className="flex">
                                  <span className="font-semibold capitalize">
                                    {key}:
                                  </span>
                                  <span className="ml-2">{String(value)}</span>
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
