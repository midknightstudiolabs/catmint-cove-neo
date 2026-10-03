// Assembles www/ — the web payload Capacitor bundles into the native app.
// Everything the game needs at runtime, plus a small native bridge, copied from
// the same index.html that ships to GitHub Pages (one source of truth).
import { readFile, writeFile, rm, mkdir, cp, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const www = join(root, "www");

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

// 1. index.html — inject the native bridge immediately before the game's own
//    <script> so window.CoveNative is set up before the game boots
let html = await readFile(join(root, "index.html"), "utf8");
const marker = /<script>\s*\(\(\)\s*=>\s*\{/;   // the game IIFE: `<script>\n(() => {`
if (!marker.test(html)) throw new Error("build-www: could not find the game <script> to inject the bridge before");

// iOS WKWebView won't fetch() a bundled capacitor:// asset, so the festival
// music never loads on device. Neo already has a guarded loader for this
// (_festAudioBuf reads a local `FEST_AUDIO_DATA` object, falling back to
// fetch() on web) — the marker below is that object's declaration; swap in
// the real base64 data for the native build instead of leaving it empty.
const festAudio = ["fest-bed-hub.mp3", "fest-bed-race.mp3", "fest-bed-volley.mp3", "fest-bed-tug.mp3", "fest-bed-cafe.mp3", "fest-win.mp3", "rain-loop.mp3"];
const fa = {};
for (const f of festAudio) {
  if (await exists(join(root, f))) fa[f] = "data:audio/mpeg;base64," + (await readFile(join(root, f))).toString("base64");
}
const festAudioMarker = "const FEST_AUDIO_DATA = {};   /* @native-fest-audio */";
if (!html.includes(festAudioMarker)) throw new Error("build-www: @native-fest-audio marker not found — index.html changed shape, update this script");
html = html.replace(festAudioMarker, "const FEST_AUDIO_DATA = " + JSON.stringify(fa) + ";");

html = html.replace(marker, '<script src="capacitor-bridge.js"></script>\n<script src="admob-config.js"></script>\n<script src="admob-bridge.js"></script>\n$&');
await writeFile(join(www, "index.html"), html);

// 2. runtime assets the game fetch()es by relative path
for (const asset of ["fest-bed-hub.mp3", "fest-bed-race.mp3", "fest-bed-volley.mp3", "fest-bed-tug.mp3", "fest-bed-cafe.mp3", "fest-win.mp3", "rain-loop.mp3", "sfx", "art", "ui"]) {
  if (await exists(join(root, asset))) await cp(join(root, asset), join(www, asset), { recursive: true });
}

// 3. the native bridge
// Friends is enabled for the approved native test release; the public web gate stays separate.
const nativeSocialPath = join(www, "ui", "social-config.js");
const nativeSocial = await readFile(nativeSocialPath, "utf8");
await writeFile(nativeSocialPath, nativeSocial.replace("enabled:false", "enabled:true"));
await cp(join(root, "scripts", "capacitor-bridge.js"), join(www, "capacitor-bridge.js"));
for (const f of ["admob-config.js", "admob-bridge.js"]) await cp(join(root, "scripts", f), join(www, f));

console.log("built www/ from index.html + assets");
