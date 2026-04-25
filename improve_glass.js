const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/screens/Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The old glass classes
const oldLightGlass = "bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]";
const oldDarkGlass = "bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]";

// The new glass classes with extreme depth (inset shadow for top edge highlight, layered drop shadows)
const newLightGlass = "bg-white/40 border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl hover:bg-white/50 hover:shadow-[0_16px_48px_0_rgba(31,38,135,0.25),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-2 hover:scale-[1.01]";
const newDarkGlass = "bg-slate-900/40 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl hover:bg-slate-900/50 hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:-translate-y-2 hover:scale-[1.01]";

// Regex to replace the conditional class string
// Original: ${isDarkMode ? 'bg-white/[0.05] border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.5)]' : 'bg-white/[0.15] border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]'}
// Note: We need to carefully replace the exact string without breaking other parts

const searchString = "\\${isDarkMode \\? 'bg-white/\\[0\\.05\\] border-white/10 shadow-\\[0_4px_24px_-1px_rgba\\(0,0,0,0\\.5\\)\\]' : 'bg-white/\\[0\\.15\\] border-white/30 shadow-\\[0_8px_32px_0_rgba\\(31,38,135,0\\.2\\)\\]'}";
const replaceString = `\${isDarkMode ? '${newDarkGlass}' : '${newLightGlass}'}`;

const regex = new RegExp(searchString, 'g');
let newContent = content.replace(regex, replaceString);

// Fix the stay updated section which has a slightly different base
const stayUpdatedSearch = "\\${isDarkMode \\? 'bg-blue-900/\\[0\\.1\\] border-blue-400/20 shadow-\\[0_4px_32px_-1px_rgba\\(59,130,246,0\\.3\\)\\]' : 'bg-white/\\[0\\.2\\] border-white/40 shadow-\\[0_8px_32px_0_rgba\\(31,38,135,0\\.15\\)\\]'}";
const stayUpdatedRegex = new RegExp(stayUpdatedSearch, 'g');
newContent = newContent.replace(stayUpdatedRegex, replaceString);

// Ensure transition classes are updated to allow transforms
newContent = newContent.replace(/transition-all duration-500/g, 'transition-all duration-500 ease-out transform-gpu');
newContent = newContent.replace(/transition-all duration-700/g, 'transition-all duration-500 ease-out transform-gpu');


fs.writeFileSync(filePath, newContent);
console.log('Hover and depth effects improved.');
