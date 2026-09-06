# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> review-react: native layout matches the original application
- Location: tests/trials/tasks.spec.ts:9:1

# Error details

```
Error: good-email at 1100px

expect(received).toEqual(expected) // deep equality

- Expected  - 3
+ Received  + 3

  Object {
    "height": 35,
-   "width": 197,
-   "x": 80.015625,
-   "y": 377.34375,
+   "width": 316,
+   "x": 40,
+   "y": 415.25,
  }
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - heading "Workspace settings" [level=1] [ref=e4]
    - text: Workspace name
    - textbox "Workspace name" [ref=e5]: Sketchbook
    - button "Save settings" [ref=e6]
    - button "Delete saved settings" [ref=e7]
    - paragraph [ref=e8]: Deletes saved settings on this device. Your account and documents are kept.
    - paragraph [ref=e9]: You can set your preferences again after deletion.
    - status [ref=e10]: Settings saved
    - generic [ref=e11]:
      - heading "Form examples" [level=2] [ref=e12]
      - generic [ref=e13]: Email
      - textbox "Email" [ref=e14]
      - textbox "Email" [ref=e15]
    - generic [ref=e16]:
      - heading "Included features" [level=2] [ref=e17]
      - paragraph [ref=e18]: Settings stay on this device.
      - paragraph [ref=e19]: Use Save settings to keep your preferences.
  - generic: "Right: associated label stays visible. Keep it."
  - generic: "Wrong: placeholder only. Add a persistent associated label."
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
  9  | test(`${trial.id}: native layout matches the original application`,async({page})=>{
  10 |   const reference=await page.context().newPage();
  11 |   const ids=['workspace-name','save','delete','native-warning','consequences','status','good-email','bad-email','local-feature','export-feature'];
  12 |   try {
  13 |     await reference.goto(`/reference-${trial.framework}/dist/index.html`);
  14 |     await page.goto(`/${trial.id}/dist/index.html`);
  15 |     for(const width of [1100,390]) {
  16 |       for(const target of [reference,page]) {
  17 |         await target.setViewportSize({width,height:950});
  18 |         await expect(target.locator('#delete')).toBeVisible();
  19 |         await target.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  20 |       }
> 21 |       for(const id of ids) expect(await page.locator(`#${id}`).boundingBox(),`${id} at ${width}px`).toEqual(await reference.locator(`#${id}`).boundingBox());
     |                                                                                                     ^ Error: good-email at 1100px
  22 |     }
  23 |   } finally { await reference.close(); }
  24 | });
  25 | test(`${trial.id}: source-evidenced plan validates`,()=>{
  26 |   const plan=JSON.parse(readFileSync(resolve(trial.directory,trial.plan ?? 'plan.json'),'utf8'));
  27 |   expect(validatePlan(plan).ok).toBe(true);
  28 |   for(const a of plan.annotations) for(const t of a.targets) {
  29 |     expect(existsSync(resolve(trial.directory,t.file))).toBe(true);
  30 |     expect(readFileSync(resolve(trial.directory,t.file),'utf8')).toContain(t.locator);
  31 |   }
  32 | });
  33 | test(`${trial.id}: annotations preserve application behavior`,async({page},info)=>{
  34 |   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  35 |   await page.goto(`/${trial.id}/dist/index.html`);
  36 |   await expect(page.locator('.stet-overlay').first()).toBeVisible();
  37 |   const control=page.locator('#delete');
  38 |   await control.evaluate(node=>{(window as any).originalControl=node});
  39 |   await expect(control).toHaveAttribute('type','button');
  40 |   await expect(control).toHaveAccessibleDescription(/Deletes saved settings on this device.*account and documents are kept/s);
  41 |   await expect(page.locator('#workspace-name')).toHaveAttribute('required','');
  42 |   await control.focus();await expect(control).toBeFocused();
  43 |   page.once('dialog',d=>d.dismiss());await control.press('Enter');await expect(page.locator('#status')).toHaveText('Settings saved');
  44 |   page.once('dialog',d=>d.accept());await control.click();await expect(page.locator('#status')).toHaveText('Saved settings deleted');
  45 |   await page.locator('#save').click();expect(await page.evaluate(()=>(window as any).submits)).toBe(1);
  46 |   const update=async(enabled:boolean,destination:number)=>{
  47 |     await page.evaluate(([e,d])=>(window as any).trial.update(e,d),[enabled,destination]);
  48 |     expect(await control.evaluate(node=>node===(window as any).originalControl)).toBe(true);
  49 |   };
  50 |   await update(false,0);await expect(page.locator('.stet-overlay')).toHaveCount(0);
  51 |   await expect(control).toHaveAttribute('aria-describedby','native-warning');
  52 |   await update(true,0);
  53 |   if(trial.scenario==='recovery') await expect(page.locator('.stet-overlay')).toHaveCount(0);
  54 |   await update(true,1);await expect(page.locator('.stet-overlay').first()).toBeVisible();
  55 |   await page.locator('#consequences').evaluate(node=>{(window as any).oldDestination=node});
  56 |   await update(true,2);await expect.poll(()=>page.locator('#consequences').evaluate(node=>node!==(window as any).oldDestination)).toBe(true);
  57 |   await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
  58 |   // Let Stet's frame-batched geometry settle after resizing before comparing or
  59 |   // capturing. An immediate full-page capture can include the old overlay bounds.
  60 |   const settle=()=>page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  61 |   await update(false,2);await expect(page.locator('.stet-overlay')).toHaveCount(0);await settle();
  62 |   const nativeBox=await control.boundingBox();
  63 |   const nativeWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  64 |   await update(true,2);await expect(page.locator('.stet-overlay').first()).toBeVisible();await settle();
  65 |   expect(await control.boundingBox()).toEqual(nativeBox);
  66 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(nativeWidth);
  67 |   await page.screenshot({path:info.outputPath('result.png'),fullPage:true});
  68 |   await update(true,0);await update(false,0);await expect(page.locator('.stet-overlay,.stet-description')).toHaveCount(0);
  69 |   await page.evaluate(()=>(window as any).trial.unmount());await expect(page.locator('.stet-overlay,.stet-description,#delete')).toHaveCount(0);
  70 |   expect(errors).toEqual([]);
  71 | });
  72 | }
  73 | 
```