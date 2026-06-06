import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Flame, Lock } from "lucide-react";
import { useState } from "react";
import { MODULES } from "@/lib/curriculum";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { awardBadge, bumpStreak, completeModule, useProgress } from "@/lib/storage";
import { LessonVisual } from "@/components/lesson-visual";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn · Investo" }, { name: "description", content: "Visual modules with streaks and badges." }] }),
  component: LearnPage,
});

function LearnPage() {
  const p = useProgress();
  const [active, setActive] = useState<string | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const mod = MODULES.find((m) => m.id === active);

  const open = (id: string) => { setActive(id); setLessonIdx(0); };
  const close = () => setActive(null);
  const advance = () => {
    if (!mod) return;
    if (lessonIdx < mod.lessons.length - 1) {
      setLessonIdx(lessonIdx + 1);
      return;
    }
    completeModule(mod.id, 50);
    bumpStreak();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 } });
    toast.success(`Module complete · +50 XP`, { description: `"${mod.title}" — keep the streak going!` });
    if (p.modulesDone.length + 1 >= 3) awardBadge("Foundations");
    if (p.modulesDone.length + 1 >= MODULES.length) awardBadge("Graduate");
    close();
  };

  const doneCount = p.modulesDone.length;
  const pct = (doneCount / MODULES.length) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Learning path</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Build your foundation, one module at a time</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Each module is 5–8 minutes. Finish to earn XP, badges, and protect your streak.</p>

          <div className="mt-8 relative">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-border md:left-8" />
            <ul className="space-y-4">
              {MODULES.map((m, i) => {
                const done = p.modulesDone.includes(m.id);
                const locked = i > 0 && !p.modulesDone.includes(MODULES[i - 1].id) && !done;
                return (
                  <motion.li key={m.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Card className={`relative ml-12 p-5 transition-all md:ml-16 ${done ? "border-accent/40 bg-accent/5" : ""} ${locked ? "opacity-60" : "hover:shadow-elegant"}`}>
                      <div className={`absolute -left-12 top-5 grid h-10 w-10 place-items-center rounded-full border-2 md:-left-16 ${
                        done ? "border-accent bg-accent text-accent-foreground" : locked ? "border-border bg-muted text-muted-foreground" : "border-accent bg-card text-accent"
                      }`}>
                        {done ? <CheckCircle2 className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <span className="text-2xl">{m.emoji}</span>}
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{m.title}</h3>
                            {done && <Badge className="bg-success text-success-foreground">Done</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{m.summary}</p>
                          <div className="mt-2 text-xs text-muted-foreground">{m.lessons.length} lessons · {m.minutes} min · +50 XP</div>
                        </div>
                        <Button disabled={locked} variant={done ? "outline" : "hero"} onClick={() => open(m.id)}>
                          {done ? "Review" : locked ? "Locked" : "Start"}
                        </Button>
                      </div>
                    </Card>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-emerald p-5 text-accent-foreground">
              <div className="text-xs uppercase tracking-wider opacity-80">Progress</div>
              <div className="mt-1 font-display text-3xl font-bold">{doneCount}/{MODULES.length}</div>
              <Progress value={pct} className="mt-3 bg-white/20" />
            </div>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-warning"><Flame className="h-4 w-4" /><span className="text-lg font-bold">{p.streak}</span></div>
                <div className="text-xs text-muted-foreground">day streak</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-lg font-bold text-accent">{p.xp}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-bold"><Award className="h-4 w-4 text-gold" /> Badges</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["First Steps", "Foundations", "Quiz Whiz", "Risk Reader", "Graduate", "Trader"].map((b) => {
                const earned = p.badges.includes(b);
                return (
                  <div key={b} className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${earned ? "border-gold/40 bg-gold/10" : "border-border opacity-40"}`}>
                    <div className={`text-2xl ${earned ? "" : "grayscale"}`}>{earned ? "🏅" : "🔒"}</div>
                    <div className="text-[10px] leading-tight">{b}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold">Next up</h3>
            <p className="mt-1 text-sm text-muted-foreground">Test what you learned and grow your Readiness Score.</p>
            <Button asChild variant="outline" className="mt-3 w-full"><Link to="/quiz">Take the quiz</Link></Button>
          </Card>
        </aside>
      </div>

      <Dialog open={!!mod} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-2xl">
          {mod && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mod.emoji}</span>
                  <div>
                    <DialogTitle className="text-xl">{mod.title}</DialogTitle>
                    <div className="text-xs text-muted-foreground">Lesson {lessonIdx + 1} of {mod.lessons.length}</div>
                  </div>
                </div>
                <Progress value={((lessonIdx + 1) / mod.lessons.length) * 100} className="mt-3" />
              </DialogHeader>
              <motion.div key={lessonIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <LessonVisual kind={mod.lessons[lessonIdx].visual} />
                <h3 className="mt-4 text-lg font-bold">{mod.lessons[lessonIdx].title}</h3>
                <p className="mt-2 text-muted-foreground">{mod.lessons[lessonIdx].body}</p>
              </motion.div>
              <div className="mt-4 flex justify-between gap-2">
                <Button variant="ghost" onClick={() => setLessonIdx(Math.max(0, lessonIdx - 1))} disabled={lessonIdx === 0}>Back</Button>
                <Button variant="hero" onClick={advance}>
                  {lessonIdx < mod.lessons.length - 1 ? "Next lesson" : "Complete module · +50 XP"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
