const fs = require('fs');

const file = 'frontend/src/screens/Home.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard glassmorphism classes with liquid glass classes.
// Liquid glass features: higher blur, more distinct borders/shimmer, organic border radii, strong drop shadows
const liquidBase = 'backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 rounded-[2rem] sm:rounded-[3rem] transition-all duration-500 hover:rounded-[1rem] hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.45)]';

const glassClassesToReplace = [
    {
        search: /backdrop-blur-md \$\{isDarkMode \? 'bg-gray-800\/40 border-white\/10' : 'bg-white\/40 border-white\/20'\}/g,
        replace: `backdrop-blur-xl \${isDarkMode ? 'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]' : 'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]'} rounded-3xl transition-all duration-500 hover:scale-[1.02]`
    },
    {
        search: /backdrop-blur-md \$\{isDarkMode \? 'bg-gray-900\/40 border-white\/10' : 'bg-white\/40 border-white\/40'\}/g,
        replace: `backdrop-blur-xl \${isDarkMode ? 'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]' : 'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]'} rounded-[2.5rem] transition-all duration-500`
    },
    {
        search: /backdrop-blur-md \$\{isDarkMode \? 'bg-blue-900\/40 border-blue-400\/20' : 'bg-white\/40 border-white\/50'\}/g,
        replace: `backdrop-blur-xl \${isDarkMode ? 'bg-blue-900/[0.1] border-blue-400/20 shadow-[0_4px_32px_-1px_rgba(59,130,246,0.3)]' : 'bg-white/[0.2] border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]'} rounded-[3rem] hover:rounded-[2rem] transition-all duration-700`
    },
    {
        search: /backdrop-blur-md \$\{isDarkMode \? 'bg-gray-900\/40 border-white\/10' : 'bg-white\/40 border-white\/20'\}/g, // footer
        replace: `backdrop-blur-xl \${isDarkMode ? 'bg-white/[0.05] border-white/10' : 'bg-white/[0.1] border-white/30'}`
    }
];

glassClassesToReplace.forEach(rep => {
    content = content.replace(rep.search, rep.replace);
});

// Let's modify the AnimatedBg to be more liquid-like (morphing blobs)
content = content.replace(
    `filter="url(#blur)"`,
    `filter="url(#liquid-blur)"`
);

content = content.replace(
    `<filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
          </filter>`,
    `<filter id="liquid-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10" result="liquid" />
            <feBlend in="SourceGraphic" in2="liquid" />
          </filter>`
);

content = content.replace(
    `className="w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-blue-400/50 rounded-full mix-blend-screen"`,
    `className="w-[40vw] h-[40vw] min-w-[350px] min-h-[350px] bg-blue-500/60 mix-blend-screen" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}`
);
content = content.replace(
    `className="w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-purple-400/50 rounded-full mix-blend-screen"`,
    `className="w-[35vw] h-[35vw] min-w-[350px] min-h-[350px] bg-purple-500/60 mix-blend-screen" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}`
);
content = content.replace(
    `className="w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-indigo-400/50 rounded-full mix-blend-screen"`,
    `className="w-[30vw] h-[30vw] min-w-[350px] min-h-[350px] bg-indigo-500/60 mix-blend-screen" style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}`
);


fs.writeFileSync(file, content);
console.log('Home.jsx updated with liquid glass modifications.');
