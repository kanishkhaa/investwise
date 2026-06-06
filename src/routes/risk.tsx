import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { awardBadge } from "@/lib/storage";

export const Route = createFileRoute("/risk")({
  head: () => ({ meta: [{ title: "Risk Visualization · Investo" }] }),
  component: RiskPage,
});

type AssetKey = "fd" | "index" | "stock";
const ASSETS: Record<AssetKey, { name: string; mean: number; vol: number; color: string; desc: string }> = {
  fd: { name: "Fixed Deposit", mean: 0.065, vol: 0.005, color: "oklch(0.55 0.18 250)", desc: "Predictable, capital-safe." },
  index: { name: "Index Fund", mean: 0.12, vol: 0.18, color: "oklch(0.65 0.17 158)", desc: "Owns the whole market." },
  stock: { name: "Single Stock", mean: 0.16, vol: 0.38, color: "oklch(0.6 0.22 27)", desc: "Higher upside, deeper drawdowns." },
};

function simulate(asset: AssetKey, years: number, amount: number, seed: number) {
  const { mean, vol } = ASSETS[asset];
  let rand = seed;
  const rng = () => { rand = (rand * 9301 + 49297) % 233280; return rand / 233280; };
  const data = [{ year: 0, value: amount, best: amount, worst: amount }];
  let v = amount, best = amount, worst = amount;
  for (let y = 1; y <= years; y++) {
    const r = mean + (rng() - 0.5) * vol * 2;
    v = v * (1 + r);
    best = best * (1 + mean + vol);
    worst = worst * (1 + mean - vol);
    data.push({ year: y, value: Math.round(v), best: Math.round(best), worst: Math.round(worst) });
  }
  return data;
}

function RiskPage() {
  const [asset, setAsset] = useState<AssetKey>("index");
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const data = useMemo(() => simulate(asset, years, amount, 42), [asset, years, amount]);
  const a = ASSETS[asset];

  // award if user explores all assets
  useMemo(() => { awardBadge("Risk Reader"); }, []);

  const final = data[data.length - 1];
  const riskTier = a.vol < 0.05 ? { label: "Low", color: "bg-success text-success-foreground", angle: -60 }
    : a.vol < 0.25 ? { label: "Medium", color: "bg-warning text-warning-foreground", angle: 0 }
    : { label: "High", color: "bg-destructive text-destructive-foreground", angle: 60 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        <ShieldAlert className="h-3.5 w-3.5" /> Risk Visualization
      </div>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">See risk before you take it</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">Move the sliders and switch assets. The meter, ranges, and historical-style chart update live.</p>

      <Tabs value={asset} onValueChange={(v) => setAsset(v as AssetKey)} className="mt-8">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          {(Object.keys(ASSETS) as AssetKey[]).map((k) => <TabsTrigger key={k} value={k}>{ASSETS[k].name}</TabsTrigger>)}
        </TabsList>

        {(Object.keys(ASSETS) as AssetKey[]).map((k) => (
          <TabsContent key={k} value={k} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Meter */}
              <Card className="p-6">
                <h3 className="font-bold">Risk Meter</h3>
                <div className="relative mx-auto mt-6 h-32 w-56">
                  <svg viewBox="0 0 200 120" className="absolute inset-0">
                    <defs>
                      <linearGradient id="meter" x1="0" x2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.18 155)" />
                        <stop offset="50%" stopColor="oklch(0.82 0.14 85)" />
                        <stop offset="100%" stopColor="oklch(0.6 0.22 27)" />
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="url(#meter)" strokeWidth="16" fill="none" strokeLinecap="round" />
                  </svg>
                  <motion.div className="absolute left-1/2 top-[100px] h-[2px] origin-left bg-foreground"
                    style={{ width: 70 }}
                    initial={false}
                    animate={{ rotate: riskTier.angle - 90 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14 }} />
                  <div className="absolute left-1/2 top-[96px] h-3 w-3 -translate-x-1/2 rounded-full bg-foreground" />
                </div>
                <div className="mt-4 text-center">
                  <Badge className={riskTier.color}>{riskTier.label} risk</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">{ASSETS[asset].desc}</p>
                </div>
              </Card>

              {/* Controls + Outcomes */}
              <Card className="lg:col-span-2 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Amount: <span className="text-accent">₹{amount.toLocaleString("en-IN")}</span></label>
                    <Slider value={[amount]} min={10000} max={1000000} step={10000} onValueChange={(v) => setAmount(v[0])} className="mt-3" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Years: <span className="text-accent">{years}</span></label>
                    <Slider value={[years]} min={1} max={30} step={1} onValueChange={(v) => setYears(v[0])} className="mt-3" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Outcome label="Likely value" value={final.value} delta={final.value - amount} color="text-foreground" />
                  <Outcome label="Best case" value={final.best} delta={final.best - amount} color="text-success" icon={<TrendingUp className="h-4 w-4" />} />
                  <Outcome label="Worst case" value={final.worst} delta={final.worst - amount} color="text-destructive" icon={<TrendingDown className="h-4 w-4" />} />
                </div>

                <div className="mt-6 h-64">
                  <ResponsiveContainer>
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={a.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={a.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="currentColor" fontSize={11} tickLine={false} />
                      <YAxis stroke="currentColor" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                        formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <ReferenceLine y={amount} stroke="currentColor" strokeDasharray="3 3" opacity={0.4} />
                      <Area dataKey="best" stroke="none" fill="url(#band)" />
                      <Area dataKey="value" stroke={a.color} strokeWidth={2.5} fill="none" />
                      <Area dataKey="worst" stroke={a.color} strokeWidth={1} strokeDasharray="4 4" fill="none" opacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Outcome({ label, value, delta, color, icon }: { label: string; value: number; delta: number; color: string; icon?: React.ReactNode }) {
  const pct = ((delta / (value - delta || 1)) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">{label}{icon}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>₹{value.toLocaleString("en-IN")}</div>
      <div className={`text-xs ${delta >= 0 ? "text-success" : "text-destructive"}`}>{delta >= 0 ? "+" : ""}{pct}%</div>
    </div>
  );
}
