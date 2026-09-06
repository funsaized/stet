// @vitest-environment node
import { expect, it } from 'vitest';
import { transform } from 'esbuild';
// @ts-expect-error Node-only template factory
import { lifecyclePattern } from '../../agent/patterns.mjs';
it('rolls back partially attached groups and makes teardown idempotent', async () => {
  const code = lifecyclePattern('vanilla').code.replace(/^import .*;$/gm, '');
  const compiled = await transform(code, { loader: 'ts', format: 'esm' });
  const events: string[] = [];
  const attach = (name: string) => () => { events.push(name); return { destroy: () => events.push(`destroy ${name}`) }; };
  const make = new Function('circle', 'sticky', 'arrow', compiled.code.replace('export {\n  annotate\n};', '') + '\nreturn annotate;');
  const annotate = make(attach('circle'), attach('sticky'), () => { throw Error('invalid destination'); });
  const marks = annotate({});
  expect(() => marks.update(true, {})).toThrow('invalid destination');
  expect(events).toEqual(['circle', 'sticky', 'destroy sticky', 'destroy circle']);
  marks.destroy(); marks.destroy();
  expect(events.length).toBe(4);
});
