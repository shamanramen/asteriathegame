# ASTERIA: WISH OF THE FALLEN STAR — Game Bible & Design Handoff

> A complete explainer of the game as it exists today, written so the project (and
> its assets) can be carried into a design tool to build **more** — characters,
> enemies, levels, cloaks, fusion arts. Everything below is drawn directly from the
> shipped build (`game/game.js`, `game/strings.js`) and the design docs
> (`design/plan.md`, `design/thresholds.md`, `design/assets.csv`).
>
> Live build at export time: https://cosy-willow-917.higgsfield.gg/

---

## 1. Logline

A **2.5D pixel-art chase platformer**. Asteria — goddess of fallen stars — can grant
any wish, and every elementalist in the world hunts her. *You* hunt too, wielding
**forbidden elements no other elementalist can touch**, but you've forgotten *why*
you're chasing. And like Carmen Sandiego, **she always slips away** at the end. A
"win" is not catching her — it's closing the gap, remembering a little more, and
running again.

**Experience formula (from plan.md §3):** *"The player feels like a hunted hunter —
running with the pack but anomalous — because the game constantly pushes them forward
with a cooling trail while rivals intercept and forbidden elements only the player can
wield turn every fight into a spectacle."*

## 2. Format at a glance

| Field | Value |
|---|---|
| Genre | Chase platformer · dodge-and-cast combat · light roguelike |
| View | Continuous 2D side-view with 2.5D depth (parallax planes + Y-offset VFX lanes) |
| Players | Solo, one embodied hero |
| Session length | 3–6 minute runs |
| Structure | 6 authored chunks sequenced procedurally per seed + a nexus finale |
| Win / lose | Per-run. Win = reach the nexus and force Asteria's escape. Lose = HP hits 0 or trail heat hits 0 |
| Platforms | Desktop web + mobile web |
| Input | Keyboard, touch (on-screen buttons), gamepad (Gamepad API) |
| Tech | Single-file canvas engine, fixed-timestep loop, seeded RNG, sprite batching to hit 60 fps inside an 80 draw-call budget |
| Localization | Every player-visible string lives in `strings.js` (English today; externalized from day one) |

## 3. The world & premise

> *"Her island vanished. The world woke in her temples. Every elementalist hunts
> Asteria — she grants any wish. You chase too. You cannot remember why."* — intro

The setting is a ruined, void-dark cosmos of **fallen-star temples**: indigo stone,
muted gold trim, broken colonnades and statues drifting against a nebula full of
falling stars. Asteria's island disappeared and the world "woke in her temples,"
turning the whole landscape into a trail of her passing.

Magic is **elemental** and rigidly ordered — every elementalist is attuned to a
sanctioned element. The protagonist is an **anomaly**: they can wield **forbidden
elements** (lightning, gravity) that the established order says *no elementalist may
hold*. That transgression is the spine of both the mechanics (forbidden elements are
your strongest tools) and the mystery (why can *you* do this, and why have you
forgotten your own wish?).

## 4. Story arc so far

The narrative is delivered through **intercept cards** (each rival announces their
name and wish before you fight), **pickup callouts**, **echo absorptions** (lore on
each kill), and the **escape epilogue**. There is no cutscene system — story rides on
top of the chase.

**The intended emotional ramp (interest curve, plan.md §3, 0–10):**
wake/forge `3` → first sprint `5` → first pickup (lightning!) `7` → dip `4` →
rival 1 fight `7` → dip `5` → gravity pickup + fusion unlock `8` →
rival 2 (counter puzzle) `8` → final sprint, trail nearly cold `9` →
nexus boss-rival `10` → epilogue card `4`.
**The hook:** your first forbidden-element pickup within ~45 seconds.

**The recurring beat — the Carmen Sandiego rule (plan.md, Iteration 3):** Asteria
*always* escapes at the nexus. You lunge and catch only stardust. She tells you that
you were "a breath behind me this time," and where she stood, a **memory fragment**
glitters. You keep it. Next run you start a little more whole.

> Escape epilogue text:
> 1. *"You lunge — and catch only stardust."*
> 2. *"Better. You were a breath behind me this time. Keep that wish unwritten a little longer."*
> 3. *"She is gone. A memory fragment glitters where she stood."*

**The central mystery (open thread):** every hunter has a wish; yours is **blank**.
Rivals taunt you for it ("Yours is worth nothing — it's blank"). The forbidden
elements "answer a name you forgot." The meta-progression boon at 18 fragments has you
"wake with a name half-spoken." The arc is clearly building toward *recovering the
protagonist's identity and original wish* — but that reveal is **not yet written**.
This is the biggest hook left to expand.

## 5. The protagonist — the Anomaly

A hooded, star-marked runner in a coral-fire cloak; deliberately **racially/identity
ambiguous** and unnamed (the "blank wish"). Animation is a **procedural rig** with
three poses:

- **Run** — dynamic run pose (default while grounded and moving)
- **Stand** — idle pose, cloak settled (grounded + idle)
- **Jump** — mid-air pose (rising = knees tucked, falling = spread, via rotation/stretch)

The hero recolors into four **cloaks** (build choices — see §10), each a procedural
hue-shift of the ember original.

## 6. Asteria — the goal

The goddess of fallen stars; the thing you chase but never catch. Art brief: *"a
breathtaking, racially ambiguous goddess glancing back mid-run with a knowing smile,
trailing gold stardust."* She is never fought — she is the finish line that runs away.
She appears at the **nexus shrine** ("THE NEXUS SHRINE — SHE WAS SEEN HERE") and slips
away every time.

## 7. The rivals (interceptors)

Three rival elementalists ambush you along the route. Each **announces a name and a
wish** on an intercept card ("A RIVAL INTERCEPTS THE TRAIL"), then fights. Each has a
**sanctioned element, an attack pattern, a weakness, and an echo** they drop on death.
Defeating one absorbs its **echo**: +20 trail heat, +1 HP, fusion charge, and a lore
card.

| Encounter | Name | Court / Element | HP | Weak to | Projectile | Attack pattern | Echo (lore) |
|---|---|---|---|---|---|---|---|
| Chunk 2 (1st) | **Selene of the Moon Tide** | Water, grieving tide-moon mage | 8 | **Lightning** | water orb | Single aimed orb (slow), plus a **rain of 5 orbs from above** on a timer | Tide-memory echo of **Yemoja** ("Something almost surfaces…") |
| Chunk 4 (2nd) | **Pyrrhos of the Mars Court** | Fire, war-scarred duelist | 11 | **Gravity** | fire bolt | Fast single bolt (hardest-hitting straight shot) | War-fire echo of **Agni** ("The trail burns brighter") |
| Chunk 6 (3rd) | **Kestrel of the Mercury Winds** | Air, greedy wind trickster | 14 | **Gravity** | wind blade | **3-blade fan**, fastest fire rate | Storm-step echo of **Raijin** ("The nexus is close") |

**Their wishes (the human core of each fight):**
- **Pyrrhos:** *"My legion burned. She will return them. Stand aside, anomaly."* (grief → restoration)
- **Selene:** *"I only want one voice back. Why do YOU chase her? You don't even know."* (grief → and she names your blankness)
- **Kestrel:** *"Her wish is worth every coin in the world. Yours is worth nothing — it's blank."* (greed → and the cruelest cut at your missing wish)

**Element-counter law (P3):** hitting a rival with the element it's weak to deals
**2× damage** (and after it drops below 70% HP without you finding the weakness, the
game hints *"Its guard breaks under the right element."*). The matchup puzzle is what
makes forbidden elements feel essential.

## 8. The boss — The First Hunter

At the nexus stands **THE FIRST HUNTER** ("SOMETHING ANCIENT BLOCKS THE SHRINE") — a
towering, star-forged armored sentinel (the `guardian` sprite) with twin elemental
auras.

> *"I reached her first, once. My wish was to guard her forever. Yours ends here."*

He is the mirror of the protagonist: a hunter who **caught up to Asteria once**, and
whose wish was simply to stay near her forever. Mechanically he's a **two-phase
weakness-flip fight** (pattern P6 — boss phase-reading):

- **HP 26.** Off-element hits only do **0.5×** damage, so reading the phase is load-bearing.
- **Phase 1:** weak to **Lightning**; fires **2 lightning orbs** in a spread on a 52-frame period.
- **Phase 2 (flips at half HP):** *"ITS AURA SHIFTS — the old weakness no longer bites."* Weakness swaps to **Gravity**; fires **3 gravity rings** on a faster 46-frame period. You must switch elements mid-fight to keep pressure.

## 9. The bestiary (zodiac / myth mobs)

Roaming hazards seeded onto chunk segments — an **astrology/myth bestiary**. Each is
weak to one element (pattern P7), takes **2× from its weakness**, and has a distinct
movement AI.

| Mob | Myth / theme | HP | Weak to | Behavior |
|---|---|---|---|---|
| **Harpy** | Harpy of Mercury — winged teal storm-feather flyer | 2 | **Fire** | Circles, then dives at the player |
| **Golem** | Golem of Capricorn — stone, goat horns, gold rune seams | 4 | **Lightning** | Slow walker; **charges when aligned** horizontally |
| **Serpent** | Twin-headed sea serpent of Neptune | 2 | **Lightning** | Stationary; **lobs water arcs** |
| **Lion** | Nemean sun-lion, solar-flare gold mane | 2 | **Gravity** | Prowls, then **pounces in an arc** |

## 10. NPCs — the Oracle & the Sanctuary

A **waystation** breaks the chase: the **Oracle Sanctuary**, a designed breather and a
**zero-heat-decay "no rules zone."** The keeper is the **Oracle** — a hooded
star-oracle with a floating gold astrolabe.

> *"Anomaly. Even blank wishes cast shadows. Trade, rest, then run."*

You spend collected **star shards** at two altars (stand close + CAST to trade):
- **Altar of Vessels** — 3 shards: restore vitality (HP).
- **Altar of Names** — 4 shards: fill the fusion meter.

## 11. Elements, forbidden elements & fusion arts

Three elements are in the build. You **start with Fire**; the other two are the
**forbidden elements** you pick up mid-run — the moments the game flags
"FORBIDDEN ELEMENT LEARNED."

| Element | Status | Pickup line |
|---|---|---|
| **Fire** | Starting, sanctioned | — |
| **Lightning** | **Forbidden** | *"LIGHTNING — an element no elementalist may wield. But you can."* |
| **Gravity** | **Forbidden** (Saturn's bind) | *"GRAVITY — Saturn's bind answers a name you forgot."* |

**Fusion arts (pattern P4/P5):** holding cast with **2+ elements** charges a fusion
meter; spending it unleashes a screen-clearing ultimate (*"echoes spent. The forbidden
answers."*). Each element has its own named art:

- **War Storm** (Fire fusion)
- **Starfall Verdict** (Lightning fusion)
- **The Name That Escapes** (Gravity fusion) — note the title tying fusion back to the identity mystery.

Fusion is high-risk mid-chase: long windup, but big payoff against packs. It deals
flat 3.2 damage and pierces, ignoring the off-element penalty.

## 12. The cloaks (build choice at the forge)

Before each run you pick a **cloak** at the forge ("CHOOSE YOUR CLOAK — each cloak
carries a different discipline"). All four are procedural recolors of the ember hero,
each shifting the build:

| Cloak | Discipline | Effect |
|---|---|---|
| **Ember** | War-fire | +30% spell damage, fusion charges faster |
| **Tide** | Moon-tide | Stronger ward that **reflects shots back** |
| **Gilded** | Mercury | Swifter stride; **shards worth double trail heat** |
| **Umbral** | Void | Longer blink, longer i-frame grace after it |

## 13. Verbs / mechanics

The core action vocabulary (plan.md §4 + iterations):

- **RUN** — A/D or arrows. Moving keeps your trail hot (chase law P1).
- **JUMP / DOUBLE JUMP** — Space/W. One air jump, refreshed on landing; star-burst particles + sfx mark the double jump.
- **BLINK STEP** — K/C. The dash is now a **teleport with afterimages**; i-frames through projectiles, phases through rivals, shatters brittle crystal. Load-bearing — a no-blink route dies at the first wide gap.
- **CAST** — J/X / mouse. Element-typed projectile. Damages rivals/mobs (matchup matters), destroys hazard orbs, opens element-sigil star-gates.
- **SWITCH ELEMENT** — Q. Changes cast type, matchups, and gate access.
- **WARD** — I / hold S. Hold-block that absorbs projectiles and drains a guard gauge ("WARD SHATTERED" if overrun); the Tide cloak **reflects** shots.
- **FUSE** — L/Z. Spend fusion meter on a screen-clearing art (see §11).
- **ABSORB ECHO** — automatic on rival kill: mana refill + heat bonus + HP + lore card.
- **TRADE** — at sanctuary altars, spend shards.
- **PAUSE** — P.

**Forgiveness systems:** coyote time ≥ 80 ms, input buffer ≥ 100 ms; a **void fall is
1 HP + respawn at last footing** (not instant death). Death only at 0 HP.

## 14. The trail-heat system (the chase engine)

The signature mechanic. A constantly-draining meter that turns time into pressure and
makes **forward momentum survival** (law P1).

| Parameter | Value |
|---|---|
| Full heat | 100 |
| Decay while moving | 1.6 / second |
| Decay while idle | 5 / second (camping kills you) |
| Star shard pickup | +12 heat |
| Rival kill | +20 heat (+1 HP) |
| Loss condition | heat reaches 0 → "THE TRAIL WENT COLD" |
| Comeback rule | from 33 heat, a clean no-detour sprint to the next shard cluster must survive (shards spaced ≤ 18 s of decay) |

This is what creates the core decision the prototype was built to test: **skip a
pickup and keep momentum, or detour and risk the trail going cold.**

## 15. Level structure

A run is **6 authored chunks sequenced procedurally per seed + a nexus finale**
(light roguelike). Terrain: ground, slopes, crumbling star-bridges, gaps, brittle
crystal walls, sealed star-gates (opened with a matching element), hazard orbs.

- **Rivals** appear at **chunks 2, 4, 6.**
- A **waystation (Oracle Sanctuary)** appears as a designed breather (no heat decay).
- The **nexus** holds the **First Hunter** boss, then Asteria's escape.
- Background = **4 parallax layers** (far nebula, mid colonnade silhouettes, near
  arches/statues, plus the play plane).
- Chunk layout and which element pickups spawn **vary per seed**; the player decides
  routes after seeing them (randomness-before-decision).

**Verified by the smoke harness:** 20/20 seeds are completable; reference seed 7
reaches ESCAPE in ~74.5 s; all four cloaks clear seed 7; idle play dies to a cold
trail at ~20 s; a no-blink run dies at the first wide gap.

## 16. Endings

| State | Trigger | Text |
|---|---|---|
| **Escape (the "win")** | Reach the nexus, survive the boss, force the escape | "SHE SLIPS AWAY AGAIN" + the 3-line epilogue + a memory fragment |
| **Trail cold** | Heat hits 0 | "THE TRAIL WENT COLD — Asteria slipped away. The pack runs on without you." |
| **The void** | Fall death (only at 0 HP after the respawn buffer) | "THE VOID CLAIMS YOU — Your wish, whatever it was, stays forgotten." |
| **Struck down** | HP hits 0 in combat | "STRUCK DOWN ON THE TRAIL — The other hunters do not look back." |

## 17. Meta-progression — memory fragments

The only thing that persists between runs (stored in `localStorage`). You earn a
**memory fragment** each time you force Asteria's escape. Boons unlock at thresholds
and tie directly into the identity mystery:

| Fragments | Boon |
|---|---|
| **5** | *"a sixth vessel of vitality"* (+1 max HP) |
| **10** | *"the dash answers faster"* (shorter blink cooldown) |
| **18** | *"you wake with a name half-spoken"* (fusion +50%) |

The game also tracks **CLOSE CALLS** (how near you got) as a run-quality metric.

## 18. Art direction — the STYLE FORMULA

Every asset was generated against one **byte-identical style prompt** (keep this exact
wording to make new assets that match):

> *chunky pixel art with crisp pixel clusters and HD-2D glow depth; angular mythic
> silhouettes with thin dark void-blue outlines; environment in void-dark indigo stone
> with muted gold trim, hero in warm coral-fire tones contrasting the surroundings,
> hazards and pickups marked with saturated jewel glows of violet, teal and amber;
> saturated jewel tones on near-black void atmosphere with soft starlight bloom; high
> contrast between game elements and backgrounds, clean readable silhouettes,
> consistent side-view perspective across all assets*

**Palette anchors:**

| Role | Hex |
|---|---|
| Fire (hero) | `#d4634a` |
| Earth | `#7a8e5e` |
| Air / gold | `#c9a86b` |
| Water | `#4a7a9c` |
| Void (background) | `#07060c` |
| Special (forbidden/lightning) | `#9f7bff` |

**Processing pipeline:** raw generations are 1024px on a magenta/green key
background. They're **keyed (background removed), cropped, and NEAREST-scaled** into
the in-game set. **Cloak variants and pose sprites are procedural recolors** of the
ember originals — a hue-shift on the warm-cloak mask (recipe lives in `tools/`).

## 19. Audio

- **music.m4a** — relentless dark synth-orchestral chase loop with mythic choir hits (loops, volume 0.30).
- **sfx_cast** — elemental energy bolt zap.
- **sfx_pickup** — crystalline star-shard chime.
- **sfx_dash** — fast whoosh with a sparkle tail.
- **sfx_hit** — impact thud with a magical crackle.

## 20. Asset inventory

See `design/assets.csv` for the canonical manifest (id, role, type, description,
ratio, source). Quick categorical summary of what exists today:

- **Hero:** base run sprite + stand/jump poses, ×4 cloak recolors (ember/tide/gilded/umbral) → 12 in-game pose/cloak sprites.
- **Goddess:** Asteria (v1 + v2 "glancing back" final).
- **Rivals:** fire (Pyrrhos), water (Selene), air (Kestrel).
- **Boss:** guardian (The First Hunter).
- **NPC:** oracle.
- **Bestiary:** harpy, golem, serpent, lion.
- **Environment:** ground tile, 3 parallax backgrounds (far/mid/near).
- **VFX / pickups:** fire bolt, water orb, wind blade, lightning orb, gravity ring, star shard (+ the raw `vfx.png` sheet).
- **Audio:** 1 music loop + 4 SFX.
- **Reference sheets:** `contact_sheet.png`, `cloak_sheet.png`.
- **Procedural (code-drawn, no source file):** particles, HUD, afterimages, ward arc, muzzle flash, squash/recoil.

## 21. Open threads — where to expand next

Natural directions for new content, grounded in what the design already sets up:

- **The protagonist's wish & identity** — the central mystery is unwritten. Fragments,
  the "name half-spoken" boon, and "answers a name you forgot" all point at a reveal arc.
- **More rivals / a fuller pantheon** — only 3 of presumably many elementalist courts
  exist (Mars, Moon, Mercury). Earth (`#7a8e5e`) is in the palette but has no element,
  rival, or fusion art yet — an obvious next element.
- **More bestiary** — the zodiac/myth framing (Capricorn, Neptune, Mercury, Nemean) is
  a ready scaffold for a full 12-sign roster.
- **More cloaks / fusion arts** — the cloak and fusion systems are data-driven and easy
  to extend.
- **More chunks / biomes** — chunks are authored then sequenced; new chunk templates and
  a second visual biome would deepen the roguelike loop.
- **A real ending to the chase** — what happens if you ever *do* catch her, or finish
  remembering?

## 22. Controls (quick reference)

```
A / D or ←/→ : run            Space / W : jump (press again mid-air: DOUBLE JUMP)
J / X        : cast           K / C     : blink step
I / hold S   : star ward      Q         : switch element
L / Z        : fusion art     P         : pause
```
Touch buttons on mobile (left side = move, right side = jump/cast/dash). Gamepad
supported (d-pad/stick move, A jump, X cast, B dash). Add `?dev=1` to the URL for an
FPS / draw-call overlay.
