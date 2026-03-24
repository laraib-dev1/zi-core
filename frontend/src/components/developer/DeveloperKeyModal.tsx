import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// DEVELOPER KEY - Change this to set your developer access code
// This is a 4-digit code that must be entered to access the developer console
const DEVELOPER_KEY = "1122";

interface DeveloperKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeveloperKeyModal({ open, onClose }: DeveloperKeyModalProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      // Reset state when opening
      setCode(["", "", "", ""]);
      setError("");
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length && i < 4; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      // Focus the next empty input or last input
      const nextEmptyIndex = newCode.findIndex((c) => !c);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[3]?.focus();
      }
    }
  };

  const handleContinue = () => {
    const enteredCode = code.join("");
    
    if (enteredCode.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }

    setIsLoading(true);

    // Simulate verification delay
    setTimeout(() => {
      if (enteredCode === DEVELOPER_KEY) {
        // Store developer auth in localStorage
        localStorage.setItem("developerAuth", "true");
        localStorage.setItem("developerAuthTime", Date.now().toString());
        onClose();
        navigate("/developer");
      } else {
        setError("Invalid developer key. Please try again.");
        setCode(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader className="text-center">
          <DialogTitle className="theme-heading text-center">
            Sp Console
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Get in your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Developer Key Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Developer Key
            </label>
            
            {/* 4-digit input boxes */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
ref={(el) => {
  inputRefs.current[index] = el;
}}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg text-black
                    focus:outline-none transition-colors
                    ${error ? "border-red-400 bg-red-50" : "bg-white"}`}
                  style={{
                    borderColor: error ? undefined : "var(--theme-primary)",
                    ...(error ? {} : {
                      boxShadow: "none",
                    }),
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderColor = "var(--theme-primary)";
                      e.target.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.borderColor = "var(--theme-primary)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                  placeholder="X"
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="theme-button w-full h-12 rounded-lg font-medium flex items-center justify-center gap-2"
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
