import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 2500),
      setTimeout(() => setPhase(6), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute left-0 top-0 w-[40%] h-full flex flex-col justify-center px-16 z-20">
        <motion.h2 
          className="text-[4vw] font-bold leading-tight"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          Análisis de CV con IA
        </motion.h2>
        
        <motion.div 
          className="h-1 w-24 bg-[var(--color-accent)] my-8"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          style={{ originX: 0 }}
          transition={{ duration: 0.6 }}
        />

        <motion.div 
          className="flex items-end gap-4"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          <span className="text-[5vw] font-bold text-[var(--color-accent)] leading-none">{'< 30s'}</span>
          <span className="text-[1.5vw] text-[var(--color-text-secondary)] pb-2">vs 10 min manual</span>
        </motion.div>
        
        <motion.p
           className="mt-4 text-[1.2vw] text-[var(--color-text-muted)] uppercase tracking-wider"
           initial={{ opacity: 0 }}
           animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          Reducción del 70% en tiempo de criba
        </motion.p>
      </div>

      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[50%] h-[70%] z-10 perspective-[1000px]">
        <motion.div 
          className="w-full h-full glass-panel rounded-2xl p-8 relative flex flex-col gap-4"
          initial={{ rotateY: 30, opacity: 0, x: 100 }}
          animate={phase >= 2 ? { rotateY: -10, opacity: 1, x: 0 } : { rotateY: 30, opacity: 0, x: 100 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
           <motion.div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-20 blur-xl rounded-2xl" />
           
           {['Resumen Ejecutivo', 'Valoración: 5 Estrellas', 'Adecuación Financiera: Alta'].map((text, i) => (
             <motion.div 
               key={i}
               className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
               initial={{ opacity: 0, x: 50 }}
               animate={phase >= 3 + i ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
               transition={{ type: 'spring', stiffness: 300, damping: 25 }}
             >
               <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                 <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
               </div>
               <span className="text-[1.2vw] font-medium">{text}</span>
             </motion.div>
           ))}
        </motion.div>
      </div>
    </motion.div>
  );
}