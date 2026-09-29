# Neo test build: Cove Stories and idle resort — 2026-09-29

Neo only. No primary-site, Android or iOS release.

- Introductions reveal panels automatically with gentle fades and reading time. Pause/resume and skip are available; the final panel waits for a deliberate Continue. Hidden tabs pause playback and reduced-motion settings disable transitions.
- Completed/skipped introductions do not repeat; discovered stories can be read in Journal → Cove Stories.
- Opening Cove, Festival, Café and Resort introductions share one framework.
- Activities → Cove Resort opens a separate map with four premade cottage plots.
- First cottage is free. Later plots, cottage tiers and beds use Shells.
- Guests check in/out automatically; earnings catch up for up to eight hours.
- Inspect cottages to see interiors and guest occupancy.
- Existing v2 resort saves retain their cottages and upgrades.

This is a playable direction test. The new scenes use lightweight canvas illustrations and existing cat drawings; they are not final painted comic/resort artwork. Hotel and pool expansion is not implemented.

Validation: resort economy unit checks; existing first-minutes regression suite; Edge browser flow for intro/tutorial, resort controls, phone viewport, repeat visits and Journal replay. Local PNG assets are served directly in the browser test to avoid the test environment's stalled image requests. Native releases were not built or triggered.

