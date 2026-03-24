import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  open: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({
  open,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  loading = false,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-red-600 text-gray-900">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-gray-900">{message}</p>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="border-gray-400 text-gray-900 hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
