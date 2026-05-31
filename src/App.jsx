import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';

const COLORS = ['bg-pink-400', 'bg-lime-400', 'bg-cyan-400', 'bg-yellow-400', 'bg-purple-400'];

const SENTENCE_TEMPLATES = [
  "[Name] just rode a flying pig to the moon!",
  "Oh no! [Name]'s ice cream cone is doing a silly dance!",
  "[Name] found a magical potato that grants wishes!",
  "Look! [Name] is wearing pants on their head!",
  "Captain [Name] just discovered a planet made of jellybeans!",
  "[Name]'s pet dinosaur loves eating tickle monsters!",
  "Whoosh! [Name] is sliding down a rainbow on a banana peel!",
  "[Name] built a rocket ship out of cardboard and bubblegum!",
  "Did you see? [Name] can juggle five fluffy bunny rabbits!",
  "[Name]'s socks just flew away like birds!",
  "Wow! [Name] is having a tea party with a friendly alien!",
  "[Name] sneezed and a bunch of butterflies came out!",
  "Look out! [Name] is bouncing on a giant marshmallow!",
  "[Name] is the champion of silly face making!",
  "A little bird told me [Name] sleeps in a bed of marshmallows!",
  "[Name] painted the sky purple with a giant magic brush!",
  "Oh my! [Name] turned all the broccoli into chocolate cake!",
  "[Name] is racing a cheetah while riding a giant turtle!",
  "Look up! [Name] is floating away on a giant soap bubble!",
  "[Name] has a secret superpower: making everyone giggle!"
];

// Confetti particle component
const Particle = ({ x, y }) => {
  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{
        x: x + (Math.random() - 0.5) * 200,
        y: y + (Math.random() - 0.5) * 200 + 100, // fall down a bit
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 360
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`absolute w-3 h-3 rounded-full ${COLORS[Math.floor(Math.random() * COLORS.length)]} z-50`}
    />
  );
};

// Balloon component
const Balloon = ({ char, color, initialX, id }) => {
  const [popped, setPopped] = useState(false);
  const [particles, setParticles] = useState([]);

  if (popped && particles.length === 0) return null;

  const handlePop = (e) => {
    if (popped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Generate particles
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({ id: i, x, y }));
    setParticles(newParticles);
    setPopped(true);
    
    // Clean up particles
    setTimeout(() => setParticles([]), 1000);
  };

  return (
    <>
      {!popped && (
        <motion.div
          initial={{ y: '100vh', x: initialX, opacity: 0, scale: 0 }}
          animate={{ 
            y: `${10 + Math.random() * 20}vh`, 
            x: [initialX, initialX + 30, initialX - 30, initialX],
            opacity: 1, 
            scale: 1 
          }}
          transition={{ 
            y: { duration: 3 + Math.random() * 2, ease: 'easeOut' },
            x: { duration: 4 + Math.random() * 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
            opacity: { duration: 0.5 },
            scale: { type: 'spring', stiffness: 300, damping: 15 }
          }}
          onClick={handlePop}
          className={`absolute w-16 h-20 rounded-t-[50%] rounded-b-[40%] flex items-center justify-center text-3xl font-bold text-white shadow-lg cursor-pointer ${color}`}
          style={{
            boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2)'
          }}
        >
          {char}
          <div className="absolute -bottom-6 w-1 h-8 bg-white/50 rounded-full" style={{ transformOrigin: 'top', transform: 'rotate(10deg)' }}></div>
        </motion.div>
      )}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} />
      ))}
    </>
  );
};

export default function App() {
  const [name, setName] = useState('');
  const [balloons, setBalloons] = useState([]);
  const [sentence, setSentence] = useState('');
  const [typedSentence, setTypedSentence] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // We only want to add NEW balloons, not re-render old ones. 
    // By keeping the id stable `index-char`, React's key handles this.
    const newBalloons = name.split('').map((char, index) => {
      // Calculate a random initial X for the balloon, keeping it within bounds
      // Use index to deterministically seed the X so it doesn't jump, but Math.random on creation is fine if we cache it
      // Wait, if it re-renders, Math.random() will give a new X. We should cache the X.
      return {
        id: `${index}-${char}`,
        char,
        color: COLORS[index % COLORS.length]
      };
    });

    // To prevent X from changing on every keystroke for existing letters, we merge state:
    setBalloons(prev => {
      return newBalloons.map(nb => {
        const existing = prev.find(p => p.id === nb.id);
        if (existing) return existing; // Keep existing balloon with its X
        return {
          ...nb,
          initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 100 : 800) + 50
        };
      });
    });
  }, [name]);

  const generateMagic = () => {
    if (!name) return;
    const randomTemplate = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
    const newSentence = randomTemplate.replace(/\[Name\]/g, name);
    setSentence(newSentence);
    setTypedSentence('');
    setIsTyping(true);
  };

  useEffect(() => {
    if (isTyping && typedSentence.length < sentence.length) {
      const timeout = setTimeout(() => {
        setTypedSentence(sentence.slice(0, typedSentence.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else if (isTyping && typedSentence.length === sentence.length) {
      setIsTyping(false);
    }
  }, [typedSentence, sentence, isTyping]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-600 to-sky-400 overflow-hidden relative flex flex-col items-center justify-end pb-24">
      
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%'
            }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
          />
        ))}
      </div>

      <AnimatePresence>
        {balloons.map((b) => (
          <Balloon key={b.id} {...b} />
        ))}
      </AnimatePresence>

      <div className="z-10 w-full max-w-2xl px-6 flex flex-col items-center gap-8">
        
        {sentence && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-2xl text-center w-full cursor-pointer"
            onClick={() => {
                // simple visual feedback on click
                const colors = ['#f472b6', '#a3e635', '#22d3ee', '#facc15', '#c084fc'];
                const box = document.createElement('div');
                box.className = 'fixed inset-0 pointer-events-none flex items-center justify-center z-50';
                for(let i=0; i<20; i++) {
                    const spark = document.createElement('div');
                    spark.style.position = 'absolute';
                    spark.style.width = '10px';
                    spark.style.height = '10px';
                    spark.style.borderRadius = '50%';
                    spark.style.background = colors[Math.floor(Math.random() * colors.length)];
                    spark.style.transition = 'all 0.6s ease-out';
                    box.appendChild(spark);
                    
                    setTimeout(() => {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * 150 + 50;
                        spark.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0)`;
                        spark.style.opacity = '0';
                    }, 10);
                }
                document.body.appendChild(box);
                setTimeout(() => box.remove(), 1000);
            }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-wide leading-relaxed drop-shadow-md">
              {typedSentence}
              {isTyping && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>}
            </h2>
          </motion.div>
        )}

        <motion.div 
          className="relative w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="🎈 Type your name here..."
            className="w-full text-center text-4xl p-6 rounded-full border-4 border-white/50 bg-white/90 backdrop-blur-md text-purple-900 placeholder-purple-400/50 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/30 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all font-bold"
            maxLength={15}
          />
        </motion.div>

        <motion.button
          onClick={generateMagic}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white text-3xl font-bold px-10 py-5 rounded-full shadow-[0_10px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-[10px] transition-all border-4 border-white/30"
        >
          <Wand2 size={36} className="animate-bounce" />
          Generate Magic!
        </motion.button>
      </div>
    </div>
  );
}
