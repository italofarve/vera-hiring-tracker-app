export default function Slide6Tech() {
  const techStack = [
    { icon: "⚛️", name: "React + Vite", role: "Frontend", desc: "Interfaz rápida, moderna y responsive. Optimizada para equipos de RR.HH." },
    { icon: "🟩", name: "Node.js + Express", role: "Backend", desc: "API robusta y escalable. Arquitectura RESTful lista para integraciones." },
    { icon: "🐘", name: "PostgreSQL", role: "Base de datos", desc: "Datos seguros y persistentes. Transacciones ACID. Backup automático." },
    { icon: "🔐", name: "Clerk Auth", role: "Autenticación", desc: "Login seguro con soporte Google OAuth. Gestión de sesiones empresarial." },
    { icon: "🤖", name: "OpenAI GPT", role: "Inteligencia Artificial", desc: "Análisis de CVs en lenguaje natural. 10 datos clave por candidato." },
    { icon: "📧", name: "Resend", role: "Emails transaccionales", desc: "Notificaciones automáticas fiables. Fallback graceful si no disponible." },
  ];

  const securityPoints = [
    "Autenticación multifactor disponible",
    "CVs cifrados en Object Storage",
    "Acceso por roles (RR.HH. vs. candidato)",
    "Sesiones con expiración automática",
    "HTTPS obligatorio en producción",
    "Sin datos personales expuestos al público",
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
          <div>ARQUITECTURA Y SEGURIDAD</div>
          <div>6 / 7</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "3vw" }}>
        {/* Left: tech stack */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#0D9488", marginBottom: "1.5vh", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Stack tecnológico
          </div>
          <h2 style={{ fontSize: "2.8vw", fontWeight: 800, margin: "0 0 2vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Tecnología empresarial lista para producción
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2vh 1.5vw", marginTop: "0.5vh" }}>
            {techStack.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  padding: "1.8vh 1.5vw",
                  borderRadius: "0.8vw",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 10px rgba(30,58,95,0.04)",
                  display: "flex",
                  gap: "1vw",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: "1.5vw",
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
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.75vw", fontWeight: 700, color: "#0D9488", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2vh" }}>
                    {t.role}
                  </div>
                  <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.3vh" }}>{t.name}</div>
                  <div style={{ fontSize: "0.8vw", color: "#64748B", lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: security */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              background: "#1E3A5F",
              borderRadius: "1.2vw",
              padding: "3vh 2.5vw",
              height: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "1vw", fontWeight: 700, color: "#5EEAD4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>
                Seguridad
              </div>
              <div style={{ fontSize: "2vw", fontWeight: 800, color: "#FFFFFF", marginBottom: "2.5vh", lineHeight: 1.2 }}>
                Diseñado para el sector regulado
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
                {securityPoints.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                    <div
                      style={{
                        width: "1.4vw",
                        height: "1.4vw",
                        backgroundColor: "rgba(13,148,136,0.3)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="60%" height="60%" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.85)", lineHeight: 1.3 }}>{p}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                marginTop: "2vh",
                background: "rgba(13,148,136,0.15)",
                borderRadius: "0.6vw",
                padding: "1.5vh 1.5vw",
                border: "1px solid rgba(13,148,136,0.3)",
              }}
            >
              <div style={{ fontSize: "0.8vw", fontWeight: 700, color: "#5EEAD4", marginBottom: "0.5vh" }}>Estado del sistema</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
                <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#5EEAD4" }} />
                <div style={{ fontSize: "0.95vw", fontWeight: 700, color: "#FFFFFF" }}>En producción · Disponible 24/7</div>
              </div>
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
