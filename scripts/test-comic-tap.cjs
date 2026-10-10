const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('D:/Codex/2026-09-23/brainstorm-i-came-across-of-md/outputs/side-a/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
const p=await b.newPage({viewport});await p.setContent('<html><body></body></html>');
await p.addStyleTag({content:fs.readFileSync('ui/cove-stories.css','utf8')});await p.addScriptTag({content:fs.readFileSync('ui/cove-stories.js','utf8')});
await p.evaluate(()=>{window.g={};window.finished=0;CoveStories.open('cove-001',{game:()=>g,save(){},cat(){}},()=>finished++);});
const count=()=>p.locator('.is-revealed').count();const bounds=()=>p.locator('.cove-comic,figure,footer').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));const initial=await bounds();
await p.locator('.comic-pause').click();assert.equal(await count(),1);
await p.locator('canvas').first().click();assert.equal(await count(),2);
await p.waitForTimeout(5600);assert.equal(await count(),2,'tap must preserve pause');
await p.locator('.comic-pause').click();assert.equal(await count(),2,'resume must not advance');
await p.waitForTimeout(5700);assert.equal(await count(),3,'automatic playback continues');
await p.locator('h2').click();assert.equal(await count(),4);assert.deepEqual(await bounds(),initial);
await p.locator('canvas').first().click();assert.equal(await p.evaluate(()=>finished),0,'final panel stays for reading');
await p.locator('.comic-next').click();assert.equal(await p.evaluate(()=>finished),1);assert.equal(await p.evaluate(()=>g.coveStories.entries['cove-001'].status),'complete');await p.close();
}console.log('PASS desktop/mobile tap advancement, control isolation, pause, autoplay, fixed geometry and explicit completion');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
