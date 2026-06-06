import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, GraduationCap, Home, LineChart, Menu, Scale, ShieldAlert, Sparkles, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { useProgress } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingTour } from "@/components/onboarding-tour";

const NAV: { to: string; label: string; icon: typeof Home; tour?: string }[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: GraduationCap, tour: "nav-learn" },
  { to: "/quiz", label: "Quiz", icon: Sparkles, tour: "nav-quiz" },
  { to: "/risk", label: "Risk", icon: ShieldAlert, tour: "nav-risk" },
  { to: "/compare", label: "Compare", icon: Scale, tour: "nav-compare" },
  { to: "/simulate", label: "Simulate", icon: TrendingUp, tour: "nav-simulate" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const p = useProgress();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Hide chrome on onboarding flow for focus
  const minimal = pathname.startsWith("/onboarding");

  if (minimal) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-emerald text-accent-foreground shadow-glow">
              <LineChart className="h-4 w-4" />
            </span>
            Investo
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  data-tour={n.tour}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div data-tour="streak" className="hidden items-center gap-3 rounded-full border border-border bg-card px-3 py-1 sm:flex">
              <span className="flex items-center gap-1 text-sm font-semibold text-warning">
                <Flame className="h-4 w-4" /> {p.streak}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-sm font-semibold text-accent">{p.xp} XP</span>
            </div>
            {!p.profile?.onboarded && (
              <Button asChild size="sm" variant="hero" className="hidden sm:inline-flex">
                <Link to="/onboarding">Get started</Link>
              </Button>
            )}
            <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border bg-background md:hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-1 p-3">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                return (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className={`flex flex-col items-center gap-1 rounded-md p-2 text-xs ${active ? "bg-accent/15 text-accent" : "text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" /> {n.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <Badge variant="secondary" className="gap-1"><Flame className="h-3 w-3 text-warning" />{p.streak} day streak</Badge>
              <Badge variant="secondary">{p.xp} XP</Badge>
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-border bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          Investo is an educational prototype. Not investment advice. Past performance does not guarantee future returns.
        </div>
      </footer>
      <OnboardingTour />
    </div>
  );
}
