import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f1f5f9", textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🔍</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>404 — Page Not Found</h1>
      <p style={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: 600, marginBottom: "2rem" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.75rem 2rem", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer" }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
