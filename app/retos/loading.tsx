export default function RetosLoading() {
  return (
    <div
      style={{
        flex: 1,
        padding: "18px 16px",
        background: "#e8eaf0",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          height: 50,
          borderRadius: 14,
          background: "#e8eaf0",
          boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
          marginBottom: 16,
        }}
      />
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 140,
            borderRadius: 18,
            background: "#e8eaf0",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            marginBottom: 12,
            animation: `shimmer 1.5s ease-in-out ${i * 0.25}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
