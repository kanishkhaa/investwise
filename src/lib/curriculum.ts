export type Lesson = { title: string; body: string; visual?: "growth" | "risk" | "diversify" | "compound" };

export type Module = {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  minutes: number;
  lessons: Lesson[];
};

export const MODULES: Module[] = [
  {
    id: "basics",
    title: "Money Basics",
    emoji: "💰",
    summary: "What money does for you when it isn't sleeping under the mattress.",
    minutes: 6,
    lessons: [
      { title: "Inflation eats cash", body: "₹100 today buys less in 5 years. Investing aims to outpace this slow leak.", visual: "growth" },
      { title: "Saving vs Investing", body: "Saving keeps value; investing grows value. Both matter — keep 3–6 months saved before investing.", visual: "diversify" },
      { title: "The rule of 72", body: "Divide 72 by the annual return to see how many years your money takes to double.", visual: "compound" },
    ],
  },
  {
    id: "compound",
    title: "Power of Compounding",
    emoji: "📈",
    summary: "Why starting early beats investing more later.",
    minutes: 5,
    lessons: [
      { title: "Interest on interest", body: "Each year your gains earn gains. Small numbers snowball over decades.", visual: "compound" },
      { title: "Time is the multiplier", body: "₹5K/month for 30 years can dwarf ₹15K/month for 10 years.", visual: "growth" },
    ],
  },
  {
    id: "risk",
    title: "Understanding Risk",
    emoji: "🛡️",
    summary: "Risk isn't bad — unmanaged risk is.",
    minutes: 7,
    lessons: [
      { title: "Volatility vs Loss", body: "Prices bounce daily; permanent loss happens only when you sell low.", visual: "risk" },
      { title: "Your risk capacity", body: "Risk you can take depends on time, income stability, and goals — not just feelings.", visual: "risk" },
    ],
  },
  {
    id: "products",
    title: "Investment Products",
    emoji: "🧰",
    summary: "FDs, mutual funds, index funds, stocks — when to use what.",
    minutes: 8,
    lessons: [
      { title: "Fixed Deposits", body: "Predictable, low return. Good for short-term goals and emergency buffer.", visual: "diversify" },
      { title: "Index Funds", body: "Own the whole market cheaply. Best default for long-term wealth.", visual: "growth" },
      { title: "Stocks", body: "Higher potential, higher swings. Require research and patience.", visual: "risk" },
    ],
  },
  {
    id: "diversify",
    title: "Diversification",
    emoji: "🧩",
    summary: "Don't put all eggs in one basket — literally.",
    minutes: 5,
    lessons: [
      { title: "Spread the bets", body: "Mixing assets smooths the ride without crushing returns.", visual: "diversify" },
      { title: "Rebalancing", body: "Once a year, trim winners and top up laggards back to target weights.", visual: "diversify" },
    ],
  },
];

export const QUIZ: { q: string; options: string[]; answer: number; explain: string }[] = [
  { q: "What does inflation do to idle cash?", options: ["Grows it", "Shrinks its purchasing power", "Nothing", "Doubles it"], answer: 1, explain: "Inflation slowly reduces what ₹1 can buy." },
  { q: "Which gives the most predictable return?", options: ["Stocks", "Index funds", "Fixed deposits", "Crypto"], answer: 2, explain: "FDs pay a fixed rate set in advance." },
  { q: "Compounding rewards…", options: ["Big bets", "Time in the market", "Timing the market", "Frequent trading"], answer: 1, explain: "Snowballs need slopes — i.e. time." },
  { q: "Volatility means…", options: ["Permanent loss", "Daily price movement", "Bad management", "High fees"], answer: 1, explain: "Volatility is movement, not loss." },
  { q: "A diversified portfolio…", options: ["Only stocks", "Mix of asset types", "Single FD", "Just gold"], answer: 1, explain: "Mix asset classes to smooth ride." },
  { q: "Best default for long-term wealth building?", options: ["Day trading", "Index funds", "Lottery", "Cash"], answer: 1, explain: "Low cost, broad market, long horizon." },
];
