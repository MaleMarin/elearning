export default function PortafolioLoading() {
  return (
    <div
      style={{
        flex: 1,
        padding: "18px 16px",
        background: "#e8eaf0",
        minHeight: "100vh",
      }}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 200,
            borderRadius: 20,
            background: "#e8eaf0",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            marginBottom: 16,
            animation: `shimmer 1.5s ease-in-out ${i * 0.2}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
