import { useEffect, useState, type FormEvent } from "react";
import {
  ChevronDown,
  Clock3,
  Landmark,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
}

const initialForm: ContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  topic: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | NexusCore Bank";
  }, []);

  const updateField = <K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (status) {
      setStatus("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    if (form.message.trim().length < 10) {
      setStatus("Please enter a more detailed message.");
      return;
    }

    setIsSubmitting(true);

    try {
      /*
      Connect your contact API here later:

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to send message.");
      }
      */

      setStatus(
        "Form validated successfully. Contact API integration is pending.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-14 dark:border-white/10 dark:bg-[#050b14] sm:py-16">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <MessageSquareText size={16} />
            NexusCore Support
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">
            Get in touch
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Contact our support team for help with accounts, loans, transactions
            or suspicious activity.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="bg-slate-50 py-16 dark:bg-[#050b14] sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          {/* Contact information */}
          <div className="space-y-5">
            {/* Emergency */}
            <article className="overflow-hidden rounded-[1.5rem] border border-red-400/20 bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
                  <TriangleAlert size={23} />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-400">
                    Urgent assistance
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Lost or stolen card?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Contact the support team immediately to report the card and
                    protect your account.
                  </p>

                  <a
                    href="tel:+919867606713"
                    className="mt-4 inline-flex items-center gap-2 font-black text-white transition hover:text-red-300"
                  >
                    <Phone size={17} />
                    +91 98676 06713
                  </a>
                </div>
              </div>
            </article>

            {/* Email */}
            <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Mail size={22} />
                </span>

                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Email support
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    For account questions and general enquiries.
                  </p>

                  <a
                    href="mailto:support@nexuscore.com"
                    className="mt-3 inline-block break-all text-sm font-black text-sky-600 hover:text-sky-500 dark:text-sky-400"
                  >
                    support@nexuscore.com
                  </a>
                </div>
              </div>
            </article>

            {/* Location */}
            <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Landmark size={22} />
                </span>

                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    NexusCore office
                  </h2>

                  <p className="mt-1 flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="mt-1 shrink-0" />
                    Mumbai, Maharashtra, India
                  </p>
                </div>
              </div>
            </article>

            {/* Availability */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.07] dark:text-emerald-300">
              <Clock3 size={19} />
              Support requests can be submitted at any time.
            </div>
          </div>

          {/* Form */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8 dark:border-white/10 dark:bg-[#0a0a0a] dark:shadow-black/40">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20">
                <ShieldCheck size={23} />
              </span>

              <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                Send a secure message
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Fill in the form and provide enough information for the support
                team to understand your request.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Names */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    First name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(event) =>
                        updateField("firstName", event.target.value)
                      }
                      required
                      className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    Last name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contactEmail"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="contactEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label
                  htmlFor="topic"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Topic
                </label>

                <div className="relative">
                  <select
                    id="topic"
                    value={form.topic}
                    onChange={(event) =>
                      updateField("topic", event.target.value)
                    }
                    required
                    className="min-h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-11 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/15 dark:bg-[#0a0a0a] dark:text-white"
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>

                    <option value="account">Account management</option>

                    <option value="transactions">
                      Transactions and payments
                    </option>

                    <option value="deposits">Deposits and savings</option>

                    <option value="loans">Loans and repayments</option>

                    <option value="fraud">Suspicious activity</option>

                    <option value="other">Other enquiry</option>
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  rows={5}
                  placeholder="Explain how we can help you..."
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  required
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                />
              </div>

              {status && (
                <div
                  role="alert"
                  className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300"
                >
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-400 dark:hover:text-white"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
