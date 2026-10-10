const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('D:/Codex/2026-09-23/brainstorm-i-came-across-of-md/outputs/side-a/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
const p=await b.newPage({viewport,hasTouch:viewport.width<600});await p.setContent('<html><body></body></html>');await p.clock.install();
await p.addStyleTag({content:fs.readFileSync('ui/cove-stories.css','utf8')});await p.addScriptTag({content:fs.readFileSync('ui/cove-stories.js','utf8')});
const stories=await p.evaluate(()=>CoveStories.catalog.map(s=>({id:s.id,n:s.panels.length})));
for(const {id,n}of stories)for(const replay of [false,true]){
await p.evaluate(({id,replay})=>{window.g={};window.finished=0;CoveStories.open(id,{game:()=>g,save(){},cat(){}},()=>finished++,replay);},{id,replay});
const count=()=>p.locator('.is-revealed').count();const bounds=()=>p.locator('.cove-comic,figure,footer').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));const initial=await bounds();
assert.equal(await count(),1);await p.clock.fastForward(3000);
const canvas=p.locator('canvas').first();if(viewport.width<600)await canvas.tap();else await canvas.click();assert.equal(await count(),2);
await p.clock.fastForward(3000);assert.equal(await count(),2,'tap resets the automatic timer');await p.clock.fastForward(4000);assert.equal(await count(),3,'autoplay continues after tap');
if(n>3){await p.locator('.comic-pause').click();assert.equal(await count(),3);await canvas.click();assert.equal(await count(),4);}
assert.deepEqual(await bounds(),initial);await canvas.click();assert.equal(await p.evaluate(()=>finished),0);await p.locator('.comic-next').click();assert.equal(await p.evaluate(()=>finished),1);
if(!replay)assert.equal(await p.evaluate(id=>g.coveStories.entries[id].status,id),'complete');
console.log('PASS',viewport.width,id,replay?'journal replay':'first viewing');
}await p.close();}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
