const fs = require('fs');

const file = 'frontend/src/screens/Home.jsx';
let content = fs.readFileSync(file, 'utf8');

// The AnimatedBg could use Framer Motion for actual moving liquid effect instead of static shapes.
const newAnimatedBg = `const AnimatedBg = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className={\`absolute inset-0 transition-colors duration-700 \${isDarkMode ? 'bg-gray-950' : 'bg-[#e0eaf5]'}\`} />

      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10" result="liquid" />
            <feBlend in="SourceGraphic" in2="liquid" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{ filter: "url(#liquid-blur)", opacity: isDarkMode ? 0.6 : 0.8 }}
      >
        <motion.div
          animate={{
            x: ['-10%', '20%', '-10%'],
            y: ['-10%', '20%', '-10%'],
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            borderRadius: ['40% 60% 70% 30% / 40% 50% 60% 50%', '60% 40% 30% 70% / 60% 30% 70% 40%', '40% 60% 70% 30% / 40% 50% 60% 50%']
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] min-w-[350px] min-h-[350px] bg-blue-500/60 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: ['10%', '-20%', '10%'],
            y: ['20%', '-10%', '20%'],
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 70% 70% 30% / 30% 30% 70% 70%', '60% 40% 30% 70% / 60% 30% 70% 40%']
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] min-w-[350px] min-h-[350px] bg-purple-500/60 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: ['0%', '30%', '0%'],
            y: ['0%', '30%', '0%'],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 0],
            borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', '40% 60% 70% 30% / 40% 50% 60% 50%', '30% 70% 70% 30% / 30% 30% 70% 70%']
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[30%] w-[30vw] h-[30vw] min-w-[350px] min-h-[350px] bg-indigo-500/60 mix-blend-screen"
        />
      </div>
    </div>
  );
};`;

content = content.replace(/const AnimatedBg = \(\{ isDarkMode \}\) => \{[\s\S]*?^  \);[\n\r]\};/m, newAnimatedBg);

fs.writeFileSync(file, content);
console.log('AnimatedBg updated with motion effects.');
