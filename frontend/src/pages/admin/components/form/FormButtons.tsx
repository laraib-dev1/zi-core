import React from "react";

type Props = {
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  className?: string;
};

export default function FormButtons({ onCancel, submitText = "Save", cancelText = "Cancel", className = "" }: Props) {
  return (
    <div className={`flex justify-end gap-2 mt-4 ${className}`}>
      <button type="button" onClick={onCancel} className="btn btn-ghost h-12">
        {cancelText}
      </button>
      <button type="submit" className="btn btn-primary h-12">
        {submitText}
      </button>
    </div>
  );
}
