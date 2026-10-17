// Merakit src/ menjadi satu file index.html (tanpa dependensi).
// Hasil ditulis ke index.html (root) dan public/index.html (output Vercel).
// Pemakaian: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const parts = ['shell.html', 'a_core.js', 'b_layout.js', 'c_sim.js', 'd_part1.js', 'd_part2.js', 'e_ui.js'];
const out = parts.map((f) => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8')).join('');

writeFileSync(new URL('./index.html', import.meta.url), out);
mkdirSync(new URL('./public/', import.meta.url), { recursive: true });
writeFileSync(new URL('./public/index.html', import.meta.url), out);
console.log(`index.html dirakit (${(out.length / 1024).toFixed(0)} KB) → ./index.html, ./public/index.html`);
