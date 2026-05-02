export default function Slide7Next() {
  const roadmap = [
    {
      phase: "Fase 1",
      status: "Completado",
      statusColor: "#0D9488",
      statusBg: "rgba(13,148,136,0.1)",
      items: ["Pipeline completo de selección", "Análisis CV con IA", "Portal público de candidatos", "Emails automáticos", "Dashboard ejecutivo"],
    },
    {
      phase: "Fase 2",
      status: "Próximo paso",
      statusColor: "#1E3A5F",
      statusBg: "rgba(30,58,95,0.08)",
      items: ["Integración LinkedIn/Indeed", "Reportes avanzados y exportación", "App móvil para entrevistadores", "API pública para integraciones"],
    },
    {
      phase: "Fase 3",
      status: "Roadmap",
      statusColor: "#64748B",
      statusBg: "rgba(100,116,139,0.08)",
      items: ["Onboarding digital post-contratación", "Multi-empresa / multi-tenant", "IA predictiva de retención", "Integración con nóminas"],
    },
  ];

  const requests = [
    { icon: "💻", label: "Apoyo del equipo de IT", desc: "Para configuración de dominio corporativo y SSO" },
    { icon: "📄", label: "Licencias de producción", desc: "OpenAI API, Resend email, Clerk Auth enterprise" },
    { icon: "👨‍💻", label: "Equipo de desarrollo dedicado", desc: "Para acelerar la Fase 2 del roadmap" },
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
          <div>PRÓXIMOS PASOS</div>
          <div>7 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "3vw" }}>
        {/* Left: roadmap */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Roadmap de producto
          </div>
          <h2 style={{ fontSize: "2.8vw", fontWeight: 800, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            La plataforma está en producción.
            <br />
            <span style={{ color: "#0D9488" }}>Escalamos juntos.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            {roadmap.map((phase, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "0.8vw",
                  border: "1px solid #E2E8F0",
                  padding: "1.8vh 2vw",
                  boxShadow: "0 2px 10px rgba(30,58,95,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1vh" }}>
                  <div style={{ fontSize: "1vw", fontWeight: 800, color: "#1E3A5F" }}>{phase.phase}</div>
                  <div
                    style={{
                      fontSize: "0.75vw",
                      fontWeight: 700,
                      color: phase.statusColor,
                      backgroundColor: phase.statusBg,
                      padding: "0.35vh 0.7vw",
                      borderRadius: "2vw",
                    }}
                  >
                    {phase.status}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5vh 0.8vw" }}>
                  {phase.items.map((item, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: "0.8vw",
                        color: i === 0 ? "#0D9488" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4vw",
                      }}
                    >
                      <span style={{ fontSize: "0.7vw" }}>{i === 0 ? "✓" : "→"}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: requests + CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "1.2vw",
              border: "1px solid #E2E8F0",
              padding: "2.5vh 2vw",
              boxShadow: "0 4px 20px rgba(30,58,95,0.06)",
            }}
          >
            <div style={{ fontSize: "1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "2vh", borderBottom: "1px solid #F1F5F9", paddingBottom: "1.2vh" }}>
              Solicitud de recursos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
              {requests.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                  <div
                    style={{
                      fontSize: "1.4vw",
                      width: "2.8vw",
                      height: "2.8vw",
                      backgroundColor: "rgba(13,148,136,0.08)",
                      borderRadius: "0.5vw",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.3vh" }}>{r.label}</div>
                    <div style={{ fontSize: "0.8vw", color: "#64748B", lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA block */}
          <div
            style={{
              background: "linear-gradient(135deg, #1E3A5F 0%, #0D4A7A 100%)",
              borderRadius: "1.2vw",
              padding: "3vh 2.5vw",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "1vw", fontWeight: 700, color: "#5EEAD4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>
                ¿Siguientes pasos?
              </div>
              <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, marginBottom: "1.5vh" }}>
                Vera está en producción hoy mismo
              </div>
              <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                Podemos hacer una demo en vivo del sistema completo. El pipeline, el análisis de IA y el portal de candidatos están disponibles ahora.
              </div>
            </div>
            <div style={{ marginTop: "2vh" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#0D9488",
                  color: "#FFFFFF",
                  padding: "1.2vh 2vw",
                  borderRadius: "0.5vw",
                  fontSize: "0.95vw",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                Solicitar demo en vivo →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: "2vh", fontSize: "0.85vw", color: "#94A3B8", fontWeight: 500 }}>
        <div>Vera · Entidad financiera</div>
        <div style={{ display: "flex", gap: "1vw" }}>
          <span>Confidencial · Solo uso interno</span>
          <span>•</span>
          <span>7 / 7</span>
        </div>
      </div>
    </div>
  );
}
