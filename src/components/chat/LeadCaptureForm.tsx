import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface LeadCaptureFormProps {
  chatbotId: string;
  onLeadSubmitted: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export default function LeadCaptureForm({ chatbotId, onLeadSubmitted }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (import.meta.env.VITE_API_BASE || "http://192.168.1.19:8000").replace(/\/+$/, "");

  const validateForm = (): boolean => {
    if (formData.name.trim().length < 2) {
      setError("Please enter a valid full name (at least 2 characters).");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email address is required.");
      return false;
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      return false;
    }

    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim().replace(/[\s-]/g, ""))) {
      setError("Please enter a valid phone number (7 to 15 digits).");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/v1/chatbots/${chatbotId}/capture-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          company: formData.company.trim() || null,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to submit your details. Please try again.";
        try {
          const data = await res.json();
          if (data.detail) msg = data.detail;
        } catch (_) {}
        throw new Error(msg);
      }

      onLeadSubmitted();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-nx-message-in rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm text-slate-800">
      <h4 className="text-xs font-semibold text-slate-900 mb-1">
        Leave your details for our team:
      </h4>
      <p className="text-[11px] text-slate-500 mb-3">
        Our chat capacity is currently full. Provide your contact details and we'll get back to you shortly.
      </p>

      {error && (
        <div className="mb-2.5 rounded bg-rose-50 p-2 text-[11px] text-rose-600 border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Your Full Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={submitting}
          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <input
          type="email"
          placeholder="Work Email Address *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={submitting}
          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={submitting}
          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <input
          type="text"
          placeholder="Company Name (optional)"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          disabled={submitting}
          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="size-3" /> Contact Me
            </>
          )}
        </button>
      </form>
    </div>
  );
}

