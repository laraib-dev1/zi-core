import React from "react";
import DataTableComponent, { TableColumn } from "react-data-table-component";
import { Eye, Edit, Trash2 } from "lucide-react";

interface EnhancedDataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: boolean;
}

// Extended column type to support heading/subInfo
interface ExtendedColumn<T> extends TableColumn<T> {
  heading?: (row: T) => React.ReactNode;
  subInfo?: (row: T) => React.ReactNode;
}

export default function EnhancedDataTable<T extends { id?: string }>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  pagination = true,
}: EnhancedDataTableProps<T>) {

  // Process columns to support heading/subInfo pattern and truncate text
  const processedColumns: TableColumn<T>[] = columns.map((col) => {
    const extendedCol = col as ExtendedColumn<T>;
    
    // If column has heading/subInfo, create a custom cell renderer
    if (extendedCol.heading || extendedCol.subInfo) {
      return {
        ...col,
        cell: (row: T, index?: number) => {
          const heading = extendedCol.heading ? extendedCol.heading(row) : null;
          const subInfo = extendedCol.subInfo ? extendedCol.subInfo(row) : null;
          
          return (
            <div className="py-2">
              {heading && (
                <div className="font-medium text-gray-900 truncate" title={String(heading)}>
                  {heading}
                </div>
              )}
              {subInfo && (
                <div className="text-sm text-gray-500 truncate" title={String(subInfo)}>
                  {subInfo}
                </div>
              )}
            </div>
          );
        },
      };
    }
    
    // For regular cells, ensure text truncation
    if (col.cell) {
      const originalCell = col.cell;
      return {
        ...col,
        cell: (row: T, rowIndex?: number, column?: any, id?: string | number) => {
          const content = originalCell(row, rowIndex ?? 0, column, id ?? '');
          if (typeof content === 'string' || typeof content === 'number') {
            return (
              <div className="truncate" title={String(content)}>
                {content}
              </div>
            );
          }
          return content;
        },
      };
    }
    
    // For selector-based columns, add truncation
    if (col.selector) {
      const originalSelector = col.selector;
      return {
        ...col,
        cell: (row: T) => {
          const value = originalSelector(row);
          return (
            <div className="truncate" title={String(value)}>
              {value}
            </div>
          );
        },
      };
    }
    
    return col;
  });

  // Actions column with 3 dots menu
  const actionsColumn: TableColumn<T> = {
    name: "Action",
    cell: (row: T) => {
      const hasActions = onView || onEdit || onDelete;

      if (!hasActions) return null;

      return (
        <div className="enhanced-table-actions">
          <div className="flex items-center gap-1 flex-nowrap">
            {/* 3 dots icon - always visible */}
            <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 dots-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-gray-400"
              >
                <circle cx="8" cy="4" r="1.5" fill="currentColor" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            {/* Action buttons - shown on hover */}
            <div className="action-buttons items-center gap-2 flex-nowrap ml-1">
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                  className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center"
                  title="View"
                >
                  <Eye size={16} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  className="p-1.5 text-gray-600 hover:text-green-600 transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row);
                  }}
                  className="p-1.5 text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "140px",
    width: "140px",
  };

  const enhancedColumns: TableColumn<T>[] = [
    ...processedColumns,
    ...(onView || onEdit || onDelete ? [actionsColumn] : []),
  ];

  const customStyles = {
    table: {
      style: {
        width: "100%",
        tableLayout: "auto" as const,
        borderRadius: "0.5rem",
      },
    },
    headCells: {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#ffffff",
        backgroundColor: "var(--theme-primary, #8B5E3C)",
      },
    },
    cells: {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "0.875rem",
        color: "#000000",
        overflow: "visible !important",
      },
    },
    rows: {
      style: {
        cursor: "default",
      },
      classNames: ["enhanced-table-row"],
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <DataTableComponent
        columns={enhancedColumns}
        data={data}
        pagination={pagination}
        highlightOnHover
        responsive
        customStyles={customStyles}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}
