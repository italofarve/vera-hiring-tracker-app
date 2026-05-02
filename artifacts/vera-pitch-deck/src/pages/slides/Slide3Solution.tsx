export default function Slide3Solution() {
  const pipeline = [
    "Aplicado",
    "Preselección",
    "Entrevista Técnica",
    "Entrevista RR.HH.",
    "Entrevista Final",
    "Oferta",
    "Contratado",
  ];

  const modules = [
    { icon: "📊", title: "Dashboard ejecutivo", desc: "Métricas en tiempo real: candidatos activos, posiciones abiertas, próximas entrevistas y actividad del equipo." },
    { icon: "🌐", title: "Portal público de candidatos", desc: "Microsite sin registro donde los aspirantes descubren vacantes y envían su candidatura directamente al pipeline." },
    { icon: "📅", title: "Gestión de entrevistas", desc: "Planificación integrada: asigna entrevistador, fecha, modalidad y enlace. El candidato recibe confirmación automática." },
    { icon: "⭐", title: "Feedback estructurado", desc: "Evaluación post-entrevista por puntuación, fortalezas y recomendación. Comparable entre todos los entrevistadores." },
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
          <div>LA SOLUCIÓN</div>
          <div>3 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "3vw" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Sistema end-to-end
          </div>
          <h2 style={{ fontSize: "3.5vw", fontWeight: 800, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Pipeline centralizado para todo el ciclo de selección
          </h2>
          <p style={{ fontSize: "1.05vw", color: "#475569", lineHeight: 1.6, margin: "0 0 3vh 0" }}>
            Un único sistema donde todo el equipo trabaja sobre el mismo estado actualizado en tiempo real.
          </p>

          {/* Pipeline visual */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "0.8vw",
              border: "1px solid #E2E8F0",
              padding: "2vh 1.5vw",
              boxShadow: "0 2px 12px rgba(30,58,95,0.05)",
            }}
          >
            <div style={{ fontSize: "0.8vw", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5vh" }}>
              Pipeline · 7 etapas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6vh" }}>
              {pipeline.map((stage, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                  <div
                    style={{
                      width: "1.5vw",
                      height: "1.5vw",
                      borderRadius: "50%",
                      backgroundColor: i === pipeline.length - 1 ? "#0D9488" : i === 0 ? "rgba(13,148,136,0.2)" : "rgba(13,148,136,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6vw",
                      fontWeight: 800,
                      color: "#0D9488",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "0.35vh",
                      borderRadius: "2px",
                      background: `linear-gradient(to right, #0D9488 ${((i + 1) / pipeline.length) * 100}%, #E2E8F0 ${((i + 1) / pipeline.length) * 100}%)`,
                    }}
                  />
                  <div style={{ fontSize: "0.85vw", fontWeight: i === pipeline.length - 1 ? 700 : 500, color: i === pipeline.length - 1 ? "#0D9488" : "#1E3A5F", whiteSpace: "nowrap" }}>
                    {stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: modules */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5vh 1.5vw", alignContent: "center" }}>
          {modules.map((m, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                padding: "2.5vh 2vw",
                borderRadius: "1vw",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 12px rgba(30,58,95,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "1vh",
              }}
            >
              <div
                style={{
                  fontSize: "1.8vw",
                  width: "3.2vw",
                  height: "3.2vw",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  borderRadius: "0.6vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m.icon}
              </div>
              <div style={{ fontSize: "1.05vw", fontWeight: 700, color: "#1E3A5F" }}>{m.title}</div>
              <div style={{ fontSize: "0.85vw", color: "#64748B", lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          ))}
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
