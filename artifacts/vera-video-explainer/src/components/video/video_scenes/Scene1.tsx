import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/office-bg.png)` }}
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 4, ease: "linear" }}
      />
      
      <div className="z-10 flex flex-col items-center">
        <motion.div 
          className="w-[120px] h-[120px] rounded-2xl mb-8 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 relative"
          initial={{ y: 50, opacity: 0, rotateX: -30 }}
          animate={phase >= 1 ? { y: 0, opacity: 1, rotateX: 0 } : { y: 50, opacity: 0, rotateX: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          {/* Logo V icon */}
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15L30 50L50 15" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        <motion.h1 
          className="text-[5vw] font-bold leading-none tracking-tight text-glow"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Vera Hiring Tracker
        </motion.h1>

        <motion.p 
          className="mt-6 text-[1.5vw] text-[var(--color-text-secondary)] font-medium tracking-wide uppercase"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={phase >= 3 ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
        >
          Plataforma de gestión de talento para el sector financiero
        </motion.p>
      </div>
    </motion.div>
  );
}