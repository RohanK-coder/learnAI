import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const mockCourses = [
  { id: 1, title: "Python Fundamentals", instructor: "Dr. Smith", xp: 1740, rank: 3, total: 28, progress: 61, color: "#534AB7" },
  { id: 2, title: "Data Structures", instructor: "Dr. Patel", xp: 920, rank: 7, total: 34, progress: 38, color: "#1D9E75" },
  { id: 3, title: "Web Development", instructor: "Dr. Lee", xp: 340, rank: 12, total: 22, progress: 18, color: "#D85A30" },
];

const mockLeaderboard = [
  { rank: 1, name: "Sarah K.",  xp: 2840, initials: "SK", color: "#FAC775", isYou: false },
  { rank: 2, name: "James M.",  xp: 2210, initials: "JM", color: "#7F77DD", isYou: false },
  { rank: 3, name: "Raju",      xp: 1740, initials: "RK", color: "#1D9E75", isYou: true  },
  { rank: 4, name: "Alex R.",   xp: 1240, initials: "AR", color: "#888780", isYou: false },
  { rank: 5, name: "Priya S.",  xp: 980,  initials: "PS", color: "#888780", isYou: false },
];

const recentActivity = [
  { text: "Completed Module 3 — Python Fundamentals", time: "2h ago",  xp: "+120 xp", color: "#534AB7" },
  { text: "Ranked up to #3 in Python Fundamentals",  time: "2h ago",  xp: "↑ rank",  color: "#1D9E75" },
  { text: "Asked AI: 'What are list comprehensions?'", time: "5h ago", xp: "+20 xp",  color: "#D85A30" },
  { text: "Completed Quiz — Data Structures",        time: "1d ago",  xp: "+80 xp",  color: "#1D9E75" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState(mockCourses);
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard">("overview");

  useEffect(() => {
    api.get("/courses/my")
      .then(res => { if (res.data?.length) setMyCourses(res.data); })
      .catch(() => {});
  }, []);

  const totalXp   = myCourses.reduce((s, c) => s + (c.xp || 0), 0);
  const bestRank  = Math.min(...myCourses.map(c => c.rank || 99));
  const firstName = (user as any)?.name?.split(" ")[0] || "there";

  const s = {
    card: {
      background: "#fff", border: "0.5px solid #E8E6DF",
      borderRadius: 12, padding: "20px 22px"
    } as React.CSSProperties,
    metricCard: {
      background: "#F1EFE8", borderRadius: 8, padding: "14px 16px"
    } as React.CSSProperties,
    pill: (color: string) => ({
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 10, background: color + "22",
      color: color, display: "inline-block"
    } as React.CSSProperties),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* ── Header greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>
          Good morning, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "#888780" }}>
          You're ranked <strong style={{ color: "#534AB7" }}>#{bestRank}</strong> overall.
          Keep going — you're {mockLeaderboard[1].xp - totalXp} XP behind #{bestRank - 1}.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total XP",     value: totalXp.toLocaleString(),  sub: "across all courses" },
          { label: "Courses",      value: myCourses.length,          sub: "enrolled" },
          { label: "Best rank",    value: `#${bestRank}`,            sub: "Python Fundamentals" },
          { label: "AI queries",   value: "12",                      sub: "this week" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={s.metricCard}>
            <div style={{ fontSize: 12, color: "#888780", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 11, color: "#B4B2A9" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* My courses */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>My courses</div>
              <button onClick={() => navigate("/courses")} style={{
                fontSize: 12, color: "#534AB7", background: "none",
                border: "0.5px solid #534AB7", borderRadius: 6,
                padding: "4px 10px", cursor: "pointer"
              }}>Browse all</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myCourses.map(course => (
                <div key={course.id} onClick={() => navigate(`/courses/${course.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                    border: "0.5px solid #E8E6DF", background: "#FAFAF8",
                    transition: "border-color .15s"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = course.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#E8E6DF")}
                >
                  {/* Color dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: course.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={course.color} strokeWidth="2" strokeLinecap="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>

                  {/* Course info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#888780", marginBottom: 6 }}>
                      {course.instructor}
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "#E8E6DF" }}>
                      <div style={{
                        height: 4, borderRadius: 2,
                        width: `${course.progress}%`,
                        background: course.color,
                        transition: "width .4s"
                      }} />
                    </div>
                  </div>

                  {/* XP + rank */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                      {course.xp.toLocaleString()} xp
                    </div>
                    <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>
                      Rank #{course.rank} of {course.total}
                    </div>
                  </div>

                  {/* AI button */}
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/messages`); }}
                    style={{
                      flexShrink: 0, padding: "6px 12px", fontSize: 12,
                      fontWeight: 500, background: "#534AB7", color: "#fff",
                      border: "none", borderRadius: 6, cursor: "pointer"
                    }}>
                    Ask AI
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: 14 }}>
              Recent activity
            </div>
            {recentActivity.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                paddingBottom: 12, marginBottom: 12,
                borderBottom: i < recentActivity.length - 1 ? "0.5px solid #F1EFE8" : "none"
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: a.color, flexShrink: 0
                }} />
                <div style={{ flex: 1, fontSize: 13, color: "#3d3d3a" }}>{a.text}</div>
                <div style={{ fontSize: 11, color: "#B4B2A9", flexShrink: 0 }}>{a.time}</div>
                <div style={s.pill(a.color)}>{a.xp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — leaderboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s.card}>
            {/* Tab toggle */}
            <div style={{
              display: "flex", border: "0.5px solid #E8E6DF",
              borderRadius: 8, overflow: "hidden", marginBottom: 16
            }}>
              {(["overview", "leaderboard"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 500,
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: activeTab === t ? "#534AB7" : "transparent",
                  color: activeTab === t ? "#fff" : "#888780",
                  transition: "all .15s", textTransform: "capitalize"
                }}>{t}</button>
              ))}
            </div>

            {activeTab === "leaderboard" ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>
                  Python Fundamentals
                </div>
                {mockLeaderboard.map((s, i) => (
                  <div key={s.rank} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: s.isYou ? "8px 10px" : "6px 0",
                    background: s.isYou ? "#EEEDFE" : "transparent",
                    borderRadius: s.isYou ? 8 : 0,
                    margin: s.isYou ? "4px -4px" : 0,
                    borderBottom: !s.isYou && i < mockLeaderboard.length - 1
                      ? "0.5px solid #F1EFE8" : "none"
                  }}>
                    <div style={{
                      fontSize: 12, fontWeight: 500, width: 18, textAlign: "center",
                      color: s.rank === 1 ? "#BA7517" : s.rank === 2 ? "#5F5E5A" : s.isYou ? "#534AB7" : "#B4B2A9"
                    }}>{s.rank}</div>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: s.color, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 11, fontWeight: 500,
                      color: "#fff", flexShrink: 0
                    }}>{s.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: s.isYou ? 500 : 400,
                        color: s.isYou ? "#534AB7" : "#3d3d3a"
                      }}>{s.name}{s.isYou ? " (you)" : ""}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 500,
                      color: s.isYou ? "#534AB7" : "#888780"
                    }}>{s.xp.toLocaleString()}</div>
                  </div>
                ))}

                <div style={{
                  marginTop: 14, padding: "10px 12px", background: "#F1EFE8",
                  borderRadius: 8, fontSize: 12, color: "#5F5E5A", lineHeight: 1.5
                }}>
                  You're <strong style={{ color: "#534AB7" }}>470 XP</strong> behind #2.
                  Complete Module 4 to close the gap.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 12 }}>
                  Your stats
                </div>
                {[
                  { label: "Global rank",    value: `#${bestRank}`,                  color: "#534AB7" },
                  { label: "Total XP",       value: totalXp.toLocaleString(),        color: "#1D9E75" },
                  { label: "Courses",        value: `${myCourses.length} enrolled`,  color: "#D85A30" },
                  { label: "AI queries",     value: "12 this week",                  color: "#534AB7" },
                  { label: "Shared w/ prof", value: "3 conversations",              color: "#1D9E75" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 0",
                    borderBottom: "0.5px solid #F1EFE8"
                  }}>
                    <span style={{ fontSize: 13, color: "#888780" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Ask AI card */}
          <div style={{
            ...s.card,
            background: "#534AB7", border: "none", cursor: "pointer"
          }} onClick={() => navigate("/ai")}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Ask the AI agent</div>
            </div>
            <div style={{ fontSize: 13, color: "#AFA9EC", lineHeight: 1.5, marginBottom: 12 }}>
              Get instant explanations for any concept in your courses. Optionally share with your professor.
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", background: "rgba(255,255,255,0.1)",
              borderRadius: 8, fontSize: 13, color: "#fff"
            }}>
              <span>Start a conversation</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}