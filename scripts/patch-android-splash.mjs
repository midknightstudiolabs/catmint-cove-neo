// Capacitor's stock Android template sets `android:background` on the
// Theme.SplashScreen launch theme, but Android 12+'s real SplashScreen
// system only reads `windowSplashScreenBackground` / `windowSplashScreenAnimatedIcon`
// — so on API 31+ it ignores splash.png entirely and paints a bare black
// window until Capacitor's JS-driven splash finally shows. MainActivity
// also never calls the core-splashscreen compat lib it already depends
// on, so pre-31 devices get the same gap. This runs after `cap sync
// android` (which regenerates android/ from scratch every CI run) to
// patch both, so the very first frame is already the green splash
// background instead of black.
import { readFileSync, writeFileSync } from "node:fs";

const stylesPath = "android/app/src/main/res/values/styles.xml";
const before =
  '    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n' +
  '        <item name="android:background">@drawable/splash</item>\n' +
  "    </style>";
const after =
  '    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n' +
  '        <item name="windowSplashScreenBackground">@color/splashBackground</item>\n' +
  '        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>\n' +
  '        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>\n' +
  "    </style>";

const styles = readFileSync(stylesPath, "utf8");
if (!styles.includes(before) && !styles.includes(after)) {
  console.error("::error::Capacitor android template changed — update scripts/patch-android-splash.mjs");
  process.exit(1);
}
writeFileSync(stylesPath, styles.replace(before, after));

writeFileSync(
  "android/app/src/main/res/values/colors.xml",
  '<?xml version="1.0" encoding="utf-8"?>\n' +
    "<resources>\n" +
    "    <!-- Matches capacitor.config.json backgroundColor / SplashScreen.backgroundColor\n" +
    "         and the web app's own body background (its sky-bot token) — keeping this\n" +
    "         the same cream avoids a color flash between the native launch frame and the JS splash. -->\n" +
    '    <color name="splashBackground">#eef3e6</color>\n' +
    "</resources>\n"
);

const mainPath = "android/app/src/main/java/com/midknightstudiolabs/catmintcove/MainActivity.java";
const mainBefore =
  "import com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {}";
const mainAfter =
  "import android.os.Bundle;\n" +
  "import androidx.core.splashscreen.SplashScreen;\n" +
  "import com.getcapacitor.BridgeActivity;\n\n" +
  "public class MainActivity extends BridgeActivity {\n" +
  "    @Override\n" +
  "    protected void onCreate(Bundle savedInstanceState) {\n" +
  "        SplashScreen.installSplashScreen(this);\n" +
  "        super.onCreate(savedInstanceState);\n" +
  "    }\n" +
  "}";

const main = readFileSync(mainPath, "utf8");
if (!main.includes(mainBefore) && !main.includes("SplashScreen.installSplashScreen(this)")) {
  console.error("::error::Capacitor MainActivity template changed — update scripts/patch-android-splash.mjs");
  process.exit(1);
}
writeFileSync(mainPath, main.replace(mainBefore, mainAfter));

console.log("Patched styles.xml, colors.xml and MainActivity.java for the Android 12+ SplashScreen API.");
