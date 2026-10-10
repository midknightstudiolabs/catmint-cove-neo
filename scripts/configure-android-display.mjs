import fs from 'node:fs';
const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n')));
edit('android/app/src/main/AndroidManifest.xml',s=>s.replace(/\s+android:(screenOrientation|resizeableActivity|minAspectRatio|maxAspectRatio|appCategory)="[^"]*"/g,'').replace('<application','<application android:appCategory="game"').replace('android:name=".MainActivity"','android:name=".MainActivity" android:resizeableActivity="true"'));
edit('android/app/build.gradle',s=>s.replace(/minifyEnabled (false|true)(\s+shrinkResources true)?/,'minifyEnabled true\n            shrinkResources true').replaceAll('proguard-android.txt','proguard-android-optimize.txt'));
edit('android/gradle.properties',s=>s.replace(/^android.enableR8.fullMode=false\s*$/gm,'').replace(/^android.r8.optimizedResourceShrinking=.*\n?/gm,'').trimEnd()+'\nandroid.r8.optimizedResourceShrinking=true\n');
edit('android/app/proguard-rules.pro',s=>s.includes('# Cove bridge reflection')?s:s+`\n# Cove bridge reflection; library consumer rules preserve Capacitor plugins.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
`);
fs.writeFileSync('android/app/src/main/java/com/midknightstudiolabs/catmintcove/MainActivity.java',`package com.midknightstudiolabs.catmintcove;
import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle state) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(state);
        WindowCompat.enableEdgeToEdge(getWindow());
        // One owner for insets: pad the native content, then clear delivered safe
        // areas so WebView CSS cannot count the same system bars twice.
        View content = findViewById(android.R.id.content);
        content.setBackgroundColor(android.graphics.Color.rgb(238, 243, 230));
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
            Insets safe = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            v.setPadding(safe.left, safe.top, safe.right, Math.max(safe.bottom, ime.bottom));
            return new WindowInsetsCompat.Builder(insets)
                .setInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime(), Insets.NONE)
                .build();
        });
        ViewCompat.requestApplyInsets(content);
    }
}
`);
console.log('Android: adaptive window, edge-to-edge insets and optimizing R8 configured.');
