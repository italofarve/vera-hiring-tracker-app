export default function Slide4AI() {
  const outputs = [
    { label: "Resumen ejecutivo", value: "Perfil sénior" },
    { label: "Años de experiencia", value: "8 años" },
    { label: "Habilidades principales", value: "Python, SQL, BI" },
    { label: "Nivel educativo", value: "Máster Finanzas" },
    { label: "Idiomas", value: "ES · EN · FR" },
    { label: "Puntos fuertes", value: "Analítico, liderazgo" },
    { label: "Áreas a explorar", value: "Gestión de equipos" },
    { label: "Adecuación financiero", value: "Alta ✓" },
    { label: "Valoración sugerida", value: "⭐⭐⭐⭐⭐" },
    { label: "Siguiente paso", value: "Entrevista Técnica" },
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
          <div>ANÁLISIS DE CV CON IA</div>
          <div>4 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "3vw" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            IA · OpenAI GPT
          </div>
          <h2 style={{ fontSize: "3.5vw", fontWeight: 800, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Analiza un CV
            <br />
            en <span style={{ color: "#0D9488" }}>menos de 30s</span>
          </h2>
          <p style={{ fontSize: "1.05vw", color: "#475569", lineHeight: 1.6, margin: "0 0 3vh 0" }}>
            Carga el CV en PDF o Word, o pega el texto directamente. La IA devuelve 10 datos clave para tomar la decisión con criterios objetivos y consistentes.
          </p>

          {/* Flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            {[
              { step: "1", label: "Subir PDF o Word", color: "#E2E8F0", textColor: "#1E3A5F" },
              { step: "2", label: "GPT analiza el contenido", color: "rgba(13,148,136,0.15)", textColor: "#0D9488" },
              { step: "3", label: "10 insights en pantalla", color: "#0D9488", textColor: "#FFFFFF" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
                <div
                  style={{
                    width: "2.2vw",
                    height: "2.2vw",
                    borderRadius: "50%",
                    backgroundColor: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9vw",
                    fontWeight: 800,
                    color: s.textColor,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div style={{ fontSize: "1vw", fontWeight: 600, color: "#1E3A5F" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "3vh",
              background: "rgba(13,148,136,0.08)",
              borderRadius: "0.8vw",
              padding: "2vh 1.5vw",
              border: "1px solid rgba(13,148,136,0.2)",
            }}
          >
            <div style={{ fontSize: "2.8vw", fontWeight: 800, color: "#0D9488" }}>70%</div>
            <div style={{ fontSize: "0.95vw", color: "#1E3A5F", fontWeight: 600 }}>
              reducción del tiempo de criba curricular
            </div>
          </div>
        </div>

        {/* Right: AI output mockup */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "1.2vw",
            border: "1px solid #E2E8F0",
            padding: "3vh 2.5vw",
            boxShadow: "0 4px 24px rgba(30,58,95,0.07)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2vh", paddingBottom: "1.5vh", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F" }}>
              Análisis de CV — García López, M.
            </div>
            <div
              style={{
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "#0D9488",
                backgroundColor: "rgba(13,148,136,0.1)",
                padding: "0.4vh 0.8vw",
                borderRadius: "2vw",
              }}
            >
              Completado en 22s
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2vh 2vw", flex: 1, alignContent: "start" }}>
            {outputs.map((o, i) => (
              <div
                key={i}
                style={{
                  padding: "1.2vh 1.2vw",
                  background: "#FAFBFC",
                  borderRadius: "0.6vw",
                  border: "1px solid #F1F5F9",
                }}
              >
                <div style={{ fontSize: "0.75vw", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4vh" }}>
                  {o.label}
                </div>
                <div style={{ fontSize: "0.95vw", fontWeight: 700, color: i === 7 ? "#0D9488" : "#1E3A5F" }}>
                  {o.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "2vh",
              padding: "1.5vh 1.5vw",
              background: "rgba(13,148,136,0.06)",
              borderRadius: "0.6vw",
              border: "1px solid rgba(13,148,136,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "1vw",
            }}
          >
            <div style={{ fontSize: "1.2vw" }}>🤖</div>
            <div style={{ fontSize: "0.9vw", color: "#475569", lineHeight: 1.4 }}>
              <strong style={{ color: "#0D9488" }}>Recomendación IA:</strong> Perfil muy alineado con el sector financiero. Pasar a Entrevista Técnica prioritariamente.
            </div>
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
