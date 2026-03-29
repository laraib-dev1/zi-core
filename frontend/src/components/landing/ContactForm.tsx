import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; subject: string; message: string }) => void | Promise<void>;
  submitting?: boolean;
  className?: string;
}

export default function ContactForm({ onSubmit, submitting = false, className }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ name, email, subject, message });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-6 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 shadow-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)]"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-6 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 shadow-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)]"
        />
      </div>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-4 py-6 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 shadow-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)]"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="w-full px-4 py-6 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 shadow-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)] resize-y"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-4 rounded-lg font-medium text-sm sm:text-base text-white transition-colors hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          {submitting ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
