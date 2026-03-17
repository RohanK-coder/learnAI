import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const COURSE_COLORS = [
  "#534AB7", "#1D9E75", "#D85A30", "#185FA5",
  "#854F0B", "#993556", "#3B6D11", "#A32D2D",
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner:     { bg: "#EAF3DE", text: "#27500A", dot: "#639922" },
  Intermediate: { bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
  Advanced:     { bg: "#FAECE7", text: "#712B13", dot: "#D85A30" },
};

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/my")
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 14, color: "#888780" }}>Loading your courses...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>
          My courses
        </h1>
        <p style={{ fontSize: 14, color: "#888780", margin: 0 }}>
          {courses.length > 0
            ? `You're enrolled in ${courses.length} course${courses.length !== 1 ? "s" : ""}`
            : "You haven't enrolled in any courses yet"}
        </p>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#5F5E5A", marginBottom: 8 }}>
            No courses yet
          </div>
          <div style={{ fontSize: 13, color: "#888780", marginBottom: 20 }}>
            Browse available courses and enroll to start learning
          </div>
          <button
            onClick={() => navigate("/courses")}
            style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 500,
              background: "#534AB7", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "inherit"
            }}>
            Browse courses →
          </button>
        </div>
      )}

      {/* Course grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16
      }}>
        {courses.map((course, i) => {
          const color = COURSE_COLORS[i % COURSE_COLORS.length];
          const diff  = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner;
          const pct   = course.progress_pct ?? Math.round(((course.slides_viewed || 0) / Math.max(course.slide_count || 10, 1)) * 100);

          return (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              style={{
                background: "#fff", border: "0.5px solid #E8E6DF",
                borderRadius: 12, overflow: "hidden",
                cursor: "pointer", transition: "border-color .15s, transform .15s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E8E6DF";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Color bar */}
              <div style={{ height: 4, background: color }} />

              <div style={{ padding: "18px 20px" }}>
                {/* Title + badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", margin: 0, flex: 1, paddingRight: 8 }}>
                    {course.title}
                  </h3>
                  {course.difficulty && (
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "3px 8px",
                      borderRadius: 10, background: diff.bg, color: diff.text,
                      flexShrink: 0, display: "flex", alignItems: "center", gap: 4
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: diff.dot, display: "inline-block" }} />
                      {course.difficulty}
                    </span>
                  )}
                </div>

                {/* Description */}
                {course.description && (
                  <p style={{
                    fontSize: 13, color: "#5F5E5A", lineHeight: 1.5,
                    marginBottom: 14, marginTop: 0,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden"
                  } as React.CSSProperties}>
                    {course.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#888780" }}>Progress</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#F1EFE8" }}>
                    <div style={{
                      height: 5, borderRadius: 3, background: color,
                      width: `${pct}%`, transition: "width .5s"
                    }} />
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {course.professor_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888780" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {course.professor_name}
                      </div>
                    )}
                    {course.rank && (
                      <span style={{
                        fontSize: 12, fontWeight: 500,
                        background: "#EEEDFE", color: "#3C3489",
                        padding: "2px 8px", borderRadius: 10
                      }}>Rank #{course.rank}</span>
                    )}
                  </div>

                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: color, background: color + "18",
                    padding: "3px 8px", borderRadius: 6
                  }}>
                    {course.xp || 0} XP
                  </span>
                </div>

                {/* Continue button */}
                <button style={{
                  width: "100%", marginTop: 14, padding: "9px 0",
                  fontSize: 13, fontWeight: 500,
                  background: pct === 100 ? "#EAF3DE" : color,
                  color: pct === 100 ? "#27500A" : "#fff",
                  border: "none", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                  {pct === 100 ? "✓ Completed" : pct > 0 ? "Continue →" : "Start learning →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}