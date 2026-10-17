// Merakit src/ menjadi satu file index.html (tanpa dependensi).
// Pemakaian: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const parts = ['shell.html', 'a_core.js', 'b_layout.js', 'c_sim.js', 'd_part1.js', 'd_part2.js', 'e_ui.js'];
const out = parts.map((f) => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8')).join('');
writeFileSync(new URL('./index.html', import.meta.url), out);
console.log(`index.html dirakit (${(out.length / 1024).toFixed(0)} KB)`);
