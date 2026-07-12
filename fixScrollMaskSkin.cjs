const fs = require('fs');
let file = fs.readFileSync('src/components/SkinSelector.tsx', 'utf8');

file = file.replace(/className="flex flex-col gap-3 max-h-\[310px\] overflow-y-auto pr-2 custom-scrollbar"/g, 'className="flex flex-col gap-3 max-h-[310px] overflow-y-auto pr-2 custom-scrollbar scroll-indicator-mask"');

fs.writeFileSync('src/components/SkinSelector.tsx', file);
console.log('Fixed Scroll Mask Skin');
