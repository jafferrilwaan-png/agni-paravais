const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

code = code.replace(
  'const [rageCharge, setRageCharge] = useState(0);',
  'const [rageCharge, setRageCharge] = useState(0);\n  const [bossPowerFeathers, setBossPowerFeathers] = useState(0);\n  const [isBossPowerActive, setIsBossPowerActive] = useState(false);'
);

code = code.replace(
  'setRageCharge(state.rageChargeVal);',
  'setRageCharge(state.rageChargeVal);\n        setBossPowerFeathers(state.bossPowerFeathers);\n        setIsBossPowerActive(state.bossPowerActive);'
);

code = code.replace(
  /stateRef.current.bossPowerFeathers/g,
  'bossPowerFeathers'
);

code = code.replace(
  /stateRef.current.bossPowerActive/g,
  'isBossPowerActive'
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
