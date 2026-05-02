import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  const stages = [
    'Aplicado', 
    'Preselección', 
    'Entrevista Técnica', 
    'Entrevista RR.HH.', 
    'Entrevista Final', 
    'Oferta', 
    'Contratado'
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center px-12"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3.5vw] font-bold mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        Pipeline de Selección Completo
      </motion.h2>

      <div className="w-full max-w-[80vw] relative h-32">
        {/* Connecting line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-[var(--color-accent)] -translate-y-1/2 rounded-full"
          initial={{ width: "0%" }}
          animate={phase >= 2 ? { width: "100%" } : { width: "0%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Nodes */}
        <div className="absolute inset-0 flex justify-between items-center">
          {stages.map((stage, i) => (
            <motion.div 
              key={i}
              className="flex flex-col items-center relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: 0.5 + (i * 0.25), type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-bg-dark)] border-4 border-[var(--color-accent)] z-10 shadow-[0_0_15px_var(--color-accent)]" />
              <div className="absolute top-10 text-center w-32 text-[1vw] text-[var(--color-text-secondary)] font-medium leading-tight">
                {stage}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}