const Loading = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh", gap: "1rem" }}>
        <div className="spinner-border text-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p className="text-muted small mb-0">Loading...</p>
      </div>
    );
  }
  return (
    <div className="d-flex align-items-center gap-2 py-4 justify-content-center">
      <div className="spinner-border spinner-border-sm text-primary" />
      <span className="text-muted small">Loading...</span>
    </div>
  );
};

export default Loading;
