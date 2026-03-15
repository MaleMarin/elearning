export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#e8eaf0",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 72,
          background: "#e8eaf0",
          boxShadow: "5px 0 16px #c2c8d6, 1px 0 4px #ffffff",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: "#e8eaf0",
            boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            marginBottom: 16,
          }}
        />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: "#e8eaf0",
              boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
              animation: `shimmer 1.5s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Main content skeleton */}
      <div style={{ flex: 1, padding: "18px 16px", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div
            style={{
              width: 180,
              height: 24,
              borderRadius: 8,
              background: "#e8eaf0",
              boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
            }}
          />
          <div
            style={{
              width: 100,
              height: 24,
              borderRadius: 8,
              background: "#e8eaf0",
              boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
            }}
          />
        </div>

        {/* Security strip */}
        <div
          style={{
            height: 36,
            borderRadius: 11,
            background: "#e8eaf0",
            boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
            marginBottom: 16,
          }}
        />

        {/* Hero card skeleton */}
        <div
          style={{
            height: 160,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgba(10,15,138,0.15), rgba(20,40,212,0.1))",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            marginBottom: 16,
            animation: "shimmer 1.5s ease-in-out infinite alternate",
          }}
        />

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 80,
                borderRadius: 14,
                background: "#e8eaf0",
                boxShadow: "5px 5px 11px #c2c8d6, -5px -5px 11px #ffffff",
                animation: `shimmer 1.5s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Check-in */}
        <div
          style={{
            height: 80,
            borderRadius: 16,
            background: "#e8eaf0",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            marginBottom: 14,
          }}
        />

        {/* Two columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              height: 160,
              borderRadius: 16,
              background: "#e8eaf0",
              boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            }}
          />
          <div
            style={{
              height: 160,
              borderRadius: 16,
              background: "#e8eaf0",
              boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            }}
          />
        </div>
      </div>

      {/* Right panel skeleton */}
      <div
        style={{
          width: 240,
          background: "#e8eaf0",
          boxShadow: "-4px 0 14px #c2c8d6, -1px 0 4px #ffffff",
          padding: "18px 14px",
        }}
      >
        {/* Profile */}
        <div
          style={{
            height: 180,
            borderRadius: 16,
            background: "#e8eaf0",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            marginBottom: 12,
          }}
        />
        {/* Calendar */}
        <div
          style={{
            height: 200,
            borderRadius: 16,
            background: "#e8eaf0",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
            marginBottom: 12,
          }}
        />
        {/* Notifications */}
        <div
          style={{
            height: 160,
            borderRadius: 16,
            background: "#e8eaf0",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          }}
        />
      </div>
    </div>
  );
}
