import { motion } from "framer-motion";

export function LessonVisual({ kind }: { kind?: "growth" | "risk" | "diversify" | "compound" }) {
  if (kind === "growth") return <GrowthViz />;
  if (kind === "risk") return <RiskViz />;
  if (kind === "diversify") return <DiversifyViz />;
  if (kind === "compound") return <CompoundViz />;
  return <GrowthViz />;
}

function GrowthViz() {
  const bars = [20, 28, 25, 38, 44, 40, 55, 62, 60, 75, 82, 95];
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 p-6">
      <div className="flex h-40 items-end gap-2">
        {bars.map((b, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${b}%` }} transition={{ delay: i * 0.04, type: "spring", stiffness: 120 }}
            className="flex-1 rounded-t-md bg-gradient-emerald" />
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">Money invested early compounds quietly.</div>
    </div>
  );
}

function RiskViz() {
  const points = Array.from({ length: 40 }, (_, i) => {
    const base = 50 + i * 0.4;
    const noise = Math.sin(i * 0.9) * 12 + Math.cos(i * 1.7) * 6;
    return base + noise;
  });
  const max = Math.max(...points), min = Math.min(...points);
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 100} ${100 - ((v - min) / (max - min)) * 80 - 10}`).join(" ");
  return (
    <div className="rounded-xl bg-gradient-to-br from-rose-500/10 to-emerald-500/10 p-6">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
        <motion.path d={path} stroke="oklch(0.6 0.22 27)" strokeWidth="1.2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeDasharray="2 2" opacity="0.2" />
      </svg>
      <div className="mt-2 text-xs text-muted-foreground text-center">Prices bounce — that's volatility, not loss.</div>
    </div>
  );
}

function DiversifyViz() {
  const slices = [
    { label: "Stocks", v: 50, c: "oklch(0.65 0.17 158)" },
    { label: "Bonds", v: 25, c: "oklch(0.55 0.18 250)" },
    { label: "Gold", v: 15, c: "oklch(0.78 0.16 70)" },
    { label: "Cash", v: 10, c: "oklch(0.7 0.03 250)" },
  ];
  let acc = 0;
  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 p-6">
      <div className="flex items-center justify-center gap-6">
        <svg viewBox="-1 -1 2 2" className="h-36 w-36 -rotate-90">
          {slices.map((s, i) => {
            const start = acc / 100 * Math.PI * 2;
            acc += s.v;
            const end = acc / 100 * Math.PI * 2;
            const large = end - start > Math.PI ? 1 : 0;
            const x1 = Math.cos(start), y1 = Math.sin(start);
            const x2 = Math.cos(end), y2 = Math.sin(end);
            return (
              <motion.path key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }}
                d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${large} 1 ${x2} ${y2} Z`} fill={s.c} />
            );
          })}
        </svg>
        <ul className="space-y-1.5 text-sm">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: s.c }} />
              <span className="font-medium">{s.label}</span>
              <span className="text-muted-foreground">{s.v}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 text-xs text-muted-foreground text-center">A balanced mix smooths the ride.</div>
    </div>
  );
}

function CompoundViz() {
  const years = Array.from({ length: 30 }, (_, i) => Math.round(1000 * Math.pow(1.12, i)));
  const max = years[years.length - 1];
  return (
    <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/0 p-6">
      <svg viewBox="0 0 100 60" className="h-40 w-full">
        {years.map((v, i) => {
          const x = (i / (years.length - 1)) * 100;
          const h = (v / max) * 55;
          return <motion.rect key={i} x={x - 1} y={60 - h} width="2" height={h} fill="oklch(0.78 0.14 85)"
            initial={{ height: 0, y: 60 }} animate={{ height: h, y: 60 - h }} transition={{ delay: i * 0.03 }} />;
        })}
      </svg>
      <div className="mt-2 text-xs text-muted-foreground text-center">₹1,000/yr at 12% becomes ₹{(max / 1000).toFixed(0)}K in 30 years.</div>
    </div>
  );
}
