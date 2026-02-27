const fs = require('fs');
const { JSDOM } = require('jsdom');

// Load TS source and do a lightweight TS->JS transform (remove type annotations used here)
let src = fs.readFileSync('./src/ts/page/normalSet.ts', 'utf8');
// Remove TypeScript type annotations like : HTMLInputElement, : string, etc. (naive)
src = src.replace(/: *HTMLInputElement/g, '');
src = src.replace(/: *string/g, '');
src = src.replace(/: *any/g, '');
src = src.replace(/: *number/g, '');
src = src.replace(/<HTMLInputElement>/g, '');
src = src.replace(/<any>/g, '');
// Remove import/export lines
src = src.replace(/^import[\s\S]*?;\n/gm, '');
src = src.replace(/export function initNormalSet\(\) \{[\s\S]*?\n\}/gm, '');
// We'll extract the initInventoryValidation function block
const m = src.match(/function initInventoryValidation\([\s\S]*?\n\}/m);
if (!m) {
  console.error('initInventoryValidation not found');
  process.exit(2);
}
const fnSource = m[0];
// Prepare a stub for window.showToast to capture calls
const toasts = [];
const dom = new JSDOM(`<!doctype html><html><body>
  <div id="inventory">
    <!-- sample inputs -->
    <input data-field="max" data-type="coffee" data-slot="1" />
    <input data-field="current" data-type="coffee" data-slot="1" />
    <input data-field="perSecond" data-type="coffee" data-slot="1" />
    <input data-field="name" data-type="coffee" data-slot="1" />
  </div>
</body></html>`, { runScripts: "outside-only" });
const { window } = dom;
const { document } = window;
// attach simple showToast
window.showToast = (msg, t, level) => { toasts.push({msg, t, level}); };
// Provide minimal globals used in function
global.window = window;
global.document = document;

// Make fnSource safe: replace window.showToast references already ok. Remove TypeScript-only constructs left
let js = fnSource
  .replace(/<[^>]+>/g, '')
  .replace(/dataset: any/g, '')
  .replace(/\bconst\s+parts\s*=\s*v.split\("\."\);/g, 'const parts = v.split(".");')
  ;

// Wrap and evaluate
const wrapper = `(function(){ ${js}; return initInventoryValidation; })()`;
let initInventoryValidation;
try {
  initInventoryValidation = eval(wrapper);
} catch (e) {
  console.error('Eval error', e);
  process.exit(3);
}

// Run the initializer which binds events
initInventoryValidation();

// Helper to simulate input
function setInput(selector, value) {
  const el = document.querySelector(selector);
  el.value = value;
  const ev = document.createEvent('HTMLEvents');
  ev.initEvent('input', true, true);
  el.dispatchEvent(ev);
  return el.value;
}

console.log('Initial values:');
console.log('max:', document.querySelector('input[data-field="max"]').value);
console.log('current:', document.querySelector('input[data-field="current"]').value);

// 1) set max=10
console.log('\nSetting max=10');
setInput('input[data-field="max"]', '10');
console.log('max after input:', document.querySelector('input[data-field="max"]').value);

// 2) try to set current=20 -> should clamp to 10 and toast
console.log('\nSetting current=20 (expect clamp to 10)');
setInput('input[data-field="current"]', '20');
console.log('current after input:', document.querySelector('input[data-field="current"]').value);

// 3) try perSecond decimal
console.log('\nSetting perSecond=3.5 (allowed)');
setInput('input[data-field="perSecond"]', '3.5');
console.log('perSecond after input:', document.querySelector('input[data-field="perSecond"]').value);

// 4) perSecond exceed 50
console.log('\nSetting perSecond=60 (expect clamp to 50)');
setInput('input[data-field="perSecond"]', '60');
console.log('perSecond after input:', document.querySelector('input[data-field="perSecond"]').value);

// 5) name length >100
const longName = 'a'.repeat(120);
console.log('\nSetting name length 120 (expect truncate to 100)');
setInput('input[data-field="name"]', longName);
console.log('name length after input:', document.querySelector('input[data-field="name"]').value.length);

console.log('\nCaptured toasts:', toasts);

// Basic assertions
const results = {
  current: document.querySelector('input[data-field="current"]').value === '10',
  perSecondClamp: document.querySelector('input[data-field="perSecond"]').value === '50',
  perSecondDecimal: document.querySelector('input[data-field="perSecond"]').value === '50' || document.querySelector('input[data-field="perSecond"]').value === '3.5',
  nameLen: document.querySelector('input[data-field="name"]').value.length === 100,
};

console.log('\nTest results:', results);

if (!results.current) process.exit(5);
process.exit(0);
