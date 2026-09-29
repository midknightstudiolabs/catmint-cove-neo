/* Catmint Cove — native bridge (Capacitor).
 * Loaded only in the app build. Every call is optional: on plain web, or if a
 * plugin is missing, the game keeps its normal browser behaviour. */
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;   // web build → do nothing
  var P = Cap.Plugins || {};

  window.CoveNative = window.CoveNative || {};

  /* ---- app version — "1.0 (16)" — surfaced on the Credits screen ---- */
  try {
    if (P.App && P.App.getInfo) {
      P.App.getInfo().then(function (i) {
        var v = String(i.version), b = String(i.build);
        // iOS marketing version is "1.0" (build separate) → "1.0 (16)".
        // Android versionName already carries the run ("1.0.19") → leave as-is.
        window.CoveNative.appVersion = (v === b || v.slice(-b.length - 1) === "." + b) ? v : v + " (" + b + ")";
      }).catch(function () {});
    }
  } catch (e) {}

  /* ---- status bar: immersive game — hidden (clock/battery/wifi gone). The
   *      Info.plist also sets UIStatusBarHidden; this covers Android + any
   *      re-show after a system event. ---- */
  try {
    if (P.StatusBar) {
      P.StatusBar.setOverlaysWebView({ overlay: true });
      P.StatusBar.hide();
      P.App && P.App.addListener("resume", function () { try { P.StatusBar.hide(); } catch (e) {} });
    }
  } catch (e) {}

  /* ---- splash: hide once the first frame is up ---- */
  function hideSplash() { try { P.SplashScreen && P.SplashScreen.hide(); } catch (e) {} }
  if (document.readyState === "complete") setTimeout(hideSplash, 300);
  else window.addEventListener("load", function () { setTimeout(hideSplash, 300); });

  /* ---- Android hardware back: close the top-most overlay, else send to background ---- */
  try {
    P.App && P.App.addListener("backButton", function () {
      var closed = closeTopOverlay();
      if (!closed) { try { P.App.minimizeApp(); } catch (e) {} }
    });
  } catch (e) {}

  function closeTopOverlay() {
    // in rough z-order, newest first
    var tut = document.getElementById("tut");
    if (tut && tut.classList.contains("on")) { var s = document.getElementById("tutSkip"); s && s.click(); return true; }
    var scrim = document.getElementById("scrim");
    if (scrim && scrim.classList.contains("on")) { scrim.classList.remove("on"); return true; }
    var photo = document.getElementById("photo");
    if (photo && photo.classList.contains("on")) { var pc = document.getElementById("photoClose"); pc && pc.click(); return true; }
    var rest = document.getElementById("rest");
    if (rest && rest.classList.contains("on")) {
      var panel = document.getElementById("restPanel");
      if (panel && !panel.hidden) { var rc = document.getElementById("restCancel"); rc && rc.click(); return true; }
      var wake = document.getElementById("restWake"); wake && wake.click(); return true;
    }
    var sheet = document.querySelector(".sheet:not([hidden])");
    if (sheet) { var x = sheet.querySelector("[data-close]"); if (x) { x.click(); return true; } sheet.hidden = true; return true; }
    return false;
  }

  /* ---- keep the screen awake during Rest mode (watches the #app.resting class) ---- */
  try {
    if (P.KeepAwake) {
      var app = document.getElementById("app");
      var awake = false;
      var sync = function () {
        var want = app && app.classList.contains("resting");
        if (want === awake) return;
        awake = want;
        try { want ? P.KeepAwake.keepAwake() : P.KeepAwake.allowSleep(); } catch (e) {}
      };
      if (app) { new MutationObserver(sync).observe(app, { attributes: true, attributeFilter: ["class"] }); sync(); }
    }
  } catch (e) {}

  /* ---- save mirror: a second copy of the save in native storage (UserDefaults / SharedPreferences).
   *      WebView localStorage can be cleared by the OS under storage pressure; this copy survives it. ---- */
  var MIRROR_KEY = "catmintCove.neo.save.mirror.v1";
  window.CoveNative.mirrorSave = function (raw) {
    try { if (P.Preferences && raw) P.Preferences.set({ key: MIRROR_KEY, value: String(raw) }).catch(function () {}); } catch (e) {}
  };
  window.CoveNative.readMirror = function () {
    try { if (P.Preferences) return P.Preferences.get({ key: MIRROR_KEY }).then(function (r) { return (r && r.value) || null; }).catch(function () { return null; }); } catch (e) {}
    return Promise.resolve(null);
  };
  window.CoveNative.clearMirror = function () {
    try { if (P.Preferences) P.Preferences.remove({ key: MIRROR_KEY }).catch(function () {}); } catch (e) {}
  };
  /* share a text file (the backup) so it can be saved to Files / Notes / email */
  window.CoveNative.shareFile = function (name, text) {
    try {
      if (P.Filesystem && P.Share) {
        return P.Filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8" }).then(function (res) {
          return P.Share.share({ title: "Catmint Cove backup", text: "My Catmint Cove backup", url: res.uri });
        }).then(function () { return true; }).catch(function () { return false; });
      }
      if (P.Share) return P.Share.share({ title: "Catmint Cove backup", text: text }).then(function () { return true; }).catch(function () { return false; });
    } catch (e) {}
    return Promise.resolve(false);
  };

  /* ---- photo: save to the gallery / open the share sheet instead of an <a download> ---- */
  window.CoveNative.savePhoto = function (dataUrl) {
    var base64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, "");
    var name = "catmint-cove-" + Date.now() + ".png";
    try {
      if (P.Filesystem && P.Share) {
        P.Filesystem.writeFile({ path: name, data: base64, directory: "CACHE" }).then(function (res) {
          return P.Share.share({ title: "Catmint Cove", text: "My cove 🐾", url: res.uri });
        }).catch(function () {});
        return true;
      }
      if (P.Share) { P.Share.share({ title: "Catmint Cove", text: "My cove 🐾", url: dataUrl }).catch(function () {}); return true; }
    } catch (e) {}
    return false;
  };

  /* ---- in-app purchases via RevenueCat ---------------------------------------
   * PASTE YOUR KEYS BELOW. From the RevenueCat dashboard → Project → API keys:
   *   - the *public* key for the Google Play app  (starts with "goog_")
   *   - the *public* key for the App Store app    (starts with "appl_")
   * These are CLIENT keys — safe to commit to a public repo.
   * While a platform's key is "", the game falls back to its built-in simulated
   * purchase flow on that platform, so the app still runs.
   *
   * The three product ids below MUST match the products you create in Play
   * Console (Monetize → Products → One-time products) AND App Store Connect
   * (Features → In-App Purchases, non-consumable), and the game's own
   * IAP_PRODUCTS keys. RevenueCat "entitlements" are not required — we read
   * customerInfo.allPurchasedProductIdentifiers directly.
   * ------------------------------------------------------------------------- */
  var REVENUECAT_ANDROID_KEY = "goog_ZJtWmfOuiBnhjfOuCuBsVLHVqsP";
  var REVENUECAT_IOS_KEY = "appl_NOnpzwbRdsrmoSDdowFOZQntdxp";
  var COVE_PRODUCTS = ["welcome_pack", "founding_covekeeper", "sparkle_pack"];
  // Midknight's Blessing — auto-renewing subscriptions (create these in App Store Connect + Play Console and attach them in RevenueCat)
  var COVE_SUBS = ["midknight_blessing_weekly", "midknight_blessing_monthly"];

  (function initIAP() {
    var RC = P.Purchases;
    var plat = (Cap.getPlatform && Cap.getPlatform()) || "";
    var RC_KEY = plat === "ios" ? REVENUECAT_IOS_KEY : plat === "android" ? REVENUECAT_ANDROID_KEY : "";
    if (!RC || !RC_KEY) return;   // no plugin / no key for this platform → game simulates purchases

    // One bridge per document; native isConfigured also covers WebView reloads.
    if (window.CoveNative.iap) return;
    var ready = Promise.resolve().then(function () {
      return RC.isConfigured();
    }).then(function (state) {
      if (!state || !state.isConfigured) return RC.configure({ apiKey: RC_KEY });
    });
    // Keep native billing selected even while initializing or if initialization
    // fails: never fall through to the web simulated-purchase path.
    ready.catch(function () { console.warn("Catmint Cove billing could not initialize."); });
    function call(method, args) {
      return ready.then(function () { return RC[method](args); });
    }

    var products = null;   // { <productId>: PurchasesStoreProduct }

    function ownedFrom(info) {
      var ids = (info && info.allPurchasedProductIdentifiers) || [];
      var out = [];
      for (var i = 0; i < ids.length; i++) if (COVE_PRODUCTS.indexOf(ids[i]) !== -1) out.push(ids[i]);
      return out;
    }
    // { productId: expiry-in-ms } for each active Blessing subscription. Google reports "sub:basePlan", so match on the part before the colon.
    function subsFrom(info) {
      var out = {}, active = (info && info.activeSubscriptions) || [], dates = (info && info.allExpirationDates) || {};
      for (var i = 0; i < active.length; i++) {
        var id = String(active[i]).split(":")[0];
        if (COVE_SUBS.indexOf(id) === -1) continue;
        var t = Date.parse(dates[active[i]] || dates[id] || "");
        if (t > 0) out[id] = Math.max(out[id] || 0, t);
      }
      return out;
    }
    function push(info) {
      try {
        if (info && typeof window.__coveReconcile === "function") window.__coveReconcile(ownedFrom(info), subsFrom(info));
      } catch (e) {}
      try {
        if (products && typeof window.__covePrices === "function") {
          var m = {};
          for (var k in products) if (products[k] && products[k].priceString) m[k] = products[k].priceString;
          if (Object.keys(m).length) window.__covePrices(m);
        }
      } catch (e) {}
    }

    // catalogue — needed to purchase, and gives us localized price strings
    call("getProducts", { productIdentifiers: COVE_PRODUCTS, type: "NON_SUBSCRIPTION" })
      .then(function (res) {
        products = products || {};
        (res && res.products || []).forEach(function (p) { products[p.identifier] = p; });
        push(null);
      })
      .catch(function () {});
    call("getProducts", { productIdentifiers: COVE_SUBS, type: "SUBSCRIPTION" })
      .then(function (res) {
        products = products || {};
        (res && res.products || []).forEach(function (p) { products[String(p.identifier).split(":")[0]] = p; });
        push(null);
      })
      .catch(function () {});

    function sync() {
      return call("getCustomerInfo").then(function (r) {
        var info = r && r.customerInfo;
        push(info);
        return ownedFrom(info);
      });
    }

    // authoritative refresh: launch, every resume, and whenever RC pushes an update
    call("addCustomerInfoUpdateListener", function (info) { push(info); }).catch(function () {});
    try { P.App && P.App.addListener("resume", function () { sync().catch(function () {}); }); } catch (e) {}
    sync().catch(function () {});

    function purchase(prod, productId) {
      return call("purchaseStoreProduct", { product: prod }).then(
        function (r) { try { push(r && r.customerInfo); } catch (e) {} return { ok: true, productId: productId }; },
        function (e) {
          var cancelled = !!(e && (e.userCancelled === true || String(e.code) === "1"));
          var notAllowed = !!(e && String(e.code) === "PURCHASES_ERROR_CODE_PURCHASE_NOT_ALLOWED_ERROR");
          return { ok: false, reason: cancelled ? "cancelled" : notAllowed ? "notallowed" : "failed" };
        }
      );
    }

    window.CoveNative.iap = {
      available: true,
      buy: function (productId) {
        var prod = products && products[productId];
        if (prod) return purchase(prod, productId);
        // catalogue not ready / missing that id — fetch just this one, then buy
        return call("getProducts", { productIdentifiers: [productId], type: COVE_SUBS.indexOf(productId) !== -1 ? "SUBSCRIPTION" : "NON_SUBSCRIPTION" })
          .then(function (res) {
            var p = (res && res.products || [])[0];
            if (!p) return { ok: false, reason: "unavailable" };
            if (products) products[productId] = p;
            return purchase(p, productId);
          })
          .catch(function () { return { ok: false, reason: "unavailable" }; });
      },
      restore: function () {
        return call("restorePurchases").then(function (r) {
          var info = r && r.customerInfo;
          push(info);
          return ownedFrom(info).concat(Object.keys(subsFrom(info)));
        });
      },
      sync: sync,
    };
  })();
})();
