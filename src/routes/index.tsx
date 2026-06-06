import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, GraduationCap, LineChart, Scale, ShieldAlert, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useProgress } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MODULES } from "@/lib/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Investo — Learn investing the smart way" },
      { name: "description", content: "Gamified investing literacy: learn, test, visualize risk, compare and simulate trades safely." },
    ],
  }),
  component: Home,
});

const TICKER = [
  { sym: "NIFTY", v: "+0.84%", up: true },
  { sym: "SENSEX", v: "+0.62%", up: true },
  { sym: "RELIANCE", v: "-0.31%", up: false },
  { sym: "TCS", v: "+1.15%", up: true },
  { sym: "HDFC", v: "+0.42%", up: true },
  { sym: "INFY", v: "-0.18%", up: false },
  { sym: "GOLD", v: "+0.21%", up: true },
  { sym: "USD/INR", v: "-0.05%", up: false },
];

function Home() {
  const p = useProgress();
  const done = p.modulesDone.length;
  const total = MODULES.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "80px 80px, 120px 120px" }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">New · Risk‑free practice</Badge>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              Invest with <span className="bg-gradient-gold bg-clip-text text-transparent">confidence</span>, not guesses.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
              Bite-sized lessons, visual risk tools, side-by-side comparisons and a realistic trading simulator — all in one calm place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="hero">
                <Link to={p.profile?.onboarded ? "/learn" : "/onboarding"}>
                  {p.profile?.onboarded ? "Continue learning" : "Start your journey"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/simulate">Try the simulator</Link>
              </Button>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { k: "5 modules", v: "Beginner → ready" },
                { k: "₹0 risk", v: "Practice safely" },
                { k: "10 min/day", v: "Build the habit" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <div className="text-sm font-semibold">{s.k}</div>
                  <div className="text-xs text-white/70">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Animated dashboard preview */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
            <div className="absolute -inset-6 bg-gradient-emerald opacity-30 blur-3xl" />
            <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60">Practice portfolio</div>
                  <div className="font-display text-2xl font-bold">₹1,04,820</div>
                </div>
                <Badge className="bg-success text-success-foreground">+4.82%</Badge>
              </div>
              <SparklineHero />
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {["RELIANCE", "TCS", "INFY"].map((s, i) => (
                  <div key={s} className="rounded-lg bg-white/5 p-2">
                    <div className="font-semibold">{s}</div>
                    <div className={i % 2 ? "text-destructive" : "text-success"}>{i % 2 ? "−0.4%" : "+1.2%"}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ticker */}
        <div className="relative overflow-hidden border-t border-white/10 bg-black/20 py-3">
          <div className="flex w-max animate-ticker gap-10 whitespace-nowrap text-sm">
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-2 text-white/80">
                <span className="font-semibold">{t.sym}</span>
                <span className={t.up ? "text-success" : "text-destructive"}>{t.v}</span>
                <span className="text-white/30">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Your journey</div>
            <h2 className="mt-1 text-3xl font-bold">Six steps from curious to confident</h2>
          </div>
          {p.profile?.onboarded && (
            <div className="hidden text-right md:block">
              <div className="text-sm text-muted-foreground">Modules complete</div>
              <div className="text-lg font-bold">{done}/{total}</div>
              <Progress value={pct} className="mt-1 w-40" />
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/onboarding", icon: Sparkles, title: "Onboarding", desc: "Tell us your goal & comfort. 60 seconds.", color: "from-violet-500/20 to-violet-500/5" },
            { to: "/learn", icon: GraduationCap, title: "Learn", desc: "Visual modules with streaks & badges.", color: "from-emerald-500/20 to-emerald-500/5" },
            { to: "/quiz", icon: Trophy, title: "Knowledge Test", desc: "Earn your Readiness Score.", color: "from-amber-500/20 to-amber-500/5" },
            { to: "/risk", icon: ShieldAlert, title: "Risk Visualization", desc: "See gains, losses & volatility plainly.", color: "from-rose-500/20 to-rose-500/5" },
            { to: "/compare", icon: Scale, title: "Compare", desc: "₹10K · 5 yrs — FD vs Index vs Stock.", color: "from-sky-500/20 to-sky-500/5" },
            { to: "/simulate", icon: TrendingUp, title: "Simulate", desc: "Mock trade in a realistic interface.", color: "from-teal-500/20 to-teal-500/5" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.to} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={s.to as string} className="group block h-full">
                  <Card className={`relative h-full overflow-hidden border-border/60 bg-gradient-to-br ${s.color} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant`}>
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-card shadow-sm">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">0{i + 1}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    <div className="mt-4 inline-flex items-center text-sm font-semibold text-accent">
                      Open <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats / streak */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={<Flame className="h-5 w-5 text-warning" />} label="Current streak" value={`${p.streak} days`} />
          <StatTile icon={<Sparkles className="h-5 w-5 text-accent" />} label="Total XP" value={`${p.xp}`} />
          <StatTile icon={<Trophy className="h-5 w-5 text-gold" />} label="Badges" value={`${p.badges.length}`} />
          <StatTile icon={<LineChart className="h-5 w-5 text-chart-2" />} label="Readiness" value={`${p.readinessScore}%`} />
        </div>
      </section>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </Card>
  );
}

function SparklineHero() {
  const pts = [20, 32, 28, 40, 36, 50, 46, 60, 55, 70, 64, 78];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const path = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min)) * 100;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-28 w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.18 155)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.7 0.18 155)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#g)" />
      <motion.path d={path} stroke="oklch(0.85 0.18 155)" strokeWidth="1.5" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} />
    </svg>
  );
}
