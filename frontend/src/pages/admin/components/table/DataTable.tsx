// frontend/src/components/ui/DataTable.tsx
import React from "react";
import DataTableComponent, { TableColumn, TableStyles } from "react-data-table-component";

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  selectable?: boolean;
  pagination?: boolean;
  dense?: boolean;
  responsive?: boolean;
  customStyles?: TableStyles;
  className?: string;
}

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  actions,
  selectable = false,
  pagination = true,
  dense = false,
  responsive = true,
  customStyles,
  className,
}: DataTableProps<T>) {
  const enhancedColumns: TableColumn<T>[] = actions
    ? [
        ...columns,
        {
          name: "Actions",
          cell: (row: T) => actions(row),
          ignoreRowClick: true,
          allowOverflow: true,
          button: true,
          minWidth: "100px",
        },
      ]
    : columns;

  const defaultStyles: TableStyles = {
    table: { style: { width: "100%", tableLayout: "auto" } },
    headCells: { style: { paddingLeft: 8, paddingRight: 8, fontSize: "0.875rem", fontWeight: 600 } },
    cells: {
      style: {
        paddingLeft: 8,
        paddingRight: 8,
        fontSize: "0.875rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: "50px",
      },
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <DataTableComponent
        columns={enhancedColumns}
        data={data}
        selectableRows={selectable}
        pagination={pagination}
        highlightOnHover
        responsive={responsive}
        dense={dense}
        customStyles={{ ...defaultStyles, ...customStyles }}
        className={className}
      />
    </div>
  );
}
