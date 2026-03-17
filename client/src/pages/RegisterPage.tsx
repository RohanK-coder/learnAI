import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "professor">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      login(res.data);
      navigate(role === "professor" ? "/professor/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: 14,
    border: "0.5px solid #B4B2A9", borderRadius: 8,
    outline: "none", fontFamily: "inherit", background: "#fff",
    color: "#1a1a1a", transition: "border-color .15s"
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 500 as const,
    color: "#5F5E5A", marginBottom: 5, display: "block" as const
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: "46%", background: "#534AB7", padding: "44px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 40 }}>
            Learn<span style={{ color: "#AFA9EC" }}>XP</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 500, color: "#fff", lineHeight: 1.35, marginBottom: 14 }}>
            {role === "professor"
              ? "Empower your students. Validate their thinking."
              : "Your career journey starts here."}
          </h1>
          <p style={{ fontSize: 14, color: "#AFA9EC", lineHeight: 1.6, marginBottom: 36 }}>
            {role === "professor"
              ? "Students will share their AI-assisted learning with you for expert validation and guidance."
              : "Join thousands of students using AI and live leaderboards to accelerate their learning."}
          </p>

          {/* Steps */}
          {(role === "student" ? [
            { step: "1", title: "Create your account", desc: "Takes less than 2 minutes" },
            { step: "2", title: "Enroll in your courses", desc: "Match your university timetable" },
            { step: "3", title: "See your live ranking", desc: "Compete with classmates in real time" },
            { step: "4", title: "Ask the AI anything", desc: "Get instant concept explanations" },
          ] : [
            { step: "1", title: "Create your account", desc: "Select Professor during sign up" },
            { step: "2", title: "Create your course", desc: "Students enroll and start learning" },
            { step: "3", title: "Receive shared insights", desc: "Students send you their AI chats" },
            { step: "4", title: "Validate & guide", desc: "Reply with corrections or praise" },
          ]).map(({ step, title, desc }) => (
            <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 500, color: "#fff", flexShrink: 0
              }}>{step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#AFA9EC" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom social proof */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 16 }}>
          {role === "student" ? (
            <>
              <div style={{ fontSize: 13, color: "#CECBF6", lineHeight: 1.6, marginBottom: 12 }}>
                "LearnXP made me realize I was already ahead in SQL.
                The leaderboard pushed me to stay there — I finished top 3 in my cohort."
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#7F77DD",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 500, color: "#fff"
                }}>RK</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Rohan K.</div>
                  <div style={{ fontSize: 11, color: "#AFA9EC" }}>CS Junior — ranked #1 in Data Structures</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "#CECBF6", lineHeight: 1.6, marginBottom: 12 }}>
                "The shared AI conversations give me a window into how students
                are thinking — I can correct misconceptions before they become exam problems."
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#1D9E75",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 500, color: "#fff"
                }}>DR</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Dr. Reyes</div>
                  <div style={{ fontSize: 11, color: "#AFA9EC" }}>Professor of Computer Science</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1, background: "#fff", padding: "44px 44px",
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>
          Create your account
        </h2>
        <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 28 }}>
          Join LearnXP free — no credit card required
        </p>

        {/* Role toggle */}
        <div style={{
          display: "flex", border: "0.5px solid #D3D1C7",
          borderRadius: 8, overflow: "hidden", marginBottom: 24
        }}>
          {(["student", "professor"] as const).map((r) => (
            <button key={r} onClick={() => setRole(r)} type="button" style={{
              flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: role === r ? "#534AB7" : "transparent",
              color: role === r ? "#fff" : "#5F5E5A",
              transition: "all .15s"
            }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
              {role === "professor" ? "Full name & title" : "Full name"}
            </label>
            <input
              type="text"
              placeholder={role === "professor" ? "Dr. Jane Smith" : "Your full name"}
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#534AB7"}
              onBlur={e => e.target.style.borderColor = "#B4B2A9"}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>University email</label>
            <input
              type="email"
              placeholder={role === "professor" ? "professor@university.edu" : "you@university.edu"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#534AB7"}
              onBlur={e => e.target.style.borderColor = "#B4B2A9"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#534AB7"}
              onBlur={e => e.target.style.borderColor = "#B4B2A9"}
            />
            {/* Password strength bar */}
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: password.length >= i * 2
                    ? i <= 1 ? "#E24B4A" : i <= 2 ? "#EF9F27" : i <= 3 ? "#1D9E75" : "#534AB7"
                    : "#D3D1C7",
                  transition: "background .2s"
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 4 }}>
              {password.length === 0 ? "Enter a password" :
               password.length < 4 ? "Too short" :
               password.length < 6 ? "Weak" :
               password.length < 8 ? "Almost there" : "Strong password"}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontSize: 13, color: "#A32D2D", background: "#FCEBEB",
              padding: "8px 12px", borderRadius: 6, marginBottom: 12
            }}>{error}</p>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 11,
            background: loading ? "#AFA9EC" : "#534AB7",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 4, fontFamily: "inherit"
          }}>
            {loading ? "Creating account..." : `Create ${role} account`}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: "0.5px", background: "#D3D1C7" }} />
            <span style={{ fontSize: 12, color: "#888780" }}>or sign up with</span>
            <div style={{ flex: 1, height: "0.5px", background: "#D3D1C7" }} />
          </div>

          {/* Google */}
          <button type="button" style={{
            width: "100%", padding: 10, background: "#fff",
            border: "0.5px solid #B4B2A9", borderRadius: 8,
            fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, fontFamily: "inherit",
            color: "#1a1a1a"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#5F5E5A" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#534AB7", fontWeight: 500, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

        {/* Terms */}
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#888780", lineHeight: 1.5 }}>
          By creating an account you agree to our{" "}
          <a href="#" style={{ color: "#534AB7", textDecoration: "none" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" style={{ color: "#534AB7", textDecoration: "none" }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}