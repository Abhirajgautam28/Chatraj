const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'frontend/src/screens/Home.jsx');
let code = fs.readFileSync(homePath, 'utf8');

// Fix the template literals in Project Showcase and User Leaderboard headings
code = code.replace(
  /className="mb-12 text-3xl font-bold text-center \$\{isDarkMode \? 'text-white' : 'text-gray-800'\}"/g,
  'className={`mb-12 text-3xl font-bold text-center ${isDarkMode ? "text-white" : "text-gray-800"}`}'
);

fs.writeFileSync(homePath, code);
console.log("Template literals fixed.");
