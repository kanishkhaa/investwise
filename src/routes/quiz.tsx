import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { QUIZ } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { addXP, awardBadge, bumpStreak, updateProgress, useProgress } from "@/lib/storage";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Knowledge Test · Investo" }] }),
  component: Quiz,
});

function Quiz() {
  const p = useProgress();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ[i];
  const finish = (finalScore: number) => {
    const pct = Math.round((finalScore / QUIZ.length) * 100);
    updateProgress((p) => ({ ...p, readinessScore: Math.max(p.readinessScore, pct), quizBest: Math.max(p.quizBest, finalScore) }));
    addXP(finalScore * 10);
    bumpStreak();
    if (pct >= 80) {
      awardBadge("Quiz Whiz");
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 } });
    }
    setDone(true);
  };

  const next = () => {
    if (picked === null) return;
    const correct = picked === q.answer;
    const ns = score + (correct ? 1 : 0);
    setScore(ns);
    if (i === QUIZ.length - 1) finish(ns);
    else { setI(i + 1); setPicked(null); }
  };

  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / QUIZ.length) * 100);
    const tier = pct >= 80 ? { label: "Ready", color: "text-success", desc: "Strong fundamentals. Try the simulator." }
      : pct >= 50 ? { label: "Almost there", color: "text-warning", desc: "Review modules, then retry." }
      : { label: "Keep learning", color: "text-destructive", desc: "Start with Money Basics." };
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-hero p-8 text-center text-primary-foreground">
            <div className="text-xs uppercase tracking-wider text-white/70">Your readiness score</div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }}
              className="mt-2 font-display text-7xl font-bold">{pct}%</motion.div>
            <div className={`mt-2 text-lg font-semibold ${tier.color}`}>{tier.label}</div>
            <div className="mt-1 text-sm text-white/70">{tier.desc}</div>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">You answered {score} of {QUIZ.length} correctly · +{score * 10} XP earned</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Retake</Button>
              <Button asChild variant="hero"><Link to="/simulate">Try the simulator</Link></Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {i + 1} of {QUIZ.length}</span>
        <Badge variant="secondary">{p.readinessScore}% best</Badge>
      </div>
      <Progress value={((i + (picked !== null ? 1 : 0)) / QUIZ.length) * 100} className="mt-2" />

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-bold">{q.q}</h2>
            <div className="mt-5 space-y-2">
              {q.options.map((o, idx) => {
                const isPicked = picked === idx;
                const showResult = picked !== null;
                const isCorrect = idx === q.answer;
                return (
                  <button key={idx} disabled={picked !== null} onClick={() => setPicked(idx)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                      showResult && isCorrect ? "border-success bg-success/10" :
                      showResult && isPicked && !isCorrect ? "border-destructive bg-destructive/10" :
                      isPicked ? "border-accent bg-accent/10" : "border-border hover:border-accent/40 hover:bg-muted"
                    }`}>
                    <span>{o}</span>
                    {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {showResult && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-md bg-muted p-3 text-sm">
                <span className="font-semibold">Why: </span>{q.explain}
              </motion.div>
            )}
            <Button onClick={next} disabled={picked === null} variant="hero" className="mt-5 w-full">
              {i === QUIZ.length - 1 ? "See result" : "Next question"}
            </Button>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
