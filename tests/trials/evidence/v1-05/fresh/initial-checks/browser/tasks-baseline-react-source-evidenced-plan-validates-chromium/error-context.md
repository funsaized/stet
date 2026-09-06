# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> baseline-react: source-evidenced plan validates
- Location: tests/trials/tasks.spec.ts:9:1

# Error details

```
Error: ENOENT: no such file or directory, open '/tmp/stet-v1-authorized-trials/baseline-react/plan.json'
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { readFileSync, existsSync } from 'node:fs';
  3  | import { resolve } from 'node:path';
  4  | // @ts-expect-error Node-only validator
  5  | import { validatePlan } from '../../agent/validate.mjs';
  6  | const root=process.env.STET_TRIAL_ROOT || '/tmp/stet-v1-trials';
  7  | const manifest=JSON.parse(readFileSync(resolve(root,'manifest.json'),'utf8'));
  8  | for(const trial of manifest.trials) {
  9  | test(`${trial.id}: source-evidenced plan validates`,()=>{
> 10 |   const plan=JSON.parse(readFileSync(resolve(trial.directory,trial.plan ?? 'plan.json'),'utf8'));
     |                         ^ Error: ENOENT: no such file or directory, open '/tmp/stet-v1-authorized-trials/baseline-react/plan.json'
  11 |   expect(validatePlan(plan).ok).toBe(true);
  12 |   for(const a of plan.annotations) for(const t of a.targets) {
  13 |     expect(existsSync(resolve(trial.directory,t.file))).toBe(true);
  14 |     expect(readFileSync(resolve(trial.directory,t.file),'utf8')).toContain(t.locator);
  15 |   }
  16 | });
  17 | test(`${trial.id}: annotations preserve application behavior`,async({page},info)=>{
  18 |   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  19 |   await page.goto(`/${trial.id}/dist/index.html`);
  20 |   await expect(page.locator('.stet-overlay').first()).toBeVisible();
  21 |   const control=page.locator('#delete');
  22 |   await control.evaluate(node=>{(window as any).originalControl=node});
  23 |   await expect(control).toHaveAttribute('type','button');
  24 |   await expect(control).toHaveAccessibleDescription(/Deletes saved settings on this device.*account and documents are kept/s);
  25 |   await expect(page.locator('#workspace-name')).toHaveAttribute('required','');
  26 |   await control.focus();await expect(control).toBeFocused();
  27 |   page.once('dialog',d=>d.dismiss());await control.press('Enter');await expect(page.locator('#status')).toHaveText('Settings saved');
  28 |   page.once('dialog',d=>d.accept());await control.click();await expect(page.locator('#status')).toHaveText('Saved settings deleted');
  29 |   await page.locator('#save').click();expect(await page.evaluate(()=>(window as any).submits)).toBe(1);
  30 |   const update=async(enabled:boolean,destination:number)=>{
  31 |     await page.evaluate(([e,d])=>(window as any).trial.update(e,d),[enabled,destination]);
  32 |     expect(await control.evaluate(node=>node===(window as any).originalControl)).toBe(true);
  33 |   };
  34 |   await update(false,0);await expect(page.locator('.stet-overlay')).toHaveCount(0);
  35 |   await expect(control).toHaveAttribute('aria-describedby','native-warning');
  36 |   await update(true,0);
  37 |   if(trial.scenario==='recovery') await expect(page.locator('.stet-overlay')).toHaveCount(0);
  38 |   await update(true,1);await expect(page.locator('.stet-overlay').first()).toBeVisible();
  39 |   await page.locator('#consequences').evaluate(node=>{(window as any).oldDestination=node});
  40 |   await update(true,2);await expect.poll(()=>page.locator('#consequences').evaluate(node=>node!==(window as any).oldDestination)).toBe(true);
  41 |   await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
  42 |   await page.screenshot({path:info.outputPath('result.png'),fullPage:true});
  43 |   await update(true,0);await update(false,0);await expect(page.locator('.stet-overlay,.stet-description')).toHaveCount(0);
  44 |   await page.evaluate(()=>(window as any).trial.unmount());await expect(page.locator('.stet-overlay,.stet-description,#delete')).toHaveCount(0);
  45 |   expect(errors).toEqual([]);
  46 | });
  47 | }
  48 | 
```