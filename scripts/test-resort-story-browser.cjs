const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'D:/Codex/2026-09-23/brainstorm-i-came-across-of-md/outputs/side-a/node_modules/playwright-core');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();if(u.pathname.endsWith('.png'))return r.fulfill({path:path.join(process.cwd(),u.pathname),contentType:'image/png'});return r.continue();});
 await page.goto('http://127.0.0.1:8879/',{waitUntil:'domcontentloaded'});
 await page.locator('#ts-go').click({timeout:15000});
 await page.waitForTimeout(900);
 if(await page.locator('#own-skip').isVisible())await page.locator('#own-skip').click();
 await page.locator('.comic-pause').click();await page.waitForTimeout(4200);assert.equal(await page.locator('.comic-panels figure').count(),1);await page.locator('.comic-pause').click();await page.locator('.comic-next').waitFor({state:'visible',timeout:20000});assert.equal(await page.locator('.comic-panels figure').count(),4);await page.waitForTimeout(900);
 await page.screenshot({path:'../../outputs/resort-before-20260929/comic-test.png'});
 await page.locator('.comic-next').click();await page.locator('#hintX').click();
 await page.getByRole('button',{name:'Welcome them in'}).click();
 await page.locator('#neo-activities-nav').click();await page.locator('#neo-go-resort').click();await page.locator('.comic-skip').click();
 await page.getByRole('button',{name:'Open first cottage · Free',exact:true}).click();
 await page.getByRole('button',{name:'Look inside',exact:true}).waitFor();
 await page.screenshot({path:'../../outputs/resort-before-20260929/resort-test.png'});
 await page.getByRole('button',{name:'Look inside',exact:true}).click();
 await page.screenshot({path:'../../outputs/resort-before-20260929/resort-inside-test.png'});
 const initial=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__cove.G)));
 assert.equal(initial.coveStories.entries['cove-001'].status,'complete');assert.equal(initial.coveStories.entries['resort-001'].status,'skipped');assert.equal(initial.resort.cottages[0].built,true);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../../outputs/resort-before-20260929/resort-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.rs-close').click();await page.locator('#neo-activities-nav').click();await page.locator('#neo-go-resort').click();
 assert.equal(await page.locator('.cove-comic').count(),0);
 await page.locator('.rs-close').click();await page.locator('#todayBtn').evaluate(e=>e.click());
 await page.locator('.comic-library button').first().click();
 await page.locator('.comic-skip').click();
 assert.equal(await page.evaluate(()=>window.__cove.G.coveStories.entries['cove-001'].status),'complete');
 assert.deepEqual(errors,[]);console.log('PASS: intro, tutorial handoff, resort controls, phone layout, no automatic replay, Journal replay, no browser errors');
 }finally{await browser.close();}
})();
