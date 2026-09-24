// Loads the game's data + logic scripts into Node (no DOM) for tooling.
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadGame(extra = []) {
  globalThis.window = globalThis;
  globalThis.PK = {};
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  // only logic/data scripts that don't need a DOM
  const ok = scripts.filter(s => /src\/(data|systems)\//.test(s) || /engine\/rng\.js|gfx\/(color|tiles|buildings)\.js/.test(s));
  for (const s of ok.concat(extra)) {
    const f = path.join(ROOT, s);
    if (!fs.existsSync(f)) continue;
    vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: s });
  }
  // gym interiors reference tile themes; stub what tooling needs
  return globalThis.PK;
}
export { ROOT };
