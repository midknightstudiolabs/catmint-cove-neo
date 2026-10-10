import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('./admob-config.js',import.meta.url),'utf8'),ctx);
const id=ctx.window.CoveAdConfig.androidAppId;
if(!/^ca-app-pub-\d+~\d+$/.test(id))throw Error('Invalid Android AdMob app ID');
const path=new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url);
let xml=fs.readFileSync(path,'utf8');
const tag=`<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${id}" />`;
const existing=/<meta-data\b[^>]*android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/?\s*>/g;
if(existing.test(xml))xml=xml.replace(existing,tag);
else {
 if(!xml.includes('</application>'))throw Error('Android application element missing');
 xml=xml.replace('</application>',`    ${tag}\n    </application>`);
}
fs.writeFileSync(path,xml);
console.log('Android AdMob application ID configured.');
