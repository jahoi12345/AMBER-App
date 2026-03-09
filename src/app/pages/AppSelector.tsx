import { Link } from "react-router";
import { User, Users, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../lib/soundUtils";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  duration: number;
  color: string;
  type: 'star' | 'diamond';
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function AppSelector() {
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gemPulse, setGemPulse] = useState(false);
  const [glowFlare, setGlowFlare] = useState(false);
  const [flashPosition, setFlashPosition] = useState<{ x: number; y: number } | null>(null);
  const gemRef = useRef<HTMLDivElement>(null);

  const handleGemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    playSound("navSelect");
    // Use the gem element's rect so flash (inside gem) and particles share the same coordinate system
    const rect = gemRef.current?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Trigger gem reactions
    setGemPulse(true);
    setGlowFlare(true);
    setFlashPosition({ x: offsetX, y: offsetY });
    
    setTimeout(() => setGemPulse(false), 250);
    setTimeout(() => setGlowFlare(false), 250);
    setTimeout(() => setFlashPosition(null), 200);

    // Generate particles
    const colors = ['#F5C784', '#E8873A', '#FFDF8A', '#C4601A'];
    const particleCount = 12 + Math.floor(Math.random() * 5); // 12-16 particles
    const newParticles: Particle[] = [];
    
    let lastColor = '';
    for (let i = 0; i < particleCount; i++) {
      // Ensure no two adjacent particles have the same color
      let color = colors[Math.floor(Math.random() * colors.length)];
      while (color === lastColor && colors.length > 1) {
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      lastColor = color;
      
      const type = Math.random() < 0.6 ? 'star' : 'diamond'; // More stars than diamonds
      const size = type === 'star' 
        ? 6 + Math.random() * 4 // 6-10px
        : 3 + Math.random() * 2; // 3-5px for diamond width
      
      const angleRad = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 60;
      newParticles.push({
        id: Date.now() + i,
        angle: angleRad,
        distance: dist,
        duration: 600 + Math.random() * 200, // 600-800ms
        color,
        type,
        size,
        startX: offsetX,
        startY: offsetY,
        endX: offsetX + Math.cos(angleRad) * dist,
        endY: offsetY + Math.sin(angleRad) * dist,
      });
    }
    
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 1000);
  };

  return (
    <div 
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        boxSizing: 'border-box',
        backgroundColor: '#FDF0DC',
        position: 'relative',
      }}
    >
      {/* Radial gradient overlay - large, centered at 40% from top */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(245, 199, 132, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Second radial glow - smaller, behind the gem */}
      <div 
        className="absolute"
        style={{
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(232, 135, 58, 0.10) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise/grain texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          opacity: 1,
        }}
      />

      {/* Floating ambient dots */}
      <motion.div
        className="absolute"
        style={{
          top: '18%',
          left: '25%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#E8873A',
          opacity: 0.35,
        }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute"
        style={{
          top: '25%',
          right: '30%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#E8873A',
          opacity: 0.20,
        }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '20%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#E8873A',
          opacity: 0.25,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        
        {/* Wordmark at 22% from top */}
        <div className="flex items-center justify-center" style={{ marginBottom: '0px' }}>
          {/* Left decorative rule */}
          <div 
            style={{
              width: '40px',
              height: '0.5px',
              backgroundColor: '#C4601A',
              opacity: 0.30,
              marginRight: '12px',
            }}
          />
          
          <h1 
            className="italic"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '72px',
              fontWeight: 300,
              color: '#2C1A0E',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            amber
          </h1>

          {/* Right decorative rule */}
          <div 
            style={{
              width: '40px',
              height: '0.5px',
              backgroundColor: '#C4601A',
              opacity: 0.30,
              marginLeft: '12px',
            }}
          />
        </div>

        {/* Center hero - Amber Gem with pulse animation */}
        <div className="flex flex-col items-center" style={{ margin: '12px 0' }}>
          <div 
            onClick={handleGemClick}
            style={{ 
              position: 'relative',
              cursor: 'pointer',
              zIndex: 20,
              display: 'inline-block',
              width: 'fit-content',
            }}
          >
            {/* Glow flare container */}
            <motion.div
              animate={{
                scale: glowFlare ? 1.75 : 1,
                opacity: glowFlare ? 0.8 : 0.55,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '83.33px',
                height: '100px',
                filter: 'blur(40px)',
                backgroundColor: 'rgba(232, 135, 58, 0.55)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Gem with pulse and tap reaction */}
            <motion.div
              ref={gemRef}
              animate={{
                scale: gemPulse ? [1.0, 1.15, 1.0] : [1.0, 1.06, 1.0],
              }}
              transition={
                gemPulse
                  ? {
                      duration: 0.25,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                    }
                  : {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              style={{
                position: 'relative',
                filter: 'drop-shadow(0px 0px 40px rgba(232, 135, 58, 0.55)) drop-shadow(0px 0px 80px rgba(245, 199, 132, 0.30))',
                zIndex: 2,
              }}
            >
              {/* Faceted Gem SVG */}
              <svg width="100" height="120" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Define radial gradient */}
                <defs>
                  <radialGradient id="gemGradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#FFDF8A" />
                    <stop offset="50%" stopColor="#E8873A" />
                    <stop offset="100%" stopColor="#A8440A" />
                  </radialGradient>
                </defs>
                
                {/* Octagonal gem shape */}
                <path 
                  d="M 40 4 L 64 20 L 76 48 L 64 76 L 40 92 L 16 76 L 4 48 L 16 20 Z" 
                  fill="url(#gemGradient)"
                />
                
                {/* Inner facet lines */}
                <line x1="40" y1="48" x2="16" y2="20" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                <line x1="40" y1="48" x2="64" y2="20" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                <line x1="40" y1="48" x2="76" y2="48" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                <line x1="40" y1="48" x2="64" y2="76" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                <line x1="40" y1="48" x2="16" y2="76" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                <line x1="40" y1="48" x2="4" y2="48" stroke="#F5C784" strokeWidth="0.5" opacity="0.40" />
                
                {/* Specular highlight */}
                <ellipse cx="32" cy="32" rx="4" ry="3" fill="white" opacity="0.80" />
              </svg>

              {/* Center flash on tap */}
              <AnimatePresence>
                {flashPosition && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: 'absolute',
                      top: `${flashPosition.y}px`,
                      left: `${flashPosition.x}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Particle burst container */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      initial={{
                        left: particle.startX,
                        top: particle.startY,
                        opacity: 1,
                        scale: 1,
                      }}
                      animate={{
                        left: particle.endX,
                        top: particle.endY,
                        opacity: 0,
                        scale: 0.3,
                      }}
                      transition={{
                        duration: particle.duration / 1000,
                        ease: "easeOut",
                      }}
                      style={{
                        position: "absolute",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                      }}
                    >
                      {particle.type === "star" ? (
                        <svg
                          width={particle.size}
                          height={particle.size}
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M 5 0 L 5.8 4.2 L 10 5 L 5.8 5.8 L 5 10 L 4.2 5.8 L 0 5 L 4.2 4.2 Z"
                            fill={particle.color}
                          />
                        </svg>
                      ) : (
                        <svg
                          width={particle.size}
                          height={particle.size * 2.67}
                          viewBox="0 0 3 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M 1.5 0 L 3 4 L 1.5 8 L 0 4 Z" fill={particle.color} />
                        </svg>
                      )}
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Tagline */}
          <p 
            className="text-center"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '19px',
              fontWeight: 400,
              color: '#7A5A3A',
              letterSpacing: '0.12em',
              marginTop: '8px',
              marginBottom: '20px',
            }}
          >
            Your time, made whole.
          </p>

          {/* Sensory descriptors */}
          <p 
            className="text-center"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: '#B08060',
              letterSpacing: '0.18em',
              textTransform: 'lowercase',
              marginBottom: '40px',
            }}
          >
            presence · memory · warmth
          </p>
        </div>

        {/* Selection Cards - positioned in bottom portion */}
        <div className="flex flex-col mt-auto" style={{ gap: '12px', marginLeft: '24px', marginRight: '24px', marginBottom: '8vh' }}>
          
          {/* Card 1 - My View */}
          <Link
            to="/user"
            onClick={() => playSound("navSelect")}
            onMouseDown={() => setPressedCard('user')}
            onMouseUp={() => setPressedCard(null)}
            onMouseLeave={() => setPressedCard(null)}
            className="flex items-center justify-between transition-all duration-180"
            style={{
              height: '88px',
              borderRadius: '24px',
              backgroundColor: '#FFFAF3',
              border: '1px solid rgba(196, 96, 26, 0.12)',
              boxShadow: pressedCard === 'user' 
                ? '0px 2px 8px rgba(160, 80, 20, 0.06)' 
                : '0px 4px 16px rgba(160, 80, 20, 0.09)',
              transform: pressedCard === 'user' ? 'scale(0.98)' : 'scale(1)',
              padding: '0 20px',
            }}
          >
            <div className="flex items-center">
              {/* Icon Circle */}
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#C4601A',
                  flexShrink: 0,
                  paddingTop: '2px',
                }}
              >
                <User size={20} color="white" strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <div style={{ marginLeft: '16px' }}>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#2C1A0E',
                    letterSpacing: '0',
                    lineHeight: 1.2,
                    marginBottom: '6px',
                  }}
                >
                  My View
                </div>
                <div 
                  style={{
                    fontFamily: '"Freight Text Pro", "Libre Baskerville", serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: '#9A7A60',
                    letterSpacing: '0.02em',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Your time companion
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight 
              size={16} 
              strokeWidth={1.5}
              style={{ 
                color: '#C4601A',
                opacity: 0.70,
                flexShrink: 0,
              }}
            />
          </Link>

          {/* Card 2 - Family View */}
          <Link
            to="/family"
            onClick={() => playSound("navSelect")}
            onMouseDown={() => setPressedCard('family')}
            onMouseUp={() => setPressedCard(null)}
            onMouseLeave={() => setPressedCard(null)}
            className="flex items-center justify-between transition-all duration-180"
            style={{
              height: '88px',
              borderRadius: '24px',
              backgroundColor: '#FFFAF3',
              border: '1px solid rgba(196, 96, 26, 0.12)',
              boxShadow: pressedCard === 'family' 
                ? '0px 2px 8px rgba(160, 80, 20, 0.06)' 
                : '0px 4px 16px rgba(160, 80, 20, 0.09)',
              transform: pressedCard === 'family' ? 'scale(0.98)' : 'scale(1)',
              padding: '0 20px',
            }}
          >
            <div className="flex items-center">
              {/* Icon Circle */}
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#C4601A',
                  flexShrink: 0,
                  paddingTop: '2px',
                }}
              >
                <Users size={20} color="white" strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <div style={{ marginLeft: '16px' }}>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#2C1A0E',
                    letterSpacing: '0',
                    lineHeight: 1.2,
                    marginBottom: '6px',
                  }}
                >
                  Family View
                </div>
                <div 
                  style={{
                    fontFamily: '"Freight Text Pro", "Libre Baskerville", serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: '#9A7A60',
                    letterSpacing: '0.02em',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Stay close to those you love
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight 
              size={16} 
              strokeWidth={1.5}
              style={{ 
                color: '#C4601A',
                opacity: 0.70,
                flexShrink: 0,
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}