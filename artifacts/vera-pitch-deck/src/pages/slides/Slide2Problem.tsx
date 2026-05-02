export default function Slide2Problem() {
  const problems = [
    {
      icon: "📋",
      title: "Candidatos en hojas de cálculo",
      desc: "Datos dispersos en Excel y emails. Sin fuente única de verdad. Riesgo de pérdida de información.",
      impact: "Alto riesgo",
    },
    {
      icon: "⏱️",
      title: "Criba curricular manual",
      desc: "5–10 minutos por CV evaluado a mano. Con decenas de candidatos, el proceso se convierte en cuello de botella.",
      impact: "5–10 min / CV",
    },
    {
      icon: "📧",
      title: "Comunicación inconsistente",
      desc: "Candidatos sin respuesta durante días o semanas. Daño a la imagen de la organización como empleador.",
      impact: "Mala experiencia",
    },
    {
      icon: "🔍",
      title: "Sin visibilidad del pipeline",
      desc: "Imposible saber en qué fase está cada candidato sin consultar múltiples documentos o personas.",
      impact: "Cero trazabilidad",
    },
    {
      icon: "🧠",
      title: "Evaluaciones subjetivas",
      desc: "Criterios distintos según el entrevistador. Sin registro escrito, las decisiones no son auditables.",
      impact: "Sin estándar",
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "2vh",
        }}
      >
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
          <div>EL PROBLEMA</div>
          <div>2 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3vw" }}>
        {/* Left: heading */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Situación actual
          </div>
          <h2 style={{ fontSize: "3.8vw", fontWeight: 800, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            El proceso de selección está
            <span style={{ color: "#EF4444" }}> roto</span>
          </h2>
          <p style={{ fontSize: "1.15vw", color: "#475569", lineHeight: 1.6, margin: 0 }}>
            Sin una plataforma centralizada, cada proceso de selección supone horas de trabajo manual, comunicación deficiente y decisiones poco objetivas.
          </p>

          <div
            style={{
              marginTop: "3vh",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "0.8vw",
              padding: "2vh 1.5vw",
            }}
          >
            <div style={{ fontSize: "0.85vw", fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8vh" }}>
              Coste real estimado
            </div>
            <div style={{ fontSize: "2vw", fontWeight: 800, color: "#DC2626" }}>+40 h/mes</div>
            <div style={{ fontSize: "0.9vw", color: "#EF4444", marginTop: "0.5vh" }}>
              dedicadas a gestión manual del pipeline
            </div>
          </div>
        </div>

        {/* Right: problems list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", justifyContent: "center" }}>
          {problems.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "1.5vw",
                alignItems: "flex-start",
                background: "#FFFFFF",
                padding: "1.8vh 2vw",
                borderRadius: "0.8vw",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 12px rgba(30,58,95,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: "1.6vw",
                  width: "3vw",
                  height: "3vw",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderRadius: "0.5vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.4vh" }}>
                  {p.title}
                </div>
                <div style={{ fontSize: "0.9vw", color: "#64748B", lineHeight: 1.4 }}>{p.desc}</div>
              </div>
              <div
                style={{
                  fontSize: "0.8vw",
                  fontWeight: 700,
                  color: "#EF4444",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  padding: "0.4vh 0.8vw",
                  borderRadius: "2vw",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                {p.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
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
        <span>Confidencial · Solo uso interno</span>
      </div>
    </div>
  );
}
