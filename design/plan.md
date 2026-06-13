# Asteria: Wish of the Fallen Star — design/plan.md (mode S, §§1–5 merged)

## §1 Game profile
- Time: real-time, fixed-timestep simulation.
- Space: continuous 2D side-view with 2.5D depth (parallax planes, Y-offset depth lanes for VFX).
- Player agency: one embodied hero (the memory-lost anomaly elementalist).
- Conflict: versus the system (rival interceptors, trail-cooling timer) — chase pressure, John Wick energy.
- Content: authored level chunks sequenced procedurally per run (light roguelike).
- Outcome: finite per run — reach the nexus shrine where Asteria was last sighted before the trail goes cold; lose if HP hits 0 or trail heat hits 0.
- Players: solo.
- Session: minutes (3–6 min run).
- Engagement source (primary 2): execution (dodge-and-cast platforming under chase pressure) + growth/accumulation (element pickups, fusion).
- Strictness mode: S.

### Delivery context
- Target platforms: desktop web + mobile web.
- Input: keyboard (physical key codes: KeyA/KeyD or ArrowLeft/ArrowRight move, Space/KeyW/ArrowUp jump, KeyJ / mouse-click cast, KeyK dash), touch (on-screen left/right/jump/cast/dash buttons), gamepad (d-pad/left-stick move, A jump, X cast, B dash) via Gamepad API.
- Languages: English; all player-visible strings external in strings.js from day one.
- Performance budgets (§7.5): draw_call_budget = 80 (mobile floor); entity_count_estimate = ~120 (player + 6 rivals/projectiles + ~40 particles + ~60 background sprites, batched); worst_case_scene = "fusion ultimate cast mid-rival-fight: full parallax (4 layers), 3 rivals on screen, ~80 VFX particles, screen-flash, trail UI" — all same-type entities batched to single draw calls via canvas sprite batching.

## §2 Laws
Learnable patterns:
- P1 Trail heat: lingering cools the trail; forward momentum is survival (chase law).
- P2 Dodge-and-cast: rival projectiles telegraph; dash i-frames through them, cast punishes.
- P3 Element counters: each rival is attuned; the right element (esp. forbidden specials) breaks their guard faster.
- P4 Fusion timing: holding cast with 2+ elements charges a fusion art — big payoff, long windup, risky mid-chase.

Loops: short (seconds) — run/jump/dash/cast through a chunk; medium (minutes) — a full run: pickups → rival fights → nexus; long — retry runs with knowledge of rival patterns and element counters.

Uncertainty sources (2–3 with carrier mechanics):
- Performative — platforming + dodging under trail-heat time pressure (carrier: movement/dash).
- Randomness-before-decision — chunk sequence and which element pickups spawn vary per seed; player decides routes/elements after seeing them (carrier: procedural chunk sequencer).
- Anticipation — which rival intercepts next and their stated wish (carrier: rival roster reveal cards).

Horizon → source map: jump/dash window → performative; chunk → randomness (layout/pickups); run → anticipation (rival roster, nexus). No empty rows.

## §3 Concept
Experience formula: "The player feels like a hunted hunter — running with the pack but anomalous — because the game constantly pushes them forward with a cooling trail while rivals intercept and forbidden elements only the player can wield turn every fight into a spectacle."

Pillars: Mechanics (chase platforming + dodge-and-cast) reinforced by Story (everyone has a wish; you forgot yours — shown via rival intro cards), Aesthetics (jewel-tone pixel VFX on void-dark HD-2D parallax), Technology (canvas sprite batching enabling screen-filling elemental VFX at 60fps).

Formal elements: 1 player; goal set by game (reach the nexus before trail cools); actions: run, jump, dash, cast, switch element, absorb echo; rules explicit + discovered (element counters discovered); resources: trail heat (time), HP, mana, elements/echoes; conflict: rivals + terrain + timer; boundary: one run; outcome: win/lose per run.

Interest curve (session, 0–10): wake/forge 3 → first sprint 5 → first pickup (lightning!) 7 → dip 4 → rival 1 fight 7 → dip 5 → gravity pickup + fusion unlock 8 → rival 2 (counter puzzle) 8 → final sprint, trail nearly cold 9 → nexus boss-rival 10 → epilogue card 4. Hook: the first forbidden-element pickup inside 45 seconds.

## §4 System
Verbs:
- RUN (objects: ground, slopes, crumbling star-bridges, trail-heat — moving keeps heat up) — strong.
- JUMP (platforms, gaps, hazards, rival shockwaves — jumpable) — strong.
- DASH (gaps, projectiles [i-frames], rivals [phase-through], brittle crystal walls [shatter]) — strong.
- CAST (rivals [damage, element matchup], hazard orbs [destroy], sealed star-gates [open with matching element]) — strong.
- SWITCH ELEMENT (changes cast + matchup + gate access) — support verb feeding CAST.
- ABSORB ECHO (defeated rival drops an echo → mana refill + heat bonus + lore card) — support verb feeding growth.

Development: CAST grows from 1 primal element → +special elements (lightning chain, gravity well) → fusion art (War Storm: held cast with fire+lightning). DASH gains element-tint (lightning dash teleports slightly further).

Feedback loops: absorbing echoes makes you stronger (positive) — counterweight: later rivals scale and trail demands more speed; trail heat is a negative loop on lingering (camping to farm = lose). Comeback: heat pickups (star shards) along the route restore trail heat; from one-third heat a clean sprint recovers.

Information map: HP/mana/heat/elements — open (HUD). Rival element + wish — revealed on intercept card (player learns: every rival announces). Chunk sequence — hidden until entered (anticipation). Element-gate requirements — shown by gate sigil color. Fusion availability — HUD glow when 2+ elements held.

## §5 Prototype question
"Does trail heat + forward chase pressure create real decisions (skip pickup vs detour), and is dodge-cast combat readable at chase speed?" Verified analytically + in-build via reference route through chunk set on fixed seed; contrast route (linger + ignore matchups) must fail by heat-death; pattern-less route (never dash) must fail rival 2. Exit criteria tracked in thresholds.md; worst-case scene assembled in slice and measured ≥60fps within 80 draw calls.

## Iteration 2 (post-base approval)
New patterns: P5 fusion timing (charge in combat, spend on packs of danger); P6 boss phase-reading (weakness flips at half HP - switch elements or stall).
New verbs: FUSE (consumes meter, clears screen), TRADE (shards at waystation altars).
Waystation = designed breather (zero heat decay zone) per §8.2 compression/expansion.
Meta-progression: memory fragments (localStorage), boons at 5/10/18 fragments. Smoke harness stubs storage.

## Iteration 3
New verbs: WARD (hold block - absorbs projectiles, drains guard gauge; Tide cloak reflects), BLINK (dash is now a teleport with afterimages).
New pattern P7: enemy bestiary counters - each mob type weak to one element (harpy/fire, golem/lightning, serpent/lightning, lion/gravity).
Cloak system = build choice at forge: Ember (+dmg/+fusion gain), Tide (guard economy + reflect), Gilded (speed/shard value), Umbral (longer blink + i-frames).
Narrative change: Asteria ALWAYS escapes at the nexus (Carmen Sandiego rule). "Win" = closing the gap; escape counter + memory fragments persist.
Flow: title -> intro -> cloak forge -> run; death/win returns to forge (re-pick each run).

## Iteration 4
Pose sprites: stand (idle), jump (air). Rig picks pose: onGround+idle -> stand; airborne -> jump (rising tuck / falling spread via rotation+stretch); else run.
New verb upgrade: DOUBLE JUMP - one air jump, refreshed on landing; star-burst particles + sfx distinguish it. Umbral boon unchanged.
Deliverable: full project export zip (game/, design/, assets/, tools/).
