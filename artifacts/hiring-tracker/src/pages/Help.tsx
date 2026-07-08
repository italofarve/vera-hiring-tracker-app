import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Brain,
  Globe,
  Mail,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Play,
  PresentationIcon,
  ExternalLink,
  Download,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: LayoutDashboard,
    color: "bg-blue-50 text-blue-600",
    title: "Dashboard",
    subtitle: "Vista ejecutiva en tiempo real",
    description:
      "Panel central con metricas clave: candidatos activos por etapa, posiciones abiertas, entrevistas proximas y actividad reciente del equipo. Ideal para tener una fotografia global de todos los procesos de seleccion al instante.",
    path: "/",
    stages: undefined as string[] | undefined,
    external: undefined as boolean | undefined,
  },
  {
    icon: Users,
    color: "bg-violet-50 text-violet-600",
    title: "Candidatos",
    subtitle: "Pipeline completo de seleccion",
    description:
      "Gestion de todos los candidatos en proceso. Filtra por etapa, estado o posicion. Accede al perfil individual para cambiar etapa, anadir notas, valorar y ver historial completo. Cada cambio de etapa notifica automaticamente al candidato por email.",
    path: "/candidates",
    stages: ["Aplicado", "Preseleccion", "Entrevista Tecnica", "Entrevista RR.HH.", "Entrevista Final", "Oferta", "Contratado / Rechazado"],
    external: undefined as boolean | undefined,
  },
  {
    icon: Brain,
    color: "bg-purple-50 text-purple-600",
    title: "Analisis de CV con IA",
    subtitle: "Criba curricular inteligente",
    description:
      "Desde el perfil de cada candidato, sube su CV o pega el texto y obtén en segundos: resumen ejecutivo, años de experiencia, habilidades detectadas, adecuación al sector financiero (Alta/Media/Baja), puntos fuertes, áreas a explorar y siguiente paso recomendado. A continuación puedes descargar algunos CVs de ejemplo que hemos preparado para que puedas probar esta funcionalidad:",
    path: "/candidates",
    stages: undefined as string[] | undefined,
    external: undefined as boolean | undefined,
    downloads: [
      { label: "CV Senior Software Engineer", href: "/examples-cv/cv-senior-swe.pdf" },
      { label: "CV Senior Software Engineer (Perfil Femenino)", href: "/examples-cv/cv-senior-swe-femenino.pdf" },
      { label: "CV Software Engineer Junior", href: "/examples-cv/cv-junior-swe.pdf" }
    ],
  },
  {
    icon: Briefcase,
    color: "bg-amber-50 text-amber-600",
    title: "Posiciones",
    subtitle: "Gestion de vacantes",
    description:
      "Crea y administra todas las vacantes. Define titulo, departamento, ubicacion, tipo de contrato y numero de plazas. Las posiciones activas aparecen automaticamente en el portal publico de candidatos.",
    path: "/positions",
    stages: undefined as string[] | undefined,
    external: undefined as boolean | undefined,
  },
  {
    icon: Calendar,
    color: "bg-emerald-50 text-emerald-600",
    title: "Entrevistas",
    subtitle: "Planificacion y seguimiento",
    description:
      "Programa entrevistas de cualquier tipo (screening, tecnica, panel, final). Registra entrevistador, fecha, duracion y enlace de reunion. Al crear la entrevista, el candidato recibe automaticamente un email de confirmacion.",
    path: "/interviews",
    stages: undefined as string[] | undefined,
    external: undefined as boolean | undefined,
  },
  {
    icon: MessageSquare,
    color: "bg-rose-50 text-rose-600",
    title: "Feedback",
    subtitle: "Evaluaciones estructuradas",
    description:
      "Registra feedback post-entrevista con valoracion por estrellas, fortalezas observadas, aspectos a mejorar y recomendacion de decision (Contratar / Rechazar / Pendiente). Estandariza el criterio de evaluacion entre entrevistadores.",
    path: "/feedback",
    stages: undefined as string[] | undefined,
    external: undefined as boolean | undefined,
  },
  {
    icon: Globe,
    color: "bg-cyan-50 text-cyan-600",
    title: "Portal de Candidatos",
    subtitle: "Acceso publico para aspirantes",
    description:
      "Microsite publico en /portal (sin registro). Los candidatos pueden buscar vacantes, ver descripciones y enviar su candidatura con CV y carta de presentacion. La solicitud entra directamente en el pipeline de RR.HH.",
    path: "/portal",
    stages: undefined as string[] | undefined,
    external: true,
  },
];

const hrSteps = [
  {
    step: "1",
    title: "Crear una vacante",
    desc: "Ve a Posiciones y crea una nueva posicion. Define titulo, departamento, ubicacion y plazas. Al activarla, aparece en el portal publico de candidatos.",
  },
  {
    step: "2",
    title: "Revisar candidaturas",
    desc: "Las candidaturas del portal aparecen automaticamente en Candidatos en etapa Aplicado. Tambien puedes anadir candidatos manualmente.",
  },
  {
    step: "3",
    title: "Analizar CVs con IA",
    desc: "Entra al perfil del candidato, seccion CV & AI Analysis. Sube el CV o pega el texto. Obtiene evaluacion completa en segundos.",
  },
  {
    step: "4",
    title: "Avanzar en el pipeline",
    desc: "Cambia la etapa del candidato con un clic. El candidato recibe un email automatico informandole del avance.",
  },
  {
    step: "5",
    title: "Programar entrevistas",
    desc: "Ve al modulo de Entrevistas y crea una nueva. Asigna candidato, entrevistador, fecha y modalidad. El candidato recibe confirmacion por email.",
  },
  {
    step: "6",
    title: "Registrar feedback",
    desc: "Tras la entrevista, ve a Feedback y evalua al candidato con puntuacion, fortalezas y recomendacion.",
  },
  {
    step: "7",
    title: "Tomar decision final",
    desc: "Cambia la etapa a Contratado o Rechazado. El candidato recibira la notificacion correspondiente.",
  },
];

const candidateSteps = [
  {
    step: "1",
    title: "Explorar vacantes",
    desc: "Accede a /portal sin registro ni contrasena. Usa el buscador para filtrar por titulo, departamento o ciudad.",
  },
  {
    step: "2",
    title: "Seleccionar la oferta",
    desc: "Haz clic en Apply now en la oferta que te interese para ver los detalles y el formulario de candidatura.",
  },
  {
    step: "3",
    title: "Completar la candidatura",
    desc: "Rellena nombre, email, telefono (opcional), sube tu CV y anade una carta de presentacion si lo deseas.",
  },
  {
    step: "4",
    title: "Enviar y confirmar",
    desc: "Haz clic en Submit Application. Recibiras confirmacion en pantalla y un email de acuse de recibo inmediatamente.",
  },
  {
    step: "5",
    title: "Seguimiento",
    desc: "Recibiras emails automaticos en cada cambio de estado de tu candidatura: avance de etapa, entrevista programada, oferta.",
  },
];

function AccordionModule({ mod }: { mod: typeof modules[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = mod.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0", mod.color)}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-foreground">{mod.title}</span>
          <span className="block text-xs text-muted-foreground">{mod.subtitle}</span>
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border bg-muted/10">
          <p className="text-sm text-foreground leading-relaxed mb-3">{mod.description}</p>
          {mod.downloads && (
            <div className="flex flex-wrap gap-2 mb-4">
              {mod.downloads.map((d, i) => (
                <a
                  key={i}
                  href={d.href}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#00205b]/5 text-[#00205b] hover:bg-[#00205b]/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {d.label}
                </a>
              ))}
            </div>
          )}
          {mod.stages && (
            <div className="flex flex-wrap gap-1.5">
              {mod.stages.map((s, i) => (
                <span key={s} className="flex items-center gap-1 text-xs">
                  <span className="bg-background border border-border px-2 py-0.5 rounded-full text-foreground">{s}</span>
                  {i < mod.stages!.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Help() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const resources = [
    {
      icon: PresentationIcon,
      color: "bg-[#00205b] text-white",
      borderColor: "border-[#00205b]/20",
      label: "Presentación para dirección",
      desc: "7 diapositivas con el impacto, arquitectura y roadmap de Vera Hiring Tracker",
      href: "/vera-pitch-deck/",
      badge: "Pitch Deck",
      badgeColor: "bg-[#00205b]/10 text-[#00205b]",
    },
    {
      icon: Play,
      color: "bg-[#0D9488] text-white",
      borderColor: "border-[#0D9488]/20",
      label: "Vídeo explicativo",
      desc: "Animación interactiva que muestra el análisis de CV con IA y las ventajas competitivas",
      href: "/vera-video-explainer/",
      badge: "Vídeo",
      badgeColor: "bg-[#0D9488]/10 text-[#0D9488]",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00205b]">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Centro de Ayuda</h1>
            <p className="text-sm text-muted-foreground">Vera Talent Acquisition Platform</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vera Hiring Tracker es una plataforma digital de gestion del talento que centraliza todo el ciclo de
          seleccion: desde la publicacion de vacantes hasta la contratacion, con IA integrada para el analisis de CVs y
          comunicacion automatica con candidatos.
        </p>
      </div>

      {/* Resources section */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Recursos de presentacion</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((r) => {
            const Icon = r.icon;
            return (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex gap-4 p-4 border rounded-xl hover:shadow-md transition-all group bg-background",
                  r.borderColor
                )}
              >
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0", r.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground group-hover:underline">{r.label}</span>
                    <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", r.badgeColor)}>{r.badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
              </a>
            );
          })}
        </div>
      </section>

      {/* Modules */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Modulos de la plataforma</h2>
        <div className="space-y-2">
          {modules.map((mod) => (
            <AccordionModule key={mod.title} mod={mod} />
          ))}
        </div>
      </section>

      {/* Email notifications */}
      <section className="bg-muted/30 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#00205b]" />
          <h2 className="text-sm font-semibold text-foreground">Notificaciones automaticas</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          La plataforma envia emails automaticos a los candidatos en los siguientes momentos:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Candidatura recibida",
            "Cambio de etapa en el pipeline",
            "Entrevista programada (con fecha y hora)",
            "Oferta extendida",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* HR guide */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-1">Guia para el equipo de RR.HH.</h2>
        <p className="text-sm text-muted-foreground mb-4">Flujo de trabajo recomendado paso a paso.</p>
        <div className="space-y-3">
          {hrSteps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00205b] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Candidate guide */}
      <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-[#00205b]" />
          <h2 className="text-sm font-semibold text-foreground">Guia para candidatos</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          El portal es publico: los candidatos no necesitan crear cuenta. Acceso en{" "}
          <a
            href={`${basePath}/portal`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00205b] underline font-medium"
          >
            /portal
          </a>
        </p>
        <div className="space-y-3">
          {candidateSteps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-[#00205b]/30 text-[#00205b] text-xs font-bold flex items-center justify-center mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Accesos rapidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Portal publico", path: `${basePath}/portal`, external: true },
            { label: "Dashboard", path: "/" },
            { label: "Candidatos", path: "/candidates" },
            { label: "Posiciones", path: "/positions" },
            { label: "Entrevistas", path: "/interviews" },
            { label: "Feedback", path: "/feedback" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.external ? link.path : `${basePath}${link.path}`}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted/40 hover:border-[#00205b]/30 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#00205b]" />
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
