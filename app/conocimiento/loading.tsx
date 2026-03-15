export default function ConocimientoLoading() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e8eaf0",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#e8eaf0",
            boxShadow: "8px 8px 16px #c2c8d6, -8px -8px 16px #ffffff",
            margin: "0 auto 16px",
            animation: "shimmer 1s ease-in-out infinite alternate",
          }}
        />
        <p
          style={{
            fontSize: 13,
            color: "#8892b0",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Cargando red de conocimiento…
        </p>
      </div>
    </div>
  );
}
