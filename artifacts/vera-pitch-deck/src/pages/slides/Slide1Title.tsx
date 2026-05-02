export default function Slide1Title() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#FAFBFC",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "4vh 4vw",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gridTemplateRows: "auto 1fr auto",
        gap: "3vh 4vw",
        color: "#1E3A5F",
      }}
    >
      {/* Header */}
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "2vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div
            style={{
              width: "2.2vw",
              height: "2.2vw",
              backgroundColor: "#0D9488",
              borderRadius: "0.5vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
              <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: "1.3vw", fontWeight: 800, letterSpacing: "0.02em" }}>
            Vera
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw", fontSize: "0.95vw", fontWeight: 600, color: "#64748B" }}>
          <div>HIRING TRACKER</div>
          <div>Abril 2026</div>
        </div>
      </div>

      {/* Main Content Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontSize: "1.1vw",
            fontWeight: 700,
            color: "#0D9488",
            marginBottom: "1.5vh",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Plataforma de Talento · Sector Financiero
        </div>
        <h1
          style={{
            fontSize: "5.5vw",
            fontWeight: 800,
            margin: "0 0 2.5vh 0",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#1E3A5F",
          }}
        >
          Vera Hiring
          <br />
          <span style={{ color: "#0D9488" }}>Tracker</span>
        </h1>
        <p
          style={{
            fontSize: "1.4vw",
            fontWeight: 400,
            color: "#475569",
            margin: "0 0 4vh 0",
            lineHeight: 1.6,
            maxWidth: "38vw",
          }}
        >
          La plataforma de gestión de talento diseñada para el sector financiero. Del anuncio de vacante a la contratación, todo en un solo sistema.
        </p>

        <div style={{ display: "flex", gap: "2vw" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "2.5vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              flex: 1,
              boxShadow: "0 4px 20px rgba(30,58,95,0.06)",
            }}
          >
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#64748B", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Criba con IA
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.8vw" }}>
              <div style={{ fontSize: "3.2vw", fontWeight: 800, color: "#1E3A5F" }}>&lt;30s</div>
              <div
                style={{
                  fontSize: "0.85vw",
                  fontWeight: 700,
                  color: "#0D9488",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  padding: "0.4vh 0.7vw",
                  borderRadius: "2vw",
                }}
              >
                vs 5–10 min
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#FFFFFF",
              padding: "2.5vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              flex: 1,
              boxShadow: "0 4px 20px rgba(30,58,95,0.06)",
            }}
          >
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#64748B", marginBottom: "0.8vh", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Reducción de tiempo
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.8vw" }}>
              <div style={{ fontSize: "3.2vw", fontWeight: 800, color: "#1E3A5F" }}>70%</div>
              <div
                style={{
                  fontSize: "0.85vw",
                  fontWeight: 700,
                  color: "#0D9488",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  padding: "0.4vh 0.7vw",
                  borderRadius: "2vw",
                }}
              >
                criba curricular
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Right */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            background: "#FFFFFF",
            padding: "4vh 3vw",
            borderRadius: "1.2vw",
            border: "1px solid #E2E8F0",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            boxSizing: "border-box",
            boxShadow: "0 4px 24px rgba(30,58,95,0.07)",
          }}
        >
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "2vh", borderBottom: "1px solid #F1F5F9", paddingBottom: "1.5vh" }}>
            Módulos de la plataforma
          </div>
          {[
            { icon: "📊", label: "Dashboard ejecutivo", desc: "Métricas en tiempo real" },
            { icon: "👥", label: "Pipeline de candidatos", desc: "7 etapas de selección" },
            { icon: "🤖", label: "Análisis CV con IA", desc: "OpenAI GPT · 10 insights" },
            { icon: "📅", label: "Entrevistas", desc: "Gestión y confirmación automática" },
            { icon: "⭐", label: "Feedback estructurado", desc: "Evaluación por entrevistador" },
            { icon: "🌐", label: "Portal candidatos", desc: "Público · Sin registro" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.2vw",
                padding: "1.2vh 0",
                borderBottom: i < 5 ? "1px solid #F8FAFC" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "1.4vw",
                  width: "2.5vw",
                  height: "2.5vw",
                  backgroundColor: "rgba(13,148,136,0.08)",
                  borderRadius: "0.5vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: "1vw", fontWeight: 700, color: "#1E3A5F" }}>{item.label}</div>
                <div style={{ fontSize: "0.85vw", color: "#64748B" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #E2E8F0",
          paddingTop: "2vh",
          fontSize: "0.85vw",
          color: "#94A3B8",
          fontWeight: 500,
        }}
      >
        <div>Vera · Entidad financiera</div>
        <div style={{ display: "flex", gap: "1vw" }}>
          <span>Confidencial · Solo uso interno</span>
          <span>•</span>
          <span>1 / 7</span>
        </div>
      </div>
    </div>
  );
}
