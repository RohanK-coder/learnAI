import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"student" | "professor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, role });
      login(res.data);
      navigate(role === "professor" ? "/professor/dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const leaderboard = [
    { rank: 1, initials: "JK", name: " Jarvis K.", xp: 2840, pct: 96, color: "#FAC775", textColor: "#FAC775" },
    { rank: 2, initials: "JM", name: "James M.", xp: 2210, pct: 78, color: "#7F77DD", textColor: "#D3D1C7" },
    { rank: 3, initials: "You", name: "You", xp: 1740, pct: 61, color: "#1D9E75", textColor: "#9FE1CB", isYou: true },
    { rank: 4, initials: "AR", name: "Alex R.", xp: 1240, pct: 44, color: "#888780", textColor: "#888780" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: "46%", background: "#534AB7", padding: "44px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>

        {/* Top section */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 40 }}>
            Learn<span style={{ color: "#AFA9EC" }}>XP</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 500, color: "#fff", lineHeight: 1.35, marginBottom: 14 }}>
            Learn smarter. Rank higher. Grow faster.
          </h1>
          <p style={{ fontSize: 14, color: "#AFA9EC", lineHeight: 1.6, marginBottom: 36 }}>
            AI-powered learning with live leaderboards and professor-validated
            insights — built for serious students.
          </p>

          {/* Feature list */}
          {[
            {
              desc: "Live course leaderboards",
              sub: "See your real-time rank among classmates taking the same course",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#AFA9EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              )
            },
            {
              desc: "AI learning agent",
              sub: "Ask anything about your course — get instant clear explanations",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#AFA9EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )
            },
            {
              desc: "Share with professor",
              sub: "Optionally send your AI conversation for expert validation",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#AFA9EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )
            },
          ].map(({ desc, sub, icon }) => (
            <div key={desc} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{desc}</div>
                <div style={{ fontSize: 12, color: "#AFA9EC", lineHeight: 1.4 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard preview */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "#AFA9EC",
            letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10
          }}>
            Python Fundamentals — live rankings
          </div>

          {leaderboard.map((s) => (
            <div key={s.rank} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: s.isYou ? "6px 8px" : "6px 0",
              background: s.isYou ? "rgba(255,255,255,0.06)" : "transparent",
              borderRadius: s.isYou ? 6 : 0,
              margin: s.isYou ? "0 -8px" : 0,
              borderBottom: s.rank < 4 && !s.isYou ? "0.5px solid rgba(255,255,255,0.08)" : "none"
            }}>
              <div style={{
                fontSize: 12, fontWeight: 500, width: 18, textAlign: "center",
                color: s.rank === 1 ? "#FAC775" : s.rank === 2 ? "#D3D1C7" : s.textColor
              }}>{s.rank}</div>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: s.color, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 10, fontWeight: 500,
                color: "#fff", flexShrink: 0
              }}>{s.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, color: s.isYou ? "#fff" : "#AFA9EC",
                  fontWeight: s.isYou ? 500 : 400
                }}>{s.name}</div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginTop: 3 }}>
                  <div style={{ height: 3, borderRadius: 2, width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: s.textColor }}>
                {s.xp.toLocaleString()} xp
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1, background: "#fff", padding: "44px 44px",
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 28 }}>
          Sign in to see your ranking and continue learning
        </p>

        {/* Role toggle */}
        <div style={{
          display: "flex", border: "0.5px solid #D3D1C7",
          borderRadius: 8, overflow: "hidden", marginBottom: 24
        }}>
          {(["student", "professor"] as const).map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
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
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 13, fontWeight: 500, color: "#5F5E5A",
              marginBottom: 5, display: "block"
            }}>Email address</label>
            <input
              type="email"
              placeholder={role === "professor" ? "professor@university.edu" : "you@university.edu"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 14,
                border: "0.5px solid #B4B2A9", borderRadius: 8,
                outline: "none", fontFamily: "inherit"
              }}
              onFocus={e => e.target.style.borderColor = "#534AB7"}
              onBlur={e => e.target.style.borderColor = "#B4B2A9"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#5F5E5A" }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: "#534AB7", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 14,
                border: "0.5px solid #B4B2A9", borderRadius: 8,
                outline: "none", fontFamily: "inherit"
              }}
              onFocus={e => e.target.style.borderColor = "#534AB7"}
              onBlur={e => e.target.style.borderColor = "#B4B2A9"}
            />
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
            {loading ? "Signing in..." : `Sign in as ${role}`}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: "0.5px", background: "#D3D1C7" }} />
            <span style={{ fontSize: 12, color: "#888780" }}>or continue with</span>
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
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#534AB7", fontWeight: 500, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}