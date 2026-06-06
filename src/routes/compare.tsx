import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare · Investo" }] }),
  component: ComparePage,
});

const CFG = {
  fd: { name: "Fixed Deposit", mean: 0.065, vol: 0.005, color: "oklch(0.55 0.18 250)" },
  index: { name: "Index Fund", mean: 0.12, vol: 0.18, color: "oklch(0.65 0.17 158)" },
  stock: { name: "Single Stock", mean: 0.16, vol: 0.38, color: "oklch(0.6 0.22 27)" },
};

function project(amount: number, years: number) {
  const out: Record<string, number>[] = [{ year: 0, FD: amount, Index: amount, Stock: amount, IndexBest: amount, IndexWorst: amount, StockBest: amount, StockWorst: amount }];
  for (let y = 1; y <= years; y++) {
    const prev = out[y - 1];
    out.push({
      year: y,
      FD: Math.round(prev.FD * (1 + CFG.fd.mean)),
      Index: Math.round(prev.Index * (1 + CFG.index.mean)),
      Stock: Math.round(prev.Stock * (1 + CFG.stock.mean)),
      IndexBest: Math.round(prev.IndexBest * (1 + CFG.index.mean + CFG.index.vol * 0.5)),
      IndexWorst: Math.round(prev.IndexWorst * (1 + CFG.index.mean - CFG.index.vol * 0.6)),
      StockBest: Math.round(prev.StockBest * (1 + CFG.stock.mean + CFG.stock.vol * 0.5)),
      StockWorst: Math.round(prev.StockWorst * (1 + CFG.stock.mean - CFG.stock.vol * 0.7)),
    });
  }
  return out;
}

function ComparePage() {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(5);
  const data = useMemo(() => project(amount, years), [amount, years]);
  const final = data[data.length - 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        <Scale className="h-3.5 w-3.5" /> Compare
      </div>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">₹{amount.toLocaleString("en-IN")} for {years} years</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">Same money, three paths. See the realistic best, worst and likely outcomes.</p>

      <Card className="mt-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Amount: <span className="text-accent">₹{amount.toLocaleString("en-IN")}</span></label>
            <Slider value={[amount]} min={1000} max={500000} step={1000} onValueChange={(v) => setAmount(v[0])} className="mt-3" />
          </div>
          <div>
            <label className="text-sm font-medium">Years: <span className="text-accent">{years}</span></label>
            <Slider value={[years]} min={1} max={30} step={1} onValueChange={(v) => setYears(v[0])} className="mt-3" />
          </div>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="year" stroke="currentColor" fontSize={11} tickLine={false} />
              <YAxis stroke="currentColor" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Legend />
              <Line type="monotone" dataKey="FD" stroke={CFG.fd.color} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Index" stroke={CFG.index.color} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Stock" stroke={CFG.stock.color} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="IndexBest" stroke={CFG.index.color} strokeWidth={1} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="IndexWorst" stroke={CFG.index.color} strokeWidth={1} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="StockBest" stroke={CFG.stock.color} strokeWidth={1} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="StockWorst" stroke={CFG.stock.color} strokeWidth={1} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {([
          { key: "FD" as const, name: "Fixed Deposit", color: CFG.fd.color, best: final.FD, likely: final.FD, worst: final.FD, desc: "Predictable interest. No drama, modest growth." },
          { key: "Index" as const, name: "Index Fund", color: CFG.index.color, best: final.IndexBest, likely: final.Index, worst: final.IndexWorst, desc: "Owns hundreds of stocks. Long-term winner historically." },
          { key: "Stock" as const, name: "Single Stock", color: CFG.stock.color, best: final.StockBest, likely: final.Stock, worst: final.StockWorst, desc: "Higher highs, deeper lows. Concentration risk." },
        ]).map((c, i) => (
          <motion.div key={c.key} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
            <Card className="overflow-hidden p-0">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{c.name}</h3>
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                </div>
                <div className="mt-4 space-y-3">
                  <Row label="Likely" value={c.likely} amount={amount} bold />
                  <Row label="Best case" value={c.best} amount={amount} pos />
                  <Row label="Worst case" value={c.worst} amount={amount} neg />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, amount, bold, pos, neg }: { label: string; value: number; amount: number; bold?: boolean; pos?: boolean; neg?: boolean }) {
  const diff = ((value - amount) / amount) * 100;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <div className={`font-display ${bold ? "text-xl font-bold" : "text-sm font-semibold"}`}>₹{value.toLocaleString("en-IN")}</div>
        <Badge variant="secondary" className={`text-[10px] ${pos ? "text-success" : neg ? "text-destructive" : ""}`}>
          {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
        </Badge>
      </div>
    </div>
  );
}
