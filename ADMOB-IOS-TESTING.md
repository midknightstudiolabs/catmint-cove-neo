# iOS rewarded ads — local integration, not released

Production identifiers are recorded in `scripts/admob-config.js`. `testMode: true`
routes every rewarded request to Google's iOS demo unit, regardless of placement.
No Android or web ad requests; Android's explicit plugin list excludes AdMob.

## Placements
- Offline: optional extra shells equal to the normal offline award. The normal
  award is saved before showing the ad, so failure/closing preserves it.
- Adventure: optional one driftwood after the normal homecoming rewards.
- Shared maximum: three bonuses per UTC day, at least 15 minutes apart.
  Declining an offer also suppresses other offers for 15 minutes in that session.
- Founding Covekeeper/supporter: same limits and bonus, no video required.
- Unknown ages and under-18 players: no SDK initialization or ad requests.
- No forced ads. Unavailable/unloaded ads simply omit the optional button.

## Consent and implementation
UMP runs at the boot boundary after the existing age gate, before SDK startup.
Only non-personalized requests are made; no ATT request is introduced.
Help → credits/legal includes Ad privacy choices when UMP requires it.
The pinned plugin 8.1.0 needs the small postinstall patch to bind its consent
presenter's host before initialize(). Re-review this when upgrading the plugin.
The iOS workflow applies the App ID and Google's published SKAdNetwork list after
native generation using `scripts/configure-ios-admob.mjs`.

## Checks
Run `node scripts/test-admob.mjs` and `npm run build`.
Automated checks cover platform isolation, one-time initialization, test IDs,
consent ordering/denial, reward deduplication, skip/failure, base reward persistence,
double taps, supporter parity, caps and age eligibility. These use an SDK mock.
The existing RevenueCat webhook suite passes (8 tests). Runtime dependency audit
reports zero vulnerabilities; npm reports eight alerts in development tooling,
which were not changed as part of this integration.

Before a release: compile on macOS and test Google demo ads on an iPhone/iPad,
including audio restoration, background/return, UMP-required geography, privacy
choices, no network, skip, successful reward, and supporter purchases/restores.
Configure applicable Privacy & messaging forms in AdMob. Update the privacy policy
and App Store privacy disclosure for the SDK before submission. Confirm app-ads.txt
verification and AdMob readiness. Change testMode only for an approved release.

This work does not run the iOS workflow, upload TestFlight, publish Neo, or roll out
to production/Android. Native compilation and device behavior remain unverified
on this Windows machine. Local caps are gameplay safeguards, not server-side
fraud protection; no SSV endpoint is connected.
