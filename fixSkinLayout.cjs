const fs = require('fs');
let file = fs.readFileSync('src/components/SkinSelector.tsx', 'utf8');

file = file.replace(/className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 md:p-8 animate-fade-in font-serif h-full justify-between" id="skins_selector_panel"/, 
'className="w-full h-full mx-auto flex flex-col gap-6 p-6 md:p-12 animate-fade-in font-serif justify-center" id="skins_selector_panel"');

fs.writeFileSync('src/components/SkinSelector.tsx', file);
console.log('Fixed Skin Layout');
