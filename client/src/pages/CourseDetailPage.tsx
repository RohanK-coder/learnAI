import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

const COURSE_COLORS: Record<string, string> = {
  "1": "#534AB7", "2": "#1D9E75", "3": "#D85A30",
  "4": "#185FA5", "5": "#854F0B", "6": "#993556",
  "7": "#3B6D11", "8": "#A32D2D",
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [slides, setSlides]           = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [index, setIndex]             = useState(0);
  const [viewed, setViewed]           = useState<Set<number>>(new Set());
  const [xpPop, setXpPop]             = useState(false);
  const [loading, setLoading]         = useState(true);

  const color    = COURSE_COLORS[courseId || "1"] || "#534AB7";
  const userName = (user as any)?.name || "";

  useEffect(() => {
    if (!courseId) return;

    Promise.all([
      api.get(`/courses/${courseId}/slides`),
      api.get(`/courses/${courseId}/leaderboard`),
      api.get(`/courses/${courseId}`).catch(() => ({ data: null })),
    ]).then(([slidesRes, lbRes, courseRes]) => {
      setSlides(slidesRes.data || []);
      setLeaderboard(lbRes.data || []);
      if (courseRes.data?.title) setCourseTitle(courseRes.data.title);
    }).finally(() => setLoading(false));

    socket.emit("join-course", Number(courseId));
    const onLeaderboard = (data: any[]) => setLeaderboard(data);
    socket.on("leaderboard:update", onLeaderboard);
    return () => { socket.off("leaderboard:update", onLeaderboard); };
  }, [courseId]);

  async function handleNext() {
    const current = slides[index];
    if (!current) return;

    if (!viewed.has(current.id)) {
      await api.post(`/courses/${courseId}/slides/${current.id}/view`).catch(() => {});
      setViewed(prev => new Set([...prev, current.id]));
      setXpPop(true);
      setTimeout(() => setXpPop(false), 1200);
    }
    if (index < slides.length - 1) setIndex(v => v + 1);
  }

  const current  = slides[index];
  const progress = slides.length > 0 ? Math.round(((index + 1) / slides.length) * 100) : 0;
  const myEntry  = leaderboard.find(r => r.name === userName);
  const myRank   = leaderboard.findIndex(r => r.name === userName) + 1;

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 14, color: "#888780" }}>Loading course...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", fontFamily: "Inter, sans-serif" }}>

      {/* XP pop */}
      {xpPop && (
        <div style={{
          position: "fixed", top: "35%", left: "42%", zIndex: 999,
          fontSize: 26, fontWeight: 700, color,
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
          <span style={{ fontSize: 13, fontWeight: 500, color }}>{progress}% complete</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#F1EFE8" }}>
          <div style={{
            height: 4, borderRadius: 2, background: color,
            width: `${progress}%`, transition: "width .5s ease"
          }} />
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" }}>
        {slides.map((slide, i) => (
          <div key={slide.id} onClick={() => setIndex(i)} style={{
            width: 28, height: 28, borderRadius: 6, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 500, transition: "all .15s",
            background: i === index ? color : viewed.has(slide.id) ? "#EAF3DE" : "#F1EFE8",
            color: i === index ? "#fff" : viewed.has(slide.id) ? "#27500A" : "#888780",
            border: i === index ? "none" : "0.5px solid #E8E6DF"
          }}>{i + 1}</div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18, alignItems: "start" }}>

        {/* Slide card */}
        <div style={{ background: "#fff", border: "0.5px solid #E8E6DF", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ borderBottom: "0.5px solid #F1EFE8", padding: "16px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>
              {courseTitle || `Course ${courseId}`} — Slide {index + 1}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#1a1a1a", margin: 0 }}>
              {current?.title || "Loading..."}
            </h2>
          </div>

          <div style={{ padding: "24px", minHeight: 280 }}>
            {current?.content
              ? current.content.split("\n").map((line: string, i: number) =>
                  line.trim() === "" ? (
                    <div key={i} style={{ height: 12 }} />
                  ) : line.startsWith("SELECT") || line.startsWith("FROM") ||
                      line.startsWith("WHERE") || line.startsWith("function") ||
                      line.startsWith("const") || line.startsWith("return") ||
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
                )
              : <p style={{ fontSize: 14, color: "#888780" }}>Loading content...</p>
            }
          </div>

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
                  background: index === slides.length - 1 ? "#1D9E75" : color,
                  color: "#fff", fontFamily: "inherit"
                }}>
                {index === slides.length - 1 ? "Complete ✓"
                  : current && viewed.has(current.id) ? "Next →" : "Next (+10 XP) →"}
              </button>
            </div>

            <button
              onClick={() =>
  navigate("/messages", {
    state: {
      courseId: Number(courseId),
      slideTitle: current?.title,
      slideContent: current?.content,
      prefill: `I need help with "${current?.title}".\n\n${current?.content || ""}`,
    },
  })
}
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
        <div style={{ background: "#fff", border: "0.5px solid #E8E6DF", borderRadius: 12, overflow: "hidden" }}>
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
            {leaderboard.length === 0 ? (
              <div style={{ padding: "20px 18px", fontSize: 13, color: "#888780", textAlign: "center" }}>
                No rankings yet — be the first!
              </div>
            ) : leaderboard.map((row, i) => {
              const isMe   = row.name === userName;
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
                    {row.name?.charAt(0).toUpperCase()}
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

          {myEntry && leaderboard[0]?.name !== userName && (
            <div style={{ borderTop: "0.5px solid #F1EFE8", padding: "10px 18px", background: "#FAFAF8" }}>
              <div style={{ height: 3, borderRadius: 2, background: "#F1EFE8", marginBottom: 6 }}>
                <div style={{
                  height: 3, borderRadius: 2, background: color,
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