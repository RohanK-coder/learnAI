import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DEMO_COURSES: Record<string, { title: string; color: string; slides: { title: string; content: string }[] }> = {
  "1": {
    title: "Intro to SQL",
    color: "#534AB7",
    slides: [
      {
        title: "What is SQL?",
        content: "SQL (Structured Query Language) is a standard language for storing, manipulating, and retrieving data in databases. It was first developed at IBM in the 1970s and remains one of the most widely used languages in data engineering and analytics today.\n\nAlmost every company — from startups to Fortune 500s — uses SQL to manage their data. Learning SQL is one of the highest-ROI skills you can add to your resume."
      },
      {
        title: "SELECT statements",
        content: "The SELECT statement is the most fundamental SQL command. It retrieves data from one or more tables.\n\nBasic syntax:\nSELECT column1, column2 FROM table_name;\n\nTo retrieve all columns:\nSELECT * FROM users;\n\nTo filter results:\nSELECT name, email FROM users WHERE age > 18;\n\nTip: Always specify column names instead of using * in production — it's faster and more readable."
      },
      {
        title: "WHERE & filtering",
        content: "The WHERE clause filters rows based on conditions. You can combine conditions using AND, OR, and NOT.\n\nExamples:\nSELECT * FROM orders WHERE status = 'shipped';\nSELECT * FROM products WHERE price > 100 AND category = 'electronics';\nSELECT * FROM users WHERE NOT country = 'US';\n\nCommon operators: =, !=, >, <, >=, <=, BETWEEN, LIKE, IN\n\nSELECT * FROM products WHERE price BETWEEN 10 AND 50;"
      },
      {
        title: "JOIN operations",
        content: "JOINs combine rows from two or more tables based on a related column.\n\nINNER JOIN — returns rows that have matching values in both tables:\nSELECT users.name, orders.total\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;\n\nLEFT JOIN — returns all rows from the left table, and matched rows from the right:\nSELECT users.name, orders.total\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n\nThink of INNER JOIN as intersection, LEFT JOIN as keeping everything from the left side."
      },
      {
        title: "GROUP BY & aggregates",
        content: "Aggregate functions perform calculations on sets of rows and return a single value.\n\nCOUNT — number of rows\nSUM — total of a column\nAVG — average value\nMAX / MIN — highest or lowest value\n\nExample:\nSELECT department, COUNT(*) as headcount, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY avg_salary DESC;\n\nHAVING is like WHERE but for aggregated results."
      },
    ]
  },
  "2": {
    title: "React Basics",
    color: "#1D9E75",
    slides: [
      { title: "What is React?", content: "React is a JavaScript library for building user interfaces, developed by Meta (Facebook). It uses a component-based architecture where UIs are broken into small, reusable pieces called components.\n\nReact introduced the virtual DOM — a lightweight copy of the real DOM. When state changes, React computes the difference (diffing) and updates only what changed. This makes React fast even for complex UIs." },
      { title: "Components & JSX", content: "A React component is a JavaScript function that returns JSX — a syntax extension that looks like HTML but is actually JavaScript.\n\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nComponents must start with a capital letter. JSX expressions go inside curly braces {}. Every component must return a single root element — wrap multiple elements in a <> fragment." },
      { title: "useState hook", content: "useState lets you add state to functional components. State is data that changes over time and triggers a re-render when updated.\n\nconst [count, setCount] = useState(0);\n\nThe first value is the current state. The second is the setter function. Never mutate state directly — always use the setter.\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}" },
      { title: "useEffect hook", content: "useEffect runs side effects after rendering — data fetching, subscriptions, DOM mutations.\n\nuseEffect(() => {\n  fetchData();\n}, [dependency]);\n\nThe dependency array controls when the effect runs:\n[] — runs once on mount\n[value] — runs when value changes\nno array — runs after every render\n\nAlways clean up subscriptions to prevent memory leaks:\nuseEffect(() => {\n  const sub = subscribe();\n  return () => sub.unsubscribe();\n}, []);" },
      { title: "Props & data flow", content: "Props are how components communicate. Data flows one way — from parent to child. This makes apps predictable and easy to debug.\n\nfunction Card({ title, description, color }) {\n  return (\n    <div style={{ borderTop: `3px solid ${color}` }}>\n      <h2>{title}</h2>\n      <p>{description}</p>\n    </div>\n  );\n}\n\n// Parent usage:\n<Card title='SQL' description='Learn databases' color='#534AB7' />\n\nTo pass data upward, pass callback functions as props." },
    ]
  },
};

const DEMO_LEADERBOARD = [
  { id: 1, name: "Koushik", xp: 10 },
  { id: 2, name: "Praneeth", xp: 10 },
  { id: 3, name: "Raj", xp: 10 },
  { id: 4, name: "Raju", xp: 0 },
];

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const course = DEMO_COURSES[courseId || "1"] || DEMO_COURSES["1"];
  const slides = course.slides;

  const [index, setIndex]   = useState(0);
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [xpPop, setXpPop]   = useState(false);
  const [leaderboard, setLeaderboard] = useState(DEMO_LEADERBOARD);

  const userName  = (user as any)?.name || "Raju";
  const current   = slides[index];
  const progress  = Math.round(((index + 1) / slides.length) * 100);
  const myEntry   = leaderboard.find(r => r.name === userName);
  const myRank    = leaderboard.findIndex(r => r.name === userName) + 1;

  function handleNext() {
    if (!viewed.has(index)) {
      setViewed(prev => new Set([...prev, index]));
      setXpPop(true);
      setTimeout(() => setXpPop(false), 1200);
      // Update leaderboard XP for demo
      setLeaderboard(prev =>
        [...prev.map(r => r.name === userName ? { ...r, xp: r.xp + 10 } : r)]
          .sort((a, b) => b.xp - a.xp)
      );
    }
    if (index < slides.length - 1) setIndex(v => v + 1);
  }

  const s = {
    card: {
      background: "#fff", border: "0.5px solid #E8E6DF", borderRadius: 12, overflow: "hidden"
    } as React.CSSProperties,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* XP pop */}
      {xpPop && (
        <div style={{
          position: "fixed", top: "35%", left: "42%", zIndex: 999,
          fontSize: 26, fontWeight: 700, color: "#534AB7",
          animation: "fadeUp .9s ease forwards", pointerEvents: "none"
        }}>+10 XP ✨</div>
      )}
      <style>{`
        @keyframes fadeUp {
          0%   { opacity:1; transform:translateY(0); }
          100% { opacity:0; transform:translateY(-50px); }
        }
      `}</style>

      {/* Progress bar */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#888780" }}>
              Slide {index + 1} of {slides.length}
            </span>
            {myRank > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 500,
                background: "#EEEDFE", color: "#3C3489",
                padding: "2px 8px", borderRadius: 10
              }}>Rank #{myRank}</span>
            )}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: course.color }}>{progress}% complete</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#F1EFE8" }}>
          <div style={{
            height: 4, borderRadius: 2, background: course.color,
            width: `${progress}%`, transition: "width .5s ease"
          }} />
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setIndex(i)} style={{
            width: 28, height: 28, borderRadius: 6, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 500, transition: "all .15s",
            background: i === index ? course.color
              : viewed.has(i) ? "#EAF3DE" : "#F1EFE8",
            color: i === index ? "#fff"
              : viewed.has(i) ? "#27500A" : "#888780",
            border: i === index ? "none" : "0.5px solid #E8E6DF"
          }}>{i + 1}</div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18, alignItems: "start" }}>

        {/* Slide card */}
        <div style={s.card}>
          <div style={{ borderBottom: "0.5px solid #F1EFE8", padding: "16px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>
              {course.title} — Slide {index + 1}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#1a1a1a", margin: 0 }}>
              {current.title}
            </h2>
          </div>

          {/* Content */}
          <div style={{ padding: "24px", minHeight: 280 }}>
            {current.content.split("\n").map((line, i) =>
              line.trim() === "" ? (
                <div key={i} style={{ height: 12 }} />
              ) : line.startsWith("SELECT") || line.startsWith("FROM") || line.startsWith("WHERE") ||
                  line.startsWith("function") || line.startsWith("const") || line.startsWith("return") ||
                  line.startsWith("  ") ? (
                <pre key={i} style={{
                  fontFamily: "monospace", fontSize: 13, background: "#F8F7FF",
                  color: "#3C3489", padding: "2px 8px", borderRadius: 4,
                  margin: "2px 0", whiteSpace: "pre-wrap"
                }}>{line}</pre>
              ) : (
                <p key={i} style={{ fontSize: 14, color: "#3d3d3a", lineHeight: 1.7, margin: "2px 0" }}>
                  {line}
                </p>
              )
            )}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "0.5px solid #F1EFE8", padding: "12px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={index === 0}
                onClick={() => setIndex(v => v - 1)}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 500,
                  border: "0.5px solid #D3D1C7", borderRadius: 8,
                  cursor: index === 0 ? "not-allowed" : "pointer",
                  background: "transparent",
                  color: index === 0 ? "#B4B2A9" : "#5F5E5A",
                  fontFamily: "inherit"
                }}>← Prev</button>

              <button
                onClick={handleNext}
                style={{
                  padding: "8px 20px", fontSize: 13, fontWeight: 500,
                  border: "none", borderRadius: 8, cursor: "pointer",
                  background: index === slides.length - 1 ? "#1D9E75" : course.color,
                  color: "#fff", fontFamily: "inherit"
                }}>
                {index === slides.length - 1 ? "Complete ✓"
                  : viewed.has(index) ? "Next →" : "Next (+10 XP) →"}
              </button>
            </div>

            <button
              onClick={() => navigate(`/courses/${courseId}/ai`, {
                state: { slideTitle: current.title, slideContent: current.content }
              })}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", fontSize: 13, fontWeight: 500,
                background: "#EEEDFE", color: "#3C3489",
                border: "0.5px solid #AFA9EC", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit"
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Ask AI
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={s.card}>
          <div style={{
            borderBottom: "0.5px solid #F1EFE8", padding: "14px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>Leaderboard</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" }} />
              <span style={{ fontSize: 11, color: "#888780" }}>Live</span>
            </div>
          </div>

          <div style={{ padding: "8px 0" }}>
            {leaderboard.map((row, i) => {
              const isMe = row.name === userName;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={row.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: isMe ? "9px 18px" : "7px 18px",
                  background: isMe ? "#EEEDFE" : "transparent",
                  borderLeft: isMe ? "3px solid #534AB7" : "3px solid transparent",
                }}>
                  <div style={{ width: 20, textAlign: "center", fontSize: 13, flexShrink: 0 }}>
                    {i < 3 ? medals[i] : <span style={{ fontSize: 12, color: "#B4B2A9" }}>{i + 1}</span>}
                  </div>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: isMe ? "#534AB7" : "#F1EFE8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 500, color: isMe ? "#fff" : "#888780"
                  }}>
                    {row.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: isMe ? 500 : 400, color: isMe ? "#3C3489" : "#3d3d3a" }}>
                    {row.name}{isMe ? " (you)" : ""}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: isMe ? "#534AB7" : "#888780" }}>
                    {row.xp} XP
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gap strip */}
          {myEntry && leaderboard[0]?.name !== userName && (
            <div style={{
              borderTop: "0.5px solid #F1EFE8",
              padding: "10px 18px", background: "#FAFAF8"
            }}>
              <div style={{ height: 3, borderRadius: 2, background: "#F1EFE8", marginBottom: 6 }}>
                <div style={{
                  height: 3, borderRadius: 2, background: course.color,
                  width: `${Math.min((myEntry.xp / Math.max(leaderboard[0]?.xp, 1)) * 100, 100)}%`,
                  transition: "width .5s"
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#5F5E5A" }}>
                {leaderboard[0].xp - myEntry.xp > 0
                  ? `${leaderboard[0].xp - myEntry.xp} XP behind #1`
                  : "You're leading! 🏆"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}