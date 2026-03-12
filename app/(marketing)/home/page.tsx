"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Volume2,
  Image,
  MessageCircle,
  ArrowRight,
  Check,
  Users,
  Briefcase,
  Palette,
  Menu,
  X,
} from "lucide-react";

// ─── Shared tokens ────────────────────────────────────────────────────────────
const BLUE = "#4A90D9";

// ─── Navigation ───────────────────────────────────────────────────────────────
function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: "#000000", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <span className="text-white font-bold text-xl tracking-tight select-none">
          FlowWidgets
        </span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm transition-colors"
              style={{ color: "#888888" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Login button */}
        <div className="hidden md:flex">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded border transition-colors"
            style={{ color: BLUE, borderColor: BLUE }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = `${BLUE}1A`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            Log In
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{
            backgroundColor: "#0A0A0A",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {["Features", "How It Works", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm"
              style={{ color: "#AAAAAA" }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium"
            style={{ color: BLUE }}
            onClick={() => setMobileOpen(false)}
          >
            Log In →
          </Link>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${BLUE}22 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 border"
          style={{
            color: BLUE,
            borderColor: `${BLUE}44`,
            backgroundColor: `${BLUE}11`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: BLUE }}
          />
          ElevenLabs Sound FX · Live Now
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6"
        >
          Your Webflow Site Is Static.
          <br />
          <span style={{ color: BLUE }}>Your Visitors Want More.</span>
        </h1>

        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#AAAAAA" }}
        >
          Webflow gives you beautiful pages. FlowWidgets gives those pages intelligence.
          Let visitors generate sound effects, create images, and interact with AI —
          without you writing a single line of backend code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BLUE }}
          >
            Start Building for Free
            <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold border transition-colors"
            style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)")
            }
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Problem / Resolution ──────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    <>
      You built a stunning Webflow site. But when a visitor lands, all they can do is{" "}
      <strong className="text-white">read and scroll.</strong>
    </>,
    <>
      You want to add AI features — sound generation, image creation, intelligent chat —
      but you&apos;d need a{" "}
      <strong className="text-white">developer, a backend, API keys, hosting, and weeks of work.</strong>
    </>,
    <>
      Or you could paste someone else&apos;s{" "}
      <strong className="text-white">generic widget</strong> that doesn&apos;t match your brand
      and breaks on mobile.
    </>,
  ];

  const resolutions = [
    "FlowWidgets is the missing layer between Webflow and AI.",
    "Pick an integration. Configure your widget. Copy one embed snippet. Paste it into Webflow. Your visitors get an interactive AI-powered experience — and you never touch a server.",
  ];

  return (
    <section
      id="features"
      className="py-28"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-16 text-center"
        >
          The Gap Between Beautiful and Useful
        </h2>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Problems */}
          <div className="flex flex-col gap-6">
            {problems.map((text, i) => (
              <div
                key={i}
                className="p-5 rounded-lg border"
                style={{
                  backgroundColor: "#111111",
                  borderColor: "rgba(255,255,255,0.07)",
                  color: "#888888",
                }}
              >
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Resolutions */}
          <div className="flex flex-col gap-6 justify-center">
            {resolutions.map((text, i) => (
              <p
                key={i}
                className={`leading-relaxed ${i === 0 ? "text-xl font-semibold text-white" : "text-base"}`}
                style={i !== 0 ? { color: "#CCCCCC" } : undefined}
              >
                {text}
              </p>
            ))}
            <div
              className="mt-4 h-px"
              style={{ backgroundColor: `${BLUE}44` }}
            />
            <div className="flex flex-col gap-3">
              {["No backend required", "No API key management", "No server costs"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={16} style={{ color: BLUE, flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: "#AAAAAA" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Cards ─────────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: Volume2,
    title: "Sound FX Generator",
    badge: "Live Now",
    description:
      'Your visitor types "footsteps on gravel at midnight" and gets studio-quality AI audio in seconds. Embed it on a podcast site, a game asset marketplace, or a creative agency portfolio. Powered by ElevenLabs.',
  },
  {
    icon: Image,
    title: "AI Image Widgets",
    badge: "Coming Soon",
    description:
      "Text-to-image generation embedded directly on your site. Product mockups, concept art, visual brainstorming — your visitors create, you keep them engaged.",
  },
  {
    icon: MessageCircle,
    title: "Conversational AI",
    badge: "Coming Soon",
    description:
      "Give your site a voice. Embed an AI assistant that answers questions, qualifies leads, or guides visitors through complex workflows.",
  },
];

function FeaturesSection() {
  return (
    <section
      id="how-it-works"
      className="py-28"
      style={{ backgroundColor: "#000000" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 text-center">
          What You Can Build Today
        </h2>
        <p className="text-center mb-16" style={{ color: "#888888" }}>
          One integration is live. More ship every month.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map(({ icon: Icon, title, badge, description }) => (
            <div
              key={title}
              className="p-6 rounded-xl border flex flex-col gap-4"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${BLUE}18` }}
                >
                  <Icon size={20} style={{ color: BLUE }} />
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full border"
                  style={
                    badge === "Live Now"
                      ? {
                          color: BLUE,
                          borderColor: `${BLUE}44`,
                          backgroundColor: `${BLUE}11`,
                        }
                      : {
                          color: "#888888",
                          borderColor: "rgba(255,255,255,0.1)",
                          backgroundColor: "transparent",
                        }
                  }
                >
                  {badge}
                </span>
              </div>
              <h3 className="font-semibold text-white text-base">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Create an Account",
    body: "Sign up in 30 seconds. No credit card, no server setup.",
  },
  {
    n: "02",
    title: "Choose an AI Integration",
    body: "Browse our catalog. ElevenLabs Sound FX is live now. More coming monthly.",
  },
  {
    n: "03",
    title: "Configure Your Widget",
    body: "Name it, set the behavior, match it to your site's feel.",
  },
  {
    n: "04",
    title: "Embed One Line of Code",
    body: "Copy an iframe snippet. Paste it into any Webflow page. Your visitors can now generate AI content directly on your site.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="pricing"
      className="py-28"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 text-center">
          Four Steps. No Backend Required.
        </h2>
        <p className="text-center mb-16" style={{ color: "#888888" }}>
          From sign-up to embedded widget in under five minutes.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, body }) => (
            <div
              key={n}
              className="p-6 rounded-xl border flex flex-col gap-4"
              style={{
                backgroundColor: "#111111",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: BLUE }}
              >
                {n}
              </span>
              <h3 className="font-semibold text-white text-base leading-snug">
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ──────────────────────────────────────────────────────────────
const AUDIENCES = [
  {
    icon: Briefcase,
    title: "Webflow Agencies",
    body: "Add AI-powered features to client sites without hiring a backend team. Deliver more, charge more.",
  },
  {
    icon: Users,
    title: "SaaS Founders on Webflow",
    body: "Prototype AI features on your marketing site before building them into your product.",
  },
  {
    icon: Palette,
    title: "Creative Studios & Freelancers",
    body: "Sound designers, content creators, visual artists — give your audience tools to create alongside you.",
  },
];

function AudienceSection() {
  return (
    <section className="py-28" style={{ backgroundColor: "#000000" }}>
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-16 text-center">
          Built for Creators Who Ship
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="p-6 rounded-xl border flex flex-col gap-4"
              style={{
                backgroundColor: "#0A0A0A",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="p-2.5 rounded-lg self-start"
                style={{ backgroundColor: `${BLUE}18` }}
              >
                <Icon size={20} style={{ color: BLUE }} />
              </div>
              <h3 className="font-semibold text-white text-base">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────
type PricingTier = {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
};

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    tagline: "Perfect for trying it out",
    features: [
      "100 generations / month",
      "1 widget",
      "Community support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    tagline: "For agencies and growing sites",
    features: [
      "5,000 generations / month",
      "10 widgets",
      "Priority support",
      "Custom styling",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    tagline: "For teams that embed AI everywhere",
    features: [
      "Unlimited generations",
      "Unlimited widgets",
      "White-label",
      "Dedicated support",
      "Analytics dashboard",
    ],
    highlighted: false,
  },
];

function PricingSection() {
  return (
    <section className="py-28" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 text-center">
          Simple Pricing
        </h2>
        <p className="text-center mb-16" style={{ color: "#888888" }}>
          Start free. Upgrade when you grow.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative p-8 rounded-xl border flex flex-col gap-6"
              style={{
                backgroundColor: tier.highlighted ? "#0D1A2E" : "#111111",
                borderColor: tier.highlighted ? BLUE : "rgba(255,255,255,0.07)",
                boxShadow: tier.highlighted
                  ? `0 0 40px ${BLUE}22`
                  : "none",
              }}
            >
              {tier.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: BLUE, color: "#ffffff" }}
                >
                  {tier.badge}
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#888888" }}>
                  {tier.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm mb-1.5" style={{ color: "#888888" }}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1" style={{ color: "#888888" }}>
                  {tier.tagline}
                </p>
              </div>

              <div
                className="h-px"
                style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
              />

              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check size={14} style={{ color: BLUE, flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: "#AAAAAA" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="mt-auto text-center py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-90"
                style={
                  tier.highlighted
                    ? { backgroundColor: BLUE, color: "#ffffff" }
                    : {
                        border: `1px solid rgba(255,255,255,0.15)`,
                        color: "#ffffff",
                      }
                }
              >
                Start Building
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 60% at 50% 100%, ${BLUE}18 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Your visitors are waiting for something to do.
        </h2>
        <p className="text-lg mb-10" style={{ color: "#AAAAAA" }}>
          Give them an AI-powered experience in under 5 minutes.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          Start Building for Free
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="border-t py-10"
      style={{
        backgroundColor: "#000000",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="font-bold text-white text-base">FlowWidgets</span>

        <div className="flex items-center gap-6">
          {["Features", "Pricing", "Docs", "Support"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-sm transition-colors"
              style={{ color: "#888888" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
            >
              {label}
            </a>
          ))}
        </div>

        <p className="text-xs" style={{ color: "#555555" }}>
          © 2026 FlowWidgets. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#000000" }}>
      <Nav />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AudienceSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
