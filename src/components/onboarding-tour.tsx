import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { updateProgress, useProgress } from "@/lib/storage";
import { Button } from "@/components/ui/button";

type Step = { target: string; title: string; body: string; placement?: "bottom" | "top" };

const STEPS: Step[] = [
  { target: "[data-tour='nav-learn']", title: "Start with Learn", body: "Bite-sized modules with badges and streaks. Build the foundation first." },
  { target: "[data-tour='nav-quiz']", title: "Test what you know", body: "Quick quizzes give you a Readiness Score to track confidence." },
  { target: "[data-tour='nav-risk']", title: "See risk visually", body: "Risk meter and historical swings turned into easy-to-read visuals." },
  { target: "[data-tour='nav-compare']", title: "Compare options", body: "₹10K over 5 years — FD vs Index vs Stock side-by-side." },
  { target: "[data-tour='nav-simulate']", title: "Practice for real", body: "Mock trade in a familiar interface — zero real money risked." },
  { target: "[data-tour='streak']", title: "Build a streak", body: "Daily activity earns XP and badges. Tiny effort, big habit." },
];

export function OnboardingTour() {
  const progress = useProgress();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!progress.profile?.onboarded) return;
    if (progress.tourCompleted) return;
    const t = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(t);
  }, [progress.profile?.onboarded, progress.tourCompleted]);

  useEffect(() => {
    if (!show) return;
    const update = () => {
      const el = document.querySelector(STEPS[step].target) as HTMLElement | null;
      setRect(el?.getBoundingClientRect() ?? null);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [show, step]);

  if (!show) return null;
  const s = STEPS[step];
  const top = rect ? Math.min(window.innerHeight - 220, rect.bottom + 12) : 80;
  const left = rect ? Math.max(12, Math.min(window.innerWidth - 340, rect.left)) : 12;

  const finish = () => {
    updateProgress((p) => ({ ...p, tourCompleted: true }));
    setShow(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50">
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
        {rect && (
          <motion.div
            layout
            initial={false}
            animate={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute rounded-xl ring-2 ring-accent shadow-glow animate-pulse-ring"
          />
        )}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto absolute w-[320px] rounded-xl border border-border bg-card p-4 shadow-elegant"
          style={{ top, left }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Tour · {step + 1}/{STEPS.length}</div>
            <button onClick={finish} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <h3 className="mt-1 text-base font-bold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={finish} className="text-xs text-muted-foreground hover:underline">Skip tour</button>
            <Button size="sm" variant="hero" onClick={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))}>
              {step === STEPS.length - 1 ? "Got it" : "Next"} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
