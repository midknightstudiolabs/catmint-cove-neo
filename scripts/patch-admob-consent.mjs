// @capacitor-community/admob 8.1.0 binds ConsentExecutor.plugin only inside
// initialize(), but UMP must be able to show its form BEFORE MobileAds.start().
// Bind its weak host reference on the consent request, without starting ads.
import fs from 'node:fs';
const path=new URL('../node_modules/@capacitor-community/admob/ios/Sources/AdMobPlugin/AdMobPlugin.swift',import.meta.url);
const marker='    @objc func requestConsentInfo(_ call: CAPPluginCall) {';
const patched=marker+'\n        self.consentExecutor.plugin = self // Cove: consent before SDK start';
let s=fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
if(!s.includes(patched)){
 if(!s.includes(marker))throw new Error('AdMob consent patch requires review after dependency update');
 fs.writeFileSync(path,s.replace(marker,patched));
}
