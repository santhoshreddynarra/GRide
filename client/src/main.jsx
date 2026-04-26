import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ─── Global Error Boundary ────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[GigRide ErrorBoundary]", error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#f8fafc",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
          <div style={{
            background: "white", borderRadius: 20, padding: "3rem 2.5rem",
            maxWidth: 480, width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
              style={{
                padding: "0.75rem 2rem", background: "#0f172a", color: "white",
                border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);