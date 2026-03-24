import React from "react";
import { Skeleton } from "./skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex gap-4 mb-4 pb-3 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={`h-10 flex-1 ${colIdx === 0 ? "w-12" : ""} ${colIdx === columns - 1 ? "w-20" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-32" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-8" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

