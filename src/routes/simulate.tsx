import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { awardBadge, updateProgress, useProgress } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/simulate")({
  head: () => ({ meta: [{ title: "Simulator · Investo" }] }),
  component: SimulatePage,
});

type Sym = "RELIANCE" | "TCS" | "INFY" | "HDFCBANK" | "NIFTYBEES";
const STOCKS: Record<Sym, { name: string; start: number; vol: number; trend: number }> = {
  RELIANCE: { name: "Reliance Industries", start: 2810, vol: 0.018, trend: 0.0003 },
  TCS: { name: "Tata Consultancy", start: 3920, vol: 0.014, trend: 0.0004 },
  INFY: { name: "Infosys", start: 1620, vol: 0.016, trend: 0.0002 },
  HDFCBANK: { name: "HDFC Bank", start: 1530, vol: 0.012, trend: 0.0003 },
  NIFTYBEES: { name: "Nifty 50 ETF", start: 245, vol: 0.009, trend: 0.0005 },
};

function genSeries(sym: Sym, n: number, seed: number) {
  const cfg = STOCKS[sym];
  let v = cfg.start, r = seed;
  const rng = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const out = [] as { t: number; price: number }[];
  for (let i = 0; i < n; i++) {
    v = Math.max(1, v * (1 + cfg.trend + (rng() - 0.5) * cfg.vol * 2));
    out.push({ t: i, price: Math.round(v * 100) / 100 });
  }
  return out;
}

function SimulatePage() {
  const p = useProgress();
  const [sym, setSym] = useState<Sym>("RELIANCE");
  const [tick, setTick] = useState(0);
  const [qty, setQty] = useState<string>("1");
  const [initialCash, setInitialCash] = useState<number>(100000);

  const series = useMemo(() => genSeries(sym, 80 + tick, sym.length * 7 + 11), [sym, tick]);

  // live tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const last = series[series.length - 1].price;
  const prev = series[series.length - 2]?.price ?? last;
  const change = last - prev;
  const changePct = (change / prev) * 100;

  const pos = p.portfolio.positions[sym];
  const positionValue = pos ? pos.qty * last : 0;
  const positionPnL = pos ? (last - pos.avg) * pos.qty : 0;

  const totalEquity = Object.entries(p.portfolio.positions).reduce((sum, [s, pos]) => {
    const px = STOCKS[s as Sym] ? genSeries(s as Sym, 80 + tick, s.length * 7 + 11).slice(-1)[0].price : pos.avg;
    return sum + px * pos.qty;
  }, 0);
  const totalValue = p.portfolio.cash + totalEquity;
  const startValue = initialCash;
  const totalPnL = totalValue - startValue;

  const trade = (side: "buy" | "sell") => {
    const q = Math.max(1, Math.floor(Number(qty) || 0));
    if (side === "buy") {
      const cost = q * last;
      if (cost > p.portfolio.cash) { toast.error("Not enough cash"); return; }
      updateProgress((pr) => {
        const existing = pr.portfolio.positions[sym];
        const newQty = (existing?.qty ?? 0) + q;
        const newAvg = existing ? (existing.avg * existing.qty + last * q) / newQty : last;
        return {
          ...pr,
          portfolio: {
            ...pr.portfolio,
            cash: pr.portfolio.cash - cost,
            positions: { ...pr.portfolio.positions, [sym]: { qty: newQty, avg: newAvg } },
          },
        };
      });
      toast.success(`Bought ${q} ${sym} @ ₹${last}`);
      awardBadge("Trader");
    } else {
      if (!pos || pos.qty < q) { toast.error("Not enough holdings"); return; }
      const proceeds = q * last;
      updateProgress((pr) => {
        const existing = pr.portfolio.positions[sym]!;
        const newQty = existing.qty - q;
        const newPositions = { ...pr.portfolio.positions };
        if (newQty <= 0) delete newPositions[sym]; else newPositions[sym] = { ...existing, qty: newQty };
        return { ...pr, portfolio: { ...pr.portfolio, cash: pr.portfolio.cash + proceeds, positions: newPositions } };
      });
      const pnl = (last - pos.avg) * q;
      if (pnl < 0) toast.warning(`Sold at a loss: ₹${pnl.toFixed(0)}`, { description: "Losses are part of learning — this is exactly why we practice." });
      else toast.success(`Sold ${q} ${sym} · +₹${pnl.toFixed(0)}`);
    }
  };

  useEffect(() => {
    // Keep local draft in sync with stored cash when user navigates back to this page.
    setInitialCash(p.portfolio.cash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    updateProgress((pr) => ({ ...pr, portfolio: { cash: initialCash, positions: {}, history: [] } }));
    toast.info(`Practice portfolio reset to ₹${initialCash.toLocaleString("en-IN")}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Portfolio bar */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Practice capital</div>
          <Input
            type="number"
            min={1000}
            step={1000}
            value={initialCash}
            onChange={(e) => setInitialCash(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Stored cash</span>
            <span className="font-semibold">₹{p.portfolio.cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              updateProgress((pr) => ({
                ...pr,
                portfolio: { cash: initialCash, positions: {}, history: [] },
              }));
              toast.info(`Practice capital set to ₹${initialCash.toLocaleString("en-IN")}`);
            }}
          >
            Apply
          </Button>
        </Card>

        <Card className="p-4 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Total value</div>
              <div className="mt-1 font-display text-2xl font-bold">₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
            <Badge className={totalPnL >= 0 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toFixed(0)} · {startValue > 0 ? ((totalPnL / startValue) * 100).toFixed(2) : "0.00"}%
            </Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Cash</div>
          <div className="mt-1 font-display text-xl font-bold">₹{p.portfolio.cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Holdings</div>
          <div className="mt-1 font-display text-xl font-bold">₹{totalEquity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-border p-4">
            <Tabs value={sym} onValueChange={(v) => setSym(v as Sym)}>
              <TabsList className="flex w-full overflow-x-auto">
                {(Object.keys(STOCKS) as Sym[]).map((s) => (
                  <TabsTrigger key={s} value={s} className="flex-1 min-w-[100px]">{s}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{STOCKS[sym].name}</div>
                <div className="flex items-baseline gap-3">
                  <motion.div key={last} initial={{ scale: 1.04 }} animate={{ scale: 1 }} className="font-display text-3xl font-bold">
                    ₹{last.toFixed(2)}
                  </motion.div>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
                    {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="gap-1 animate-pulse"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Live mock</Badge>
            </div>

            <div className="mt-5 h-72">
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="px" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={change >= 0 ? "oklch(0.7 0.18 155)" : "oklch(0.6 0.22 27)"} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={change >= 0 ? "oklch(0.7 0.18 155)" : "oklch(0.6 0.22 27)"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" stroke="currentColor" fontSize={10} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} stroke="currentColor" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => `₹${v}`} />
                  <Area dataKey="price" stroke={change >= 0 ? "oklch(0.7 0.18 155)" : "oklch(0.6 0.22 27)"} strokeWidth={2} fill="url(#px)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Trade panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold">Place a mock trade</h3>
            <p className="mt-1 text-xs text-muted-foreground">No real money. Designed to feel like a real broker so the real thing isn't scary.</p>
            <div className="mt-4">
              <label className="text-xs font-medium">Quantity</label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Est. cost</span>
                <span className="font-semibold text-foreground">₹{(Number(qty) * last || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="hero" onClick={() => trade("buy")}>Buy</Button>
              <Button variant="destructive" onClick={() => trade("sell")}>Sell</Button>
            </div>
            {pos && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
                <div className="flex justify-between"><span>Holding</span><span className="font-semibold">{pos.qty} @ ₹{pos.avg.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Value</span><span className="font-semibold">₹{positionValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
                <div className="flex justify-between"><span>P&L</span><span className={`font-semibold ${positionPnL >= 0 ? "text-success" : "text-destructive"}`}>{positionPnL >= 0 ? "+" : ""}₹{positionPnL.toFixed(0)}</span></div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-accent" /> Holdings</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(p.portfolio.positions).length === 0 && (
                <li className="text-xs text-muted-foreground">No positions yet — buy something to start your practice journey.</li>
              )}
              {Object.entries(p.portfolio.positions).map(([s, ps]) => (
                <li key={s} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s}</div>
                    <div className="text-xs text-muted-foreground">{ps.qty} @ ₹{ps.avg.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{(ps.qty * (STOCKS[s as Sym] ? genSeries(s as Sym, 80 + tick, s.length * 7 + 11).slice(-1)[0].price : ps.avg)).toFixed(0)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={reset}>Reset practice portfolio</Button>
          </Card>

          <Card className="p-4 bg-warning/10 border-warning/30">
            <div className="text-xs font-semibold text-warning-foreground">⚠️ Transparent reality</div>
            <p className="mt-1 text-xs text-muted-foreground">Prices move randomly here to teach. Real markets have news, earnings and emotions — losses can be deeper. That's why we practice first.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
