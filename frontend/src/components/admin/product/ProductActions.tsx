import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface Props<T> {
  row: T;
  onView: (r: T) => void;
  onEdit: (r: T) => void;
  onDelete: (r: T) => void;
}

export function ProductActions<T>({ row, onView, onEdit, onDelete }: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="p-1">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>

      {/* Portal ensures menu renders outside table */}
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          side="bottom"           // This makes the dropdown appear above the trigger
          sideOffset={4}
          className="z-50 min-w-[150px] bg-white border rounded-md shadow-lg text-gray-900"
        >
          <DropdownMenuItem onClick={() => onView(row)}>View</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(row)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
