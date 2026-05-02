export default function Slide5Impact() {
  const comparisons = [
    {
      area: "Criba curricular",
      before: "5–10 min por CV",
      after: "< 30 segundos con IA",
      gain: "–95% tiempo",
      gainColor: "#0D9488",
    },
    {
      area: "Comunicación con candidatos",
      before: "Manual e inconsistente",
      after: "Automática en cada hito",
      gain: "100% automatizado",
      gainColor: "#0D9488",
    },
    {
      area: "Visibilidad del proceso",
      before: "Inexistente o manual",
      after: "Dashboard en tiempo real",
      gain: "Trazabilidad total",
      gainColor: "#0D9488",
    },
    {
      area: "Evaluación de candidatos",
      before: "Criterios subjetivos",
      after: "Feedback estructurado y comparable",
      gain: "Estándar objetivo",
      gainColor: "#0D9488",
    },
    {
      area: "Experiencia del candidato",
      before: "Email o formulario externo",
      after: "Portal propio moderno",
      gain: "Employer brand +",
      gainColor: "#0D9488",
    },
  ];

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
        gridTemplateRows: "auto 1fr auto",
        gap: "2.5vh",
        color: "#1E3A5F",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "2vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "2.2vw", height: "2.2vw", backgroundColor: "#0D9488", borderRadius: "0.5vw", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: "1.3vw", fontWeight: 800 }}>Vera</div>
        </div>
        <div style={{ display: "flex", gap: "2vw", fontSize: "0.95vw", fontWeight: 600, color: "#64748B" }}>
          <div>IMPACTO MEDIBLE</div>
          <div>5 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4fr", gap: "3vw" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Antes vs. Después
          </div>
          <h2 style={{ fontSize: "3.5vw", fontWeight: 800, margin: "0 0 2.5vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Transformación medible del proceso
          </h2>

          {/* KPI highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "0.8vw", padding: "2vh 1.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.04)" }}>
              <div style={{ fontSize: "0.8vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5vh" }}>Ahorro de tiempo estimado</div>
              <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#0D9488" }}>+40 h</div>
              <div style={{ fontSize: "0.85vw", color: "#64748B" }}>por mes liberadas en RR.HH.</div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "0.8vw", padding: "2vh 1.5vw", boxShadow: "0 2px 12px rgba(30,58,95,0.04)" }}>
              <div style={{ fontSize: "0.8vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5vh" }}>Reducción de criba</div>
              <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#0D9488" }}>70%</div>
              <div style={{ fontSize: "0.85vw", color: "#64748B" }}>menos tiempo por CV analizado</div>
            </div>
            <div style={{ background: "#1E3A5F", border: "1px solid #1E3A5F", borderRadius: "0.8vw", padding: "2vh 1.5vw" }}>
              <div style={{ fontSize: "0.8vw", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5vh" }}>Emails automáticos</div>
              <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#5EEAD4" }}>4</div>
              <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.7)" }}>hitos automatizados por candidato</div>
            </div>
          </div>
        </div>

        {/* Right: comparison table */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "1.2vw",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(30,58,95,0.06)",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
                gap: "0",
                background: "#1E3A5F",
                padding: "1.5vh 2vw",
              }}
            >
              {["Área", "Sin Vera", "Con Vera", "Mejora"].map((h) => (
                <div key={h} style={{ fontSize: "0.8vw", fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </div>
              ))}
            </div>
            {/* Table rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr",
                  gap: "0",
                  padding: "1.8vh 2vw",
                  borderBottom: i < comparisons.length - 1 ? "1px solid #F1F5F9" : "none",
                  backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#1E3A5F" }}>{row.area}</div>
                <div style={{ fontSize: "0.85vw", color: "#EF4444", display: "flex", alignItems: "center", gap: "0.4vw" }}>
                  <span style={{ fontSize: "0.9vw" }}>✗</span> {row.before}
                </div>
                <div style={{ fontSize: "0.85vw", color: "#0D9488", display: "flex", alignItems: "center", gap: "0.4vw" }}>
                  <span style={{ fontSize: "0.9vw" }}>✓</span> {row.after}
                </div>
                <div
                  style={{
                    fontSize: "0.8vw",
                    fontWeight: 700,
                    color: "#0D9488",
                    backgroundColor: "rgba(13,148,136,0.1)",
                    padding: "0.4vh 0.6vw",
                    borderRadius: "2vw",
                    textAlign: "center",
                  }}
                >
                  {row.gain}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "2vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Vera · Entidad financiera</div>
        <span>Confidencial · Solo uso interno</span>
      </div>
    </div>
  );
}
