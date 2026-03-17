import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const navLinks = user?.role === "professor"
    ? [
        { to: "/dashboard",  label: "Dashboard" },
        { to: "/courses",    label: "Courses"   },
        { to: "/messages",   label: "Messages"  },
      ]
    : [
        { to: "/dashboard",  label: "Dashboard"  },
        { to: "/courses",    label: "Courses"     },
        { to: "/my-courses", label: "My Courses"  },
        { to: "/messages",   label: "Messages"    },
      ];

  return (
    <header style={{
      background: "#fff", borderBottom: "0.5px solid #E8E6DF",
      position: "sticky", top: 0, zIndex: 50
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, sans-serif"
      }}>

        {/* Brand */}
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-.02em" }}>
            Learn<span style={{ color: "#534AB7" }}>XP</span>
          </div>
        </Link>

        {/* Nav links */}
        {user && (
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navLinks.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8,
                    fontSize: 14, fontWeight: active ? 500 : 400,
                    color: active ? "#534AB7" : "#5F5E5A",
                    background: active ? "#EEEDFE" : "transparent",
                    transition: "all .15s", cursor: "pointer"
                  }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "#F8F7FF";
                        e.currentTarget.style.color = "#534AB7";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#5F5E5A";
                      }
                    }}
                  >{label}</div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              {/* Role badge */}
              <div style={{
                fontSize: 11, fontWeight: 500,
                padding: "3px 8px", borderRadius: 10,
                background: user.role === "professor" ? "#E1F5EE" : "#EEEDFE",
                color: user.role === "professor" ? "#085041" : "#3C3489",
                textTransform: "capitalize"
              }}>
                {user.role}
              </div>

              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: user.role === "professor" ? "#1D9E75" : "#534AB7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 500, color: "#fff", flexShrink: 0
                }}>
                  {(user.name as string)?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, color: "#3d3d3a", fontWeight: 500 }}>
                  {user.name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{
                  padding: "6px 14px", fontSize: 13, fontWeight: 500,
                  border: "0.5px solid #D3D1C7", borderRadius: 8,
                  background: "transparent", color: "#5F5E5A",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all .15s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#FCEBEB";
                  e.currentTarget.style.color = "#A32D2D";
                  e.currentTarget.style.borderColor = "#F09595";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#5F5E5A";
                  e.currentTarget.style.borderColor = "#D3D1C7";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{
              padding: "6px 14px", fontSize: 13, fontWeight: 500,
              border: "0.5px solid #534AB7", borderRadius: 8,
              color: "#534AB7", textDecoration: "none",
              transition: "all .15s"
            }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}