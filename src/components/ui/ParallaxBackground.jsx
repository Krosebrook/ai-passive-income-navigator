import { useScroll, useTransform, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ParallaxBackground() {
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 100]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-animated" />
      
      <motion.div
        style={{ y: y1, x: mousePosition.x * 0.5 }}
        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full bg-purple-500 blur-[120px]" />
      </motion.div>
      
      <motion.div
        style={{ y: y2, x: mousePosition.x * -0.3 }}
        className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full opacity-25"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-full h-full bg-indigo-500 blur-[100px]" />
      </motion.div>
      
      <motion.div
        style={{ y: y3, x: mousePosition.y * 0.2 }}
        className="absolute top-[50%] left-[50%] w-[350px] h-[350px] rounded-full opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="w-full h-full bg-violet-500 blur-[90px]" />
      </motion.div>
      
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 133, 247, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 133, 247, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 6, 24, 0.4) 100%)'
        }}
      />
    </div>
  );
}