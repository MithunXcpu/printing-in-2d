import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Printing in 2D",
  description: "Get in touch with the Printing in 2D team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative z-10" style={{ color: "var(--white)" }}>
      {/* Nav */}
      <nav className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-fraunces), Fraunces, serif" }}
          >
            Printing in 2D
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "var(--ink-20)" }}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1
              className="text-4xl md:text-5xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), Fraunces, serif" }}
            >
              Get in{" "}
              <em className="italic font-light text-gradient">
                Touch.
              </em>
            </h1>
            <p
              className="text-lg font-light leading-relaxed"
              style={{
                color: "var(--ink-20)",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
              }}
            >
              Have a question or want to work together? Drop me a line.
            </p>
          </div>

          {/* Form */}
          <form
            action="https://formspree.io/f/xnjbjvng"
            method="POST"
            className="space-y-5 glass p-8 rounded-3xl"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium mb-2 uppercase"
                style={{
                  color: "var(--ink-40)",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-1"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "var(--white)",
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-2 uppercase"
                style={{
                  color: "var(--ink-40)",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "var(--white)",
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium mb-2 uppercase"
                style={{
                  color: "var(--ink-40)",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "var(--white)",
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                }}
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs font-medium mb-2 uppercase"
                style={{
                  color: "var(--ink-40)",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Tell me about your project or idea..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-vertical"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "var(--white)",
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px]"
              style={{
                background: "var(--green-400)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(61,158,28,.25)",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
              }}
            >
              Send Message →
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6">
        <p
          className="text-center text-xs"
          style={{
            color: "var(--ink-40)",
            fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
            letterSpacing: "0.02em",
          }}
        >
          Built by mithunsnottechnical
        </p>
      </footer>
    </div>
  );
}
