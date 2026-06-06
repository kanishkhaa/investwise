import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { awardBadge, bumpStreak, updateProgress } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started · Investo" }] }),
  component: Onboarding,
});

type Step = { key: string; title: string; subtitle?: string; type: "text" | "choice"; options?: { v: string; label: string; emoji: string; desc?: string }[] };

const STEPS: Step[] = [
  { key: "name", title: "What should we call you?", subtitle: "We'll personalize your dashboard.", type: "text" },
  { key: "goal", title: "Why do you want to invest?", subtitle: "There's no wrong answer.", type: "choice", options: [
    { v: "wealth", label: "Long-term wealth", emoji: "🌱", desc: "Grow money over decades" },
    { v: "house", label: "Buy a home", emoji: "🏠", desc: "A big future purchase" },
    { v: "retire", label: "Retire comfortably", emoji: "🌅", desc: "Financial freedom" },
    { v: "side", label: "Extra income", emoji: "💸", desc: "Make money work harder" },
  ]},
  { key: "horizon", title: "When will you need this money?", type: "choice", options: [
    { v: "short", label: "Under 2 years", emoji: "⚡" },
    { v: "mid", label: "2–5 years", emoji: "🛣️" },
    { v: "long", label: "5–15 years", emoji: "🌳" },
    { v: "vlong", label: "15+ years", emoji: "🏔️" },
  ]},
  { key: "risk", title: "How would you feel if your investment dropped 20% in a month?", type: "choice", options: [
    { v: "panic", label: "Sell everything", emoji: "😰", desc: "Conservative profile" },
    { v: "worry", label: "Worry, but hold", emoji: "😬", desc: "Moderate profile" },
    { v: "buy", label: "Buy more", emoji: "😎", desc: "Aggressive profile" },
  ]},
  { key: "amount", title: "Roughly how much can you set aside each month?", type: "choice", options: [
    { v: "1k", label: "₹500 – ₹2,000", emoji: "🌱" },
    { v: "5k", label: "₹2,000 – ₹10,000", emoji: "🌿" },
    { v: "25k", label: "₹10,000 – ₹50,000", emoji: "🌳" },
    { v: "100k", label: "₹50,000+", emoji: "🌲" },
  ]},
  { key: "experience", title: "How would you describe your experience?", type: "choice", options: [
    { v: "none", label: "Complete beginner", emoji: "🥚" },
    { v: "some", label: "Read a bit, never invested", emoji: "🐣" },
    { v: "active", label: "Already investing", emoji: "🦅" },
  ]},
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const s = STEPS[step];
  const pct = ((step + 1) / STEPS.length) * 100;

  const next = (value?: string) => {
    const v = value ?? answers[s.key];
    if (!v?.trim()) return;
    const updated = { ...answers, [s.key]: v };
    setAnswers(updated);
    if (step === STEPS.length - 1) {
      updateProgress((p) => ({
        ...p,
        profile: {
          name: updated.name || "Investor",
          goal: updated.goal || "wealth",
          horizon: updated.horizon || "long",
          risk: updated.risk || "worry",
          amount: updated.amount || "5k",
          experience: updated.experience || "none",
          onboarded: true,
        },
      }));
      bumpStreak();
      awardBadge("First Steps");
      toast.success("Welcome aboard! 🎉", { description: "You earned the First Steps badge." });
      navigate({ to: "/learn" });
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
            <LineChart className="h-4 w-4" />
          </span>
          Investo
        </div>
        <button onClick={() => navigate({ to: "/" })} className="text-sm text-white/70 hover:text-white">Skip</button>
      </header>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-gradient-gold" initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 200, damping: 25 }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/70">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Earn the First Steps badge</span>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col px-4 pb-16 pt-10 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-bold sm:text-4xl">{s.title}</h1>
            {s.subtitle && <p className="mt-2 text-white/70">{s.subtitle}</p>}

            {s.type === "text" && (
              <div className="mt-8 flex max-w-md gap-2">
                <Input autoFocus value={answers[s.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [s.key]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  placeholder="Your name"
                  className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent" />
                <Button variant="hero" size="lg" onClick={() => next()}>Next <ArrowRight className="h-4 w-4" /></Button>
              </div>
            )}

            {s.type === "choice" && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.options!.map((o) => {
                  const selected = answers[s.key] === o.v;
                  return (
                    <button key={o.v} onClick={() => next(o.v)}
                      className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all ${
                        selected ? "border-accent bg-accent/20" : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{o.emoji}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{o.label}</div>
                          {o.desc && <div className="mt-0.5 text-xs text-white/60">{o.desc}</div>}
                        </div>
                        {selected && <Check className="h-5 w-5 text-accent" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="mt-10 inline-flex w-fit items-center gap-1 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
      </div>
    </div>
  );
}
