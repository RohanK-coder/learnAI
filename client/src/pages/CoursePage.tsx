import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createCourse, enrollInCourse, getCourses } from "@/services/courses.service";
import { useNavigate } from "react-router-dom";

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner:     { bg: "#EAF3DE", text: "#27500A", dot: "#639922" },
  Intermediate: { bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
  Advanced:     { bg: "#FAECE7", text: "#712B13", dot: "#D85A30" },
};

const COURSE_COLORS = [
  "#534AB7", "#1D9E75", "#D85A30", "#185FA5",
  "#854F0B", "#993556", "#3B6D11", "#A32D2D",
];

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses]     = useState<any[]>([]);
  const [enrolled, setEnrolled]   = useState<Set<number>>(new Set());
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All");
  const [toast, setToast]         = useState("");
  const [showForm, setShowForm]   = useState(false);

  // Professor form state
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [creating, setCreating]     = useState(false);

  async function loadCourses() {
    const data = await getCourses();
    setCourses(data);
  }

  useEffect(() => { loadCourses(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleEnroll(courseId: number) {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      setEnrolled(prev => new Set([...prev, courseId]));
      showToast("Enrolled! Head to My Courses to start learning.");
    } catch {
      showToast("Enrollment failed — try again.");
    } finally {
      setEnrolling(null);
    }
  }

  async function handleCreateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      await createCourse({ title, description, difficulty });
      setTitle(""); setDescription(""); setDifficulty("Beginner");
      setShowForm(false);
      await loadCourses();
      showToast("Course created successfully!");
    } catch {
      showToast("Failed to create course.");
    } finally {
      setCreating(false);
    }
  }

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.difficulty === filter;
    return matchSearch && matchFilter;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: 14,
    border: "0.5px solid #D3D1C7", borderRadius: 8,
    outline: "none", fontFamily: "inherit",
    background: "#fff", color: "#1a1a1a"
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.includes("failed") || toast.includes("Failed") ? "#FCEBEB" : "#EAF3DE",
          color: toast.includes("failed") || toast.includes("Failed") ? "#A32D2D" : "#27500A",
          border: `0.5px solid ${toast.includes("failed") || toast.includes("Failed") ? "#F09595" : "#97C459"}`,
          borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>
            {user?.role === "professor" ? "Manage courses" : "Browse courses"}
          </h1>
          <p style={{ fontSize: 14, color: "#888780", margin: 0 }}>
            {user?.role === "professor"
              ? "Create and manage your courses. Students can enroll and compete on leaderboards."
              : "Enroll in a course to join its leaderboard and unlock the AI learning agent."}
          </p>
        </div>

        {/* Professor — create course button */}
        {user?.role === "professor" && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              padding: "9px 18px", fontSize: 13, fontWeight: 500,
              background: showForm ? "#F1EFE8" : "#534AB7",
              color: showForm ? "#5F5E5A" : "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "inherit", flexShrink: 0
            }}>
            {showForm ? "Cancel" : "+ Create course"}
          </button>
        )}
      </div>

      {/* Professor create form */}
      {user?.role === "professor" && showForm && (
        <div style={{
          background: "#fff", border: "0.5px solid #E8E6DF",
          borderRadius: 12, padding: "22px 24px", marginBottom: 24
        }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: 18 }}>
            New course
          </div>
          <form onSubmit={handleCreateCourse}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 5 }}>
                  Course title
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Intro to SQL"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#534AB7"}
                  onBlur={e => e.target.style.borderColor = "#D3D1C7"}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 5 }}>
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#5F5E5A", display: "block", marginBottom: 5 }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What will students learn in this course?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as const }}
                onFocus={e => e.target.style.borderColor = "#534AB7"}
                onBlur={e => e.target.style.borderColor = "#D3D1C7"}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: "9px 20px", fontSize: 13, fontWeight: 500,
                  background: creating ? "#AFA9EC" : "#534AB7",
                  color: "#fff", border: "none", borderRadius: 8,
                  cursor: creating ? "not-allowed" : "pointer", fontFamily: "inherit"
                }}>
                {creating ? "Creating..." : "Create course"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "9px 16px", fontSize: 13,
                  background: "transparent", color: "#888780",
                  border: "0.5px solid #D3D1C7", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const }}>
        <div style={{ position: "relative" as const, flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#B4B2A9" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 30 }}
            onFocus={e => e.target.style.borderColor = "#534AB7"}
            onBlur={e => e.target.style.borderColor = "#D3D1C7"}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {difficulties.map(d => (
            <button key={d} onClick={() => setFilter(d)} style={{
              padding: "8px 14px", fontSize: 13, fontWeight: 500,
              border: filter === d ? "none" : "0.5px solid #D3D1C7",
              borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
              background: filter === d ? "#534AB7" : "#fff",
              color: filter === d ? "#fff" : "#5F5E5A",
              transition: "all .15s"
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>
        {filtered.length} course{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Course grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16
      }}>
        {filtered.map((course, i) => {
          const color      = COURSE_COLORS[i % COURSE_COLORS.length];
          const diff       = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner;
          const isEnrolled = enrolled.has(course.id);
          const isLoading  = enrolling === course.id;

          return (
            <div key={course.id} style={{
              background: "#fff", border: "0.5px solid #E8E6DF",
              borderRadius: 12, overflow: "hidden", transition: "border-color .15s, transform .15s",
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
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "3px 8px",
                    borderRadius: 10, background: diff.bg, color: diff.text,
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 4
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: diff.dot, display: "inline-block" }} />
                    {course.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13, color: "#5F5E5A", lineHeight: 1.5,
                  marginBottom: 14, marginTop: 0,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden"
                } as React.CSSProperties}>
                  {course.description}
                </p>

                {/* Meta */}
                <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                  {[
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                      text: course.professor_name || "Unassigned"
                    },
                    {
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
                      text: `${course.slide_count || 0} slides`
                    },
                  ].map(({ icon, text }, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888780" }}>
                      {icon}{text}
                    </div>
                  ))}
                </div>

                {/* XP reward */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 10px", background: "#F1EFE8", borderRadius: 6, marginBottom: 14
                }}>
                  <span style={{ fontSize: 12, color: "#5F5E5A" }}>Complete to earn</span>
                  <span style={{
                    fontSize: 12, fontWeight: 500, color,
                    background: color + "18", padding: "2px 8px", borderRadius: 6
                  }}>
                    +{(course.slide_count || 10) * 10} XP
                  </span>
                </div>

                {/* Actions */}
                {user?.role === "student" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={isEnrolled || isLoading}
                      style={{
                        flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 500,
                        border: "none", borderRadius: 8,
                        cursor: isEnrolled ? "default" : isLoading ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "opacity .15s",
                        background: isEnrolled ? "#EAF3DE" : color,
                        color: isEnrolled ? "#27500A" : "#fff",
                        opacity: isLoading ? 0.7 : 1
                      }}>
                      {isLoading ? "Enrolling..." : isEnrolled ? "✓ Enrolled" : "Enroll"}
                    </button>

                    {isEnrolled && (
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        style={{
                          padding: "9px 14px", fontSize: 13, fontWeight: 500,
                          border: `0.5px solid ${color}`, borderRadius: 8,
                          cursor: "pointer", fontFamily: "inherit",
                          background: "transparent", color
                        }}>
                        Start →
                      </button>
                    )}
                  </div>
                )}

                {/* Professor actions */}
                {user?.role === "professor" && (
                  <button
                    onClick={() => navigate(`/courses/${course.id}/manage`)}
                    style={{
                      width: "100%", padding: "9px 0", fontSize: 13, fontWeight: 500,
                      border: `0.5px solid ${color}`, borderRadius: 8,
                      cursor: "pointer", fontFamily: "inherit",
                      background: "transparent", color
                    }}>
                    Manage course →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888780" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#5F5E5A", marginBottom: 6 }}>
            No courses found
          </div>
          <div style={{ fontSize: 13 }}>
            {user?.role === "professor" ? "Create your first course above" : "Try a different search or filter"}
          </div>
        </div>
      )}
    </div>
  );
}