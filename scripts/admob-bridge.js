/* iOS-only rewarded ads. No ad request or SDK initialization on web/Android.
 * Rewards come only from the SDK reward event, never from closing the ad. */
(function () {
  const cap = window.Capacitor, config = window.CoveAdConfig;
  if (!cap?.isNativePlatform?.() || cap.getPlatform() !== 'ios' || !config) return;
  window.CoveNative ||= {};
  if (window.CoveNative.ads) return;
  const sdk = cap.Plugins?.AdMob;
  if (!sdk) return;
  let init, consent, preparing, initialized = false, showing = false;
  const loaded = new Map();
  const id = p => config.testMode ? config.testRewardedId : config.units[p];
  const ready = p => !!config.units[p] && !showing && consent?.canRequestAds === true && loaded.has(id(p)) && Date.now() - loaded.get(id(p)) < 50 * 60000;
  async function initialize() {
    if (!init) init = (async () => {
      // This initial release does not request ATT or personalized ads.
      consent = await sdk.requestConsentInfo();
      if (consent.status === 'REQUIRED' && consent.isConsentFormAvailable) consent = await sdk.showConsentForm();
      if (!consent.canRequestAds) return false;
      await sdk.initialize({ initializeForTesting: config.testMode, maxAdContentRating: 'General' });
      initialized = true;
      return true;
    })().catch(() => false);
    return init;
  }
  async function prepare(p) {
    if (!initialized || !consent?.canRequestAds || !config.units[p] || showing) return false;
    if (ready(p)) return true;
    if (preparing) return false;
    preparing = (async () => {
      loaded.delete(id(p));
      await sdk.prepareRewardVideoAd({ adId: id(p), isTesting: config.testMode, npa: true });
      loaded.set(id(p), Date.now()); return true;
    })().catch(() => false);
    try { return await preparing; } finally { preparing = null; }
  }
  async function show(p, onEarned) {
    if (!ready(p)) return false;
    showing = true; loaded.delete(id(p));
    let earned = false, finished = false, timer;
    const handles = [];
    let finish;
    const result = new Promise(resolve => { finish = () => {
      if (finished) return; finished = true; clearTimeout(timer);
      // Keep the native lock on a watchdog timeout: a late event must not reward a newer ad.
      resolve(earned);
    }; });
    const close = () => { showing = false; finish(); for (const h of handles) Promise.resolve(h.remove()).catch(() => {}); };
    try {
      handles.push(await sdk.addListener('onRewardedVideoAdReward', () => {
        if (earned || finished) return; earned = true; onEarned();
      }));
      handles.push(await sdk.addListener('onRewardedVideoAdDismissed', close));
      handles.push(await sdk.addListener('onRewardedVideoAdFailedToShow', close));
      timer = setTimeout(finish, 180000);
      // The plugin resolves this promise at reward time, before dismissal.
      Promise.resolve(sdk.showRewardVideoAd({ adId: id(p) })).catch(close);
    } catch (_) { close(); }
    return result;
  }
  window.CoveNative.ads = {
    enabled: true, testMode: config.testMode, initialize, ready, prepare, show,
    get showing() { return showing; },
    get privacyRequired() { return consent?.privacyOptionsRequirementStatus === 'REQUIRED'; },
    async privacyOptions() {
      if (showing || preparing) return;
      loaded.clear();
      await sdk.showPrivacyOptionsForm();
      consent = await sdk.requestConsentInfo();
      // Consent may change. Do not reinitialize the already initialized SDK.
    }
  };
})();
