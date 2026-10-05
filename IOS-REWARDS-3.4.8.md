# iOS rewards test — 3.4.8

Approved October 5, 2026 for iOS TestFlight only. Google sample rewarded ads remain enabled. Do not release this branch to main, Android, or the App Store.

- Welcome-back screen loads the optional ad while regular collection remains available; failed loading exposes Retry.
- Completed adventures offer doubling of the actual shells, pearls, and driftwood earned (including party shell bonus).
- Existing Founding Covekeeper entitlement doubles these rewards without ads or ad cooldown/daily caps. Unique discoveries are not duplicated.
- Founder package and plaque copy describe the new benefit. This approved change supersedes cosmetic-only guidance for these two iOS reward placements.
- Normal ad age eligibility and frequency limits remain: adults who provided a birth year, up to 3 successful bonuses/day, 15 minutes between successful bonuses. Founders bypass these ad rules.
- SDK initialization failures can retry. Regular rewards are saved before presenting an ad. Only the SDK reward callback grants the extra resources.

Validation: scripts/test-admob.mjs covers platform exclusion, initialization concurrency/retry, consent, test IDs, duplicate/cancel/failure events, offline collection, Founder doubling, adventure totals and nonduplicated discoveries. npm run build assembles the native payload. Physical iPhone ad playback still requires TestFlight testing.

Device checks:
1. Non-Founder adult: return after at least 45 seconds away with a positive earning rate; wait for optional ad, watch it to completion, verify 2x shells.
2. Complete an adventure: confirm normal rewards, then watch optional test ad for matching extra shells/pearls/driftwood.
3. Cancel an ad and test without internet: regular rewards remain; no bonus without reward completion.
4. Founder: offline and adventure rewards are 2x with no ad request, including when offline. Check package description.
5. Repeat tap collection: no duplicate grant. Allow 15 minutes between successful non-Founder ad claims; daily cap is 3.
