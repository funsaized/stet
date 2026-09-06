import { expect, test } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
// @ts-expect-error Node-only validator
import { validatePlan } from '../../agent/validate.mjs';
const root=process.env.STET_TRIAL_ROOT || '/tmp/stet-v1-trials';
const manifest=JSON.parse(readFileSync(resolve(root,'manifest.json'),'utf8'));
for(const trial of manifest.trials) test(`${trial.id}: annotations preserve application behavior`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const plan=JSON.parse(readFileSync(resolve(trial.directory,'plan.json'),'utf8'));
  expect(validatePlan(plan).ok).toBe(true);
  for(const a of plan.annotations) for(const t of a.targets) {
    expect(existsSync(resolve(trial.directory,t.file))).toBe(true);
    expect(readFileSync(resolve(trial.directory,t.file),'utf8')).toContain(t.locator);
  }
  await page.goto(`/${trial.id}/dist/index.html`);
  await expect(page.locator('.stet-overlay').first()).toBeVisible();
  const control=page.locator('#delete');
  await control.evaluate(node=>{(window as any).originalControl=node});
  await expect(control).toHaveAttribute('type','button');
  await expect(control).toHaveAccessibleDescription(/Deletes saved settings on this device.*account and documents are kept/s);
  await expect(page.locator('#workspace-name')).toHaveAttribute('required','');
  await control.focus();await expect(control).toBeFocused();
  page.once('dialog',d=>d.dismiss());await control.press('Enter');await expect(page.locator('#status')).toHaveText('Settings saved');
  page.once('dialog',d=>d.accept());await control.click();await expect(page.locator('#status')).toHaveText('Saved settings deleted');
  await page.locator('#save').click();expect(await page.evaluate(()=>(window as any).submits)).toBe(1);
  const update=async(enabled:boolean,destination:number)=>{
    await page.evaluate(([e,d])=>(window as any).trial.update(e,d),[enabled,destination]);
    expect(await control.evaluate(node=>node===(window as any).originalControl)).toBe(true);
  };
  await update(false,0);await expect(page.locator('.stet-overlay')).toHaveCount(0);
  await expect(control).toHaveAttribute('aria-describedby','native-warning');
  await update(true,0);
  if(trial.scenario==='recovery') await expect(page.locator('.stet-overlay')).toHaveCount(0);
  await update(true,1);await expect(page.locator('.stet-overlay').first()).toBeVisible();
  await page.locator('#consequences').evaluate(node=>{(window as any).oldDestination=node});
  await update(true,2);await expect.poll(()=>page.locator('#consequences').evaluate(node=>node!==(window as any).oldDestination)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:info.outputPath('result.png'),fullPage:true});
  await update(true,0);await update(false,0);await expect(page.locator('.stet-overlay,.stet-description')).toHaveCount(0);
  await page.evaluate(()=>(window as any).trial.unmount());await expect(page.locator('.stet-overlay,.stet-description,#delete')).toHaveCount(0);
  expect(errors).toEqual([]);
});
