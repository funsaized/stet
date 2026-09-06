// Offline scorer for optional model trials. This does not call a model or claim
// that fixture coverage proves real skill triggering.
import { readFileSync } from 'node:fs';
const fixtures = JSON.parse(readFileSync(new URL('../../agent/evals/routing.json', import.meta.url)));
try {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/agent/eval-routing.mjs <predictions.json>');
  const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  if (typeof input.model !== 'string' || !input.model.trim() || !Array.isArray(input.predictions)) throw new Error('Expected model and predictions: [{query, selected}].');
  const predictions = new Map(input.predictions.map(p => [p.query, p.selected]));
  if (predictions.size !== fixtures.length || predictions.size !== input.predictions.length || fixtures.some(f => !predictions.has(f.query))) throw new Error('Predictions must include each fixture exactly once, with no extras.');
  const results = fixtures.map(f => ({ ...f, selected: predictions.get(f.query), ok: predictions.get(f.query) === f.expected }));
  const passed = results.filter(r => r.ok).length;
  console.log(JSON.stringify({ ok: passed === results.length, model: input.model, passed, total: results.length, results }, null, 2));
  if (passed !== results.length) process.exitCode = 1;
} catch (e) { console.error(e.message); process.exitCode = 2; }
