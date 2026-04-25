const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/screens/Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update AnimatedBg Component
const newAnimatedBg = `const AnimatedBg = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg width="0" height="0" className="absolute">
        <filter id="liquid-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="liquid" />
          <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
        </filter>
      </svg>
      <div className="absolute inset-0" style={{ filter: 'url(#liquid-filter)', opacity: isDarkMode ? 0.4 : 0.7 }}>
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.2, 0.9, 1],
            borderRadius: ['40%', '60%', '30%', '40%']
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[40vw] h-[40vw] top-[10%] left-[10%] bg-blue-400 mix-blend-multiply filter blur-3xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, -120, 80, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.3, 0.8, 1],
            borderRadius: ['50%', '30%', '60%', '50%']
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute w-[35vw] h-[35vw] top-[30%] right-[15%] bg-purple-400 mix-blend-multiply filter blur-3xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, 80, -60, 0],
            y: [0, 100, -80, 0],
            scale: [1, 1.1, 0.9, 1],
            borderRadius: ['30%', '50%', '40%', '30%']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute w-[45vw] h-[45vw] bottom-[10%] left-[25%] bg-indigo-400 mix-blend-multiply filter blur-3xl opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[100px]" />
    </div>
  );
};`;

content = content.replace(/const AnimatedBg = \(\) => {[\s\S]*?(?=const TextType =)/, newAnimatedBg + '\n\n');

// 2. Update all sections to use Liquid Glassmorphism styles
// Hero Section
content = content.replace(/<section className="relative flex flex-col items-center justify-center min-h-screen text-center">/, '<section className="relative flex flex-col items-center justify-center min-h-screen text-center z-10">');

// General Regex Replacement for basic container sections
const regexes = [
  // Features
  {
    search: /<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-900' : 'bg-gray-100'\}`\}>/g,
    replace: '<section className="relative px-4 py-20 z-10">'
  },
  {
    search: /<div className="max-w-6xl mx-auto">/,
    replace: '<div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] hover:rounded-[1rem] transition-all duration-500`}>'
  },
  // Popular Use Cases
  {
    search: /<section className=\{`py-20 \$\{isDarkMode \? 'bg-gray-900\/80' : 'bg-white'\}`\}>/,
    replace: '<section className="relative py-20 z-10">'
  },
  {
    search: /<div className="max-w-6xl mx-auto">/,
    replace: '<div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] hover:rounded-[3rem] transition-all duration-500`}>'
  },
  // Why Choose ChatRaj
  {
    search: /<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-900\/50' : 'bg-white'\}`\}>/,
    replace: '<section className="relative px-4 py-20 z-10">'
  },
  {
    search: /<div className="max-w-6xl mx-auto">/,
    replace: '<div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] hover:rounded-[1.5rem] transition-all duration-500`}>'
  },
  // Powered By
  {
    search: /<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-800' : 'bg-gray-100'\}`\}>/,
    replace: '<section className="relative px-4 py-20 z-10">'
  },
  {
    search: /<div className="max-w-6xl mx-auto">/,
    replace: '<div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] hover:rounded-[2.5rem] transition-all duration-500`}>'
  },
  // How It Works
  {
    search: /<section className=\{`px-4 py-20 overflow-x-auto \$\{isDarkMode \? 'bg-gray-900\/70' : 'bg-white'\}`\}>/,
    replace: '<section className="relative px-4 py-20 overflow-x-auto z-10">'
  },
  {
    search: /<div className="flex flex-col items-center w-full max-w-6xl gap-12 mx-auto md:flex-row">/,
    replace: '<div className={`flex flex-col items-center w-full max-w-6xl gap-12 mx-auto md:flex-row p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2.5rem] transition-all duration-500`}>'
  },
  // Project Showcase
  {
    search: /<section className=\{`py-20 \$\{isDarkMode \? 'bg-white\/5' : 'bg-white'\}`\}>/,
    replace: '<section className="relative py-20 z-10">'
  },
  {
    search: /<div className="max-w-4xl mx-auto">/,
    replace: '<div className={`max-w-4xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] transition-all duration-500`}>'
  },
  // User Leaderboard
  {
    search: /<section className=\{`py-20 \$\{isDarkMode \? 'bg-gray-100\/10' : 'bg-gray-100'\}`\}>/,
    replace: '<section className="relative py-20 z-10">'
  },
  {
    search: /<div className="max-w-4xl mx-auto">/,
    replace: '<div className={`max-w-4xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] transition-all duration-500`}>'
  },
  // FAQ
  {
    search: /<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-800\/80' : 'bg-gray-100'\}`\}>/,
    replace: '<section className="relative px-4 py-20 z-10">'
  },
  {
    search: /<div className="max-w-4xl mx-auto">/,
    replace: '<div className={`max-w-4xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2rem] transition-all duration-500`}>'
  },
  // Blogs
  {
    search: /<section className="py-20">/,
    replace: '<section className="relative py-20 z-10">'
  },
  {
    search: /<div className="max-w-6xl mx-auto">/,
    replace: '<div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2.5rem] transition-all duration-500`}>'
  },
  // ContactUs
  {
    search: /<ContactUs \/>/,
    replace: '<section className="relative py-20 z-10 px-4">\n        <div className={`max-w-6xl mx-auto p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]\' : \'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]\'} rounded-[2.5rem] transition-all duration-500`}>\n            <ContactUs />\n        </div>\n      </section>'
  },
  // Stay Updated
  {
    search: /<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-blue-900\/80' : 'bg-gray-100'\}`\}>/,
    replace: '<section className="relative px-4 py-20 z-10">'
  },
  {
    search: /<div className="max-w-xl mx-auto text-center">/,
    replace: '<div className={`max-w-xl mx-auto text-center p-8 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? \'bg-blue-900/[0.1] border-blue-400/20 shadow-[0_4px_32px_-1px_rgba(59,130,246,0.3)]\' : \'bg-white/[0.2] border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]\'} rounded-[3rem] hover:rounded-[2rem] transition-all duration-700`}>'
  },
  // Footer
  {
    search: /<footer className=\{`px-8 py-6 mt-0 text-center \$\{isDarkMode \? 'bg-gray-900' : 'bg-gray-200'\}`\}>/,
    replace: '<footer className={`relative z-10 px-8 py-6 mt-0 text-center border-t backdrop-blur-xl ${isDarkMode ? \'bg-white/[0.05] border-white/10\' : \'bg-white/[0.1] border-white/30\'}`}>'
  }
];

// Note: Using a slightly different approach for replace since some strings appear multiple times
// I will just iterate and replace first occurrences of the specific section tags sequentially

let newContent = content;

// Replace all section headers
newContent = newContent.replace(/<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-900' : 'bg-gray-100'\}`\}>/, '<section className="relative px-4 py-20 z-10">');
newContent = newContent.replace(/<section className=\{`py-20 \$\{isDarkMode \? 'bg-gray-900\/80' : 'bg-white'\}`\}>/, '<section className="relative py-20 z-10">');
newContent = newContent.replace(/<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-900\/50' : 'bg-white'\}`\}>/, '<section className="relative px-4 py-20 z-10">');
newContent = newContent.replace(/<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-800' : 'bg-gray-100'\}`\}>/, '<section className="relative px-4 py-20 z-10">');
newContent = newContent.replace(/<section className=\{`px-4 py-20 overflow-x-auto \$\{isDarkMode \? 'bg-gray-900\/70' : 'bg-white'\}`\}>/, '<section className="relative px-4 py-20 overflow-x-auto z-10">');
newContent = newContent.replace(/<section className=\{`py-20 \$\{isDarkMode \? 'bg-white\/5' : 'bg-white'\}`\}>/, '<section className="relative py-20 z-10">');
newContent = newContent.replace(/<section className=\{`py-20 \$\{isDarkMode \? 'bg-gray-100\/10' : 'bg-gray-100'\}`\}>/, '<section className="relative py-20 z-10">');
newContent = newContent.replace(/<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-gray-800\/80' : 'bg-gray-100'\}`\}>/, '<section className="relative px-4 py-20 z-10">');
newContent = newContent.replace(/<section className="py-20">/, '<section className="relative py-20 z-10">');
newContent = newContent.replace(/<section className=\{`px-4 py-20 \$\{isDarkMode \? 'bg-blue-900\/80' : 'bg-gray-100'\}`\}>/, '<section className="relative px-4 py-20 z-10">');


for (const rule of regexes) {
  if (!rule.search.toString().includes('section')) {
      newContent = newContent.replace(rule.search, rule.replace);
  }
}

fs.writeFileSync(filePath, newContent);
console.log('Home.jsx updated with Glassmorphism');
