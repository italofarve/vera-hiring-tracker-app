import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1600),
      setTimeout(() => setPhase(5), 2000),
      setTimeout(() => setPhase(6), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const emails = [
    "Candidatura Recibida",
    "Cambio de Etapa",
    "Entrevista Programada",
    "Oferta Extendida"
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center px-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-1/2 pr-12">
        <motion.h2 
          className="text-[4vw] font-bold leading-tight mb-6"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          Comunicación<br/><span className="text-[var(--color-accent)]">Automatizada</span>
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Portal público de candidatos y notificaciones por email en hitos clave.
        </motion.p>
      </div>

      <div className="w-1/2 flex flex-col gap-4">
        {emails.map((email, i) => (
          <motion.div 
            key={i}
            className="glass-panel p-6 rounded-xl flex items-center gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={phase >= 2 + i ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                 <polyline points="22,6 12,13 2,6"></polyline>
               </svg>
            </div>
            <div className="text-[1.3vw] font-semibold">{email}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}