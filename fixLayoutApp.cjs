const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className=\{`fixed inset-0 z-50 w-screen h-screen max-w-none border-0 rounded-none shadow-none m-0 p-0 bg-black\/70 backdrop-blur-xl overflow-hidden`\} id="main_gameboard_container">\n\s*state === GameState\.PLAYING \n\s*\? "fixed inset-0 z-50 w-screen h-screen max-w-none border-0 rounded-none shadow-none m-0 p-0" \n\s*: "w-full max-w-4xl border-2 border-\[#ffcc33\]\/40 rounded-3xl shadow-\[0_0_50px_rgba\(255,102,0,0\.25\)\] min-h-\[580px\] h-auto relative"\n\s*\} bg-black\/70 backdrop-blur-xl overflow-hidden`\} id="main_gameboard_container">/;

const repl = `<div className="fixed inset-0 z-50 w-screen h-screen max-w-none border-0 rounded-none shadow-none m-0 p-0 bg-black/70 backdrop-blur-xl overflow-hidden" id="main_gameboard_container">`;

file = file.replace(regex, repl);
fs.writeFileSync('src/App.tsx', file);
console.log('Fixed Layout correctly');
