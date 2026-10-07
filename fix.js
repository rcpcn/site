const fs = require('fs');

// Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/bg-\[#002b17\]/g, 'bg-[#1e1b4b]');
fs.writeFileSync('index.html', html);

// Fix app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Revert ONAYLA button to green
appJs = appJs.replace(/bg-purple-600\/20 text-purple-500 border-purple-600\/50 hover:bg-purple-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider mr-2\"\>ONAYLA/g, 'bg-green-600/20 text-green-500 border-green-600/50 hover:bg-green-600 hover:text-white rounded text-xs transition-colors font-bold tracking-wider mr-2">ONAYLA');

// Revert APPROVED badge to green
appJs = appJs.replace(/bg-purple-900 text-purple-400 rounded border border-purple-800 font-mono tracking-wider\"\>APPROVED/g, 'bg-green-900 text-green-400 rounded border border-green-800 font-mono tracking-wider">APPROVED');

// Revert other ONAY buttons
appJs = appJs.replace(/bg-purple-600\/20 text-purple-500 border-purple-600\/50 hover:bg-purple-600 hover:text-white rounded transition-colors text-xs font-bold tracking-widest\"\>\<i class=\"fas fa-check mr-2\"\>\<\/i\>ONAY\<\/button\>/g, 'bg-green-600/20 text-green-500 border-green-600/50 hover:bg-green-600 hover:text-white rounded transition-colors text-xs font-bold tracking-widest"><i class="fas fa-check mr-2"></i>ONAY</button>');

// Revert success toast colors
appJs = appJs.replace(/bg-purple-700', 'border', 'border-purple-400'\);\n        icon\.className = 'fas fa-check-circle text-purple-300/g, "bg-green-700', 'border', 'border-green-400');\n        icon.className = 'fas fa-check-circle text-green-300");

// Revert success logs color
appJs = appJs.replace(/colorClass = 'text-purple-400';\n\n        const d = new Date/g, "colorClass = 'text-green-400';\n\n        const d = new Date");

fs.writeFileSync('app.js', appJs);
console.log('Fix applied');
