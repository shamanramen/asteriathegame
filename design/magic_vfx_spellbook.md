# ASTERIA — Magic & VFX Spellbook

> A full menu of magic effects and special effects for every magic system in the
> game, written so new spells/VFX can be generated **without breaking the established
> look**. Grounded in the shipped engine (`game/game.js`): element stats, the particle
> system, projectile sprites, fusion arts, ward/blink/echo FX, and the STYLE FORMULA.
>
> Read **§0 first** — it's the rule set that keeps everything on-style. Every later
> entry assumes it.

---

## §0 — The one rule: keep the style

Everything below must read as the same game. Three things enforce that: the **style
prompt**, the **palette**, and the **production specs** of a VFX asset.

### The STYLE FORMULA (use this verbatim for any new sprite/VFX generation)
> chunky pixel art with crisp pixel clusters and HD-2D glow depth; angular mythic
> silhouettes with thin dark void-blue outlines; environment in void-dark indigo stone
> with muted gold trim, hero in warm coral-fire tones contrasting the surroundings,
> hazards and pickups marked with saturated jewel glows of violet, teal and amber;
> saturated jewel tones on near-black void atmosphere with soft starlight bloom; high
> contrast between game elements and backgrounds, clean readable silhouettes,
> consistent side-view perspective across all assets

### Palette anchors (every effect picks its color from here)
| System | Hex | Feel |
|---|---|---|
| Fire | `#d4634a` | warm coral-ember |
| Earth | `#7a8e5e` | mossy stone-green |
| Air / Gold | `#c9a86b` | muted gold (also the universal "star/treasure" accent) |
| Water | `#4a7a9c` | cool tide-blue |
| Void / Gravity | `#07060c` / `#6d5a9e` | near-black + dim violet |
| Lightning / Special | `#9f7bff` | electric violet (the forbidden glow) |
| Storm (Tempest) | `#3bb0b8` | teal |
| Blood (Sanguine) | `#8f2230` | deep crimson |
| Mystic (Amethyst) | `#c14fb8` | magenta |

### Production specs (match the existing VFX assets: `fire_bolt`, `lightning_orb`, etc.)
- **Generated on a magenta key** (`~#fc00f8`), then keyed → cropped → **NEAREST-scaled** down. Hard 1-bit alpha (no soft edges).
- **Thin dark void-blue outline** on every sprite; **soft starlight bloom** for the glow (the bloom is the only "soft" element).
- **Projectile sprites are small** (roughly 24–64 px in-engine) and read as a single bright jewel cluster against the void.
- **Procedural particles** are the workhorse: `spawnParts(x,y,color,n,spd)` emits **4×4 square** clusters in one palette color, drifting up then falling (slight gravity). They are **batched by color** into one draw call — so *new particle effects cost nothing if they reuse a palette color*.
- **Stay inside the budget:** 60 fps within ~80 draw calls. Screen-filling moments (fusion) use one screen-flash rect + one batched particle pass, not hundreds of sprites.

### The four "channels" every magic effect uses
1. **Projectile sprite** (the cast object) — small keyed PNG, element color.
2. **Muzzle/impact particles** — `spawnParts` in the element color (cast already spawns 4; impacts spawn 8).
3. **Trail / aura** — afterimages (`ghost` parts) or a stroked arc, in the system color at ~0.85 alpha.
4. **Screen language** — flash, shake, i-frames, slow-mo for the big ones.

---

## §1 — Castable magic systems (in the build today)

These three exist and are tuned. For each: what it does now, then on-style additions.

### 🔥 Fire — `#d4634a` (sanctioned, your starting element)
**Now:** straight bolt, speed 9, dmg 1, single-hit, cast every 18f. Sprite `fire_bolt`.
**Magic effects that fit:**
- **Ember Lash** — short-range cone of 3 quick sparks (close-quarters punish).
- **Cinder Mine** — lob a slow ember that sticks to ground and bursts when a mob nears.
- **Pyre Wall** — a brief vertical flame curtain that burns projectiles passing through.
- **Backdraft (charge)** — hold-cast releases a wider, faster bolt with knockback.
**Special FX (in-style):** coral `#d4634a` square sparks with a few `#c9a86b` gold embers mixed in; heat-shimmer as a 1–2 px vertical wobble on the bolt; impact = 8-particle coral burst + a single bright bloom frame. Trailing embers fall (gravity) like the existing particles.

### ⚡ Lightning — `#9f7bff` (FORBIDDEN)
**Now:** fast (speed 14), dmg 1.5, **pierces** (passes through enemies, hits a line), cast every 14f. Sprite `lightning_orb`.
**Magic effects that fit:**
- **Chain Arc** — on hit, forks a thin bolt to the nearest other enemy (1–2 jumps). *Reads perfectly as "forbidden" power.*
- **Blink-Strike** — a bolt that the player can teleport to (ties into the existing Blink).
- **Static Field** — a lingering crackling zone that stuns/slows mobs that enter.
- **Overload (charge)** — a screen-tall vertical lightning column on a delay (telegraph then strike).
**Special FX:** violet `#9f7bff` core with white-hot center pixels; jagged 1px-wide branch segments (drawn as short angled rects, not smooth). Pierce trail = a fading violet line of square particles. Impact = white flash + violet sparks. Keep the glow brightest of all elements — it's the "no one else may wield this" element.

### 🪐 Gravity — `#6d5a9e` (FORBIDDEN, Saturn's bind)
**Now:** slow (speed 5.5), heavy (dmg 2.2), big (size 1.5), cast every 30f. Sprite `gravity_ring`.
**Magic effects that fit:**
- **Singularity** — the ring expands then *implodes*, pulling mobs/projectiles inward (crowd control).
- **Crush Field** — a slow ground-bound well that pins and damages over time.
- **Repulse** — a short reverse pulse that shoves projectiles and enemies away (defensive).
- **Tidelock (charge)** — briefly freezes a single enemy's projectiles mid-air.
**Special FX:** concentric `#6d5a9e` rings with a dark `#07060c` void center; particles spiral **inward** (invert the usual outward `spawnParts` by giving inward velocity) — a unique, readable signature. Add faint warped-space ripple (a ring that scales up and fades). Heaviest cast = brief screen-shake.

---

## §2 — Pantheon magic systems (in the world, ready to make castable)

These exist as cloak disciplines / rival elements / bestiary themes but aren't yet
player spells. Each is a complete kit to drop in. Colors are already in the palette.

### 🌊 Water / Tide — `#4a7a9c` (Selene; Tide cloak)
**Already in-world:** rival `water_orb` (arcing lobs + overhead rain); Tide cloak ward **reflects**.
**Effects:** **Tide Lob** (arcing projectile that splashes into 3 droplets on landing) · **Riptide** (a horizontal wave that pushes the player or enemies) · **Mirror Ward** (deepens the reflect theme — a bubble that returns shots) · **Drown Pool** (slows mobs standing in it).
**FX:** blue `#4a7a9c` orbs with a lighter cyan rim; droplet particles that *arc and splash* (give particles a bounce on the ground line); a soft caustic shimmer (1px lighter speckles). Splash = wide low burst rather than radial.

### 🌬️ Air / Wind — `#c9a86b` gold (Kestrel; Gilded/Mercury cloak)
**Already in-world:** rival `wind_blade` 3-blade fan; Gilded cloak = speed + shard value.
**Effects:** **Gale Fan** (3–5 thin blades in a spread — already the rival pattern, give it to the player) · **Updraft** (a vertical gust that boosts jump height / floats) · **Cyclone** (a small moving tornado that carries pickups/shards toward you — synergy with Gilded) · **Slipstream** (brief speed + reduced friction).
**FX:** gold `#c9a86b` crescent blades, very thin and fast; motion = faint curved streak lines; particles are *horizontal* and sparse (wind doesn't fall — give them low gravity and sideways drift). Updraft = upward gold motes.

### ⛰️ Earth / Stone — `#7a8e5e` (Verdant/Gaia cloak; the Capricorn golem)
**Already in-world:** golem mob (charges); Verdant cloak = big ward + heavier strike; jump already puffs green `#7a8e5e` particles.
**Effects:** **Stone Shard** (slow heavy projectile, low arc) · **Bulwark** (a raised rock slab = temporary cover that eats projectiles, then crumbles — fits the crumbling star-bridges) · **Quake** (ground-bound shockwave that staggers grounded mobs; jump to avoid) · **Root Snare** (briefly holds a mob in place).
**FX:** mossy-green `#7a8e5e` with gold `#c9a86b` rune-seam flecks (echoes the golem's rune seams); chunky **blocky** debris particles (bigger 6×6 squares, heavy gravity, bounce once); dust kicked at the feet. Bulwark = a small keyed stone-slab sprite in temple-stone indigo with gold trim.

### 🌑 Void / Umbral — `#07060c` core, `#6d5a9e` edge (Umbral cloak; the anomaly's nature)
**Already in-world:** Umbral cloak = longer Blink + i-frames; Blink leaves violet afterimages.
**Effects:** **Phase Bolt** (a projectile that passes through terrain) · **Umbral Step** (the existing blink, extended — leave a damaging shadow trail) · **Eclipse** (briefly darkens the screen and erases enemy projectiles — a panic button) · **Shade Clone** (a still afterimage that draws enemy fire).
**FX:** near-black `#07060c` shapes **rimmed** in dim violet `#6d5a9e` (the void reads as a *hole* in the scene with a glowing edge); afterimages reuse the existing `ghost` particle (translucent sprite copies). Eclipse = a dark vignette rect + starfield twinkle. This is the subtlest, most "negative space" system — lean on the rim-light.

### 🌀 Storm / Tempest — `#3bb0b8` teal (Tempest cloak)
**Identity:** the marriage of Air + Lightning — fast, chaining, mobile (Tempest cloak already gives fast fusion + speed).
**Effects:** **Tempest Volley** (fast teal bolts that chain like lightning but arc like wind) · **Thunderhead** (a small cloud that rains 2–3 teal strikes on a timer — mirrors Selene's overhead rain, recolored) · **Squall Dash** (a blink that leaves a crackling teal wake).
**FX:** teal `#3bb0b8` with `#9f7bff` violet sparks at the tips (shows the lightning parentage); spiraling fast particles; a faint swirling streak. Distinct from pure lightning by the teal body + curved motion.

### 🩸 Blood / Sanguine — `#8f2230` crimson (Sanguine cloak)
**Identity:** high-cost, high-reward, life-driven (Sanguine = highest strike, thin guard).
**Effects:** **Hemorrhage** (a bolt that applies a bleed DOT) · **Bloodpact** (spend a sliver of vitality for a burst of damage — risky, fits the thin-guard glass-cannon) · **Crimson Leech** (on kill, recover a little HP — synergy with the existing +1 HP on rival kill) · **Sanguine Nova** (a close radial burst that costs ward).
**FX:** dark crimson `#8f2230` with brighter red core; **heavy, dripping** particles (high gravity, they fall and pool at the ground line); a thin red mist aura around the hero when active. Impacts splatter low, not radial.

### 🔮 Mystic / Arcane — `#c14fb8` magenta (Amethyst cloak)
**Identity:** trickery, blink, and economy (Amethyst = long blink + double shard value).
**Effects:** **Hex Bolt** (homing — gently curves toward the nearest enemy) · **Glyph Trap** (place a magenta sigil that detonates on contact — fits the "sealed star-gate sigil" visual language) · **Mirage** (a decoy that pulls aggro) · **Arcane Harvest** (briefly pulls shards toward you — doubles down on the cloak's economy).
**FX:** magenta `#c14fb8` with rotating **rune-glyph** sprites (reuse the star-gate sigil look); orbiting particles (give particles a circular velocity around a center); sparkle trail. Glyphs should look hand-drawn-pixel, angular, with the void-blue outline.

### ✦ Star / Stellar — `#c9a86b` gold + `#9f7bff` violet (Asteria; star shards; the win condition)
**Already in-world:** `star_shard` pickup (+trail heat), the gold double-jump burst, Asteria's stardust trail, fusion's gold accent particles.
**Effects:** this is the **goal/heat/economy** magic, not an attack — lean into utility: **Starfall** (the existing Starfall Verdict fusion) · **Wish-Spark** (a homing shard that restores trail heat) · **Constellation** (a brief star-map overlay that marks the route — a comeback/orienting tool) · **Stardust Veil** (Asteria's signature — a glittering screen wipe used for her escapes and the epilogue).
**FX:** gold `#c9a86b` + violet `#9f7bff` twinkle (two-color speckle), soft starlight bloom (brightest, softest glow in the game). Stardust = slow, lightly-falling motes that twinkle (alternate brightness per frame). This is the "treasure/magic" accent already sprinkled across pickups, altars, and fusion — keep it rare and bright so it stays special.

---

## §3 — Fusion arts (cross-element ultimates)

**Now:** holding cast with 2+ elements + full meter fires a **10-projectile fan + screen
flash + i-frames**. Named per current element: `War Storm` (fire), `Starfall Verdict`
(lightning), `The Name That Escapes` (gravity).

Fusion is where two systems combine — the richest space for new content. A combo matrix:

| Combo | Suggested art | Effect shape | FX |
|---|---|---|---|
| Fire + Lightning | **War Storm** *(exists)* | fan of piercing fire-bolts | coral + violet sparks, screen flash |
| Lightning + Gravity | **Starfall Verdict** *(exists)* | converging strikes that implode | violet rain into a `#6d5a9e` well |
| Fire + Gravity | **The Name That Escapes** *(exists)* | heavy radial burst | coral ring crushed inward |
| Fire + Water | **Scald Veil** | expanding steam ring (blocks + damages) | coral→`#4a7a9c` gradient, white steam motes |
| Air + Lightning | **Tempest Verdict** | chaining blades across the screen | teal `#3bb0b8` + violet, curved streaks |
| Earth + Gravity | **Tectonic Bind** | rising stone pillars that pin a row | green `#7a8e5e` blocks + `#6d5a9e` warp |
| Water + Void | **Drowned Star** | a dark whirlpool that swallows projectiles | `#4a7a9c` rim on `#07060c` core |
| Blood + Fire | **Pyre Oath** | self-damage → screen-clearing nova | crimson `#8f2230` + coral, low splatter |
| Mystic + Star | **Wishbreak** | homing glyphs that seek every enemy | magenta `#c14fb8` + gold twinkle |

**Style rule for all fusions:** one **screen-flash rect** (system color, ~40f fade) + one
**batched particle burst** (60 system-color + 30 gold `#c9a86b`) + i-frames. Big but
cheap — never spawn hundreds of unique sprites.

---

## §4 — Shared / utility special effects (cross-system)

These already exist or extend cleanly; keep them consistent across every system:
- **Ward** — stroked arc in the active color, ~0.85 alpha, pulsing radius. Tide reflects; new systems can theme the arc (stone slab, void rim, etc.).
- **Blink / dash** — `ghost` afterimages (translucent sprite copies) in the cloak color; add element-tinted wake for Storm/Void.
- **Double jump** — gold/green star-burst ring under the feet (`spawnParts`).
- **Echo absorb (rival kill)** — 40-particle burst in the rival's color + the lore card.
- **Pickups** — bob + twinkle; element pickups flash "FORBIDDEN ELEMENT LEARNED"; shards chime + gold burst.
- **Hazards / environment** — hazard orbs and sealed star-gates glow in their element color (gate sigil = the gate's required element); crumbling star-bridges shed stone debris.
- **Deaths** — trail-cold (fade to void), void-fall (dark swallow), struck-down (red impact).
- **Hit feedback** — every impact: 8 element-color particles + a 1-frame bright bloom + `sfx_hit`. Bigger hits add brief screen-shake.

---

## §5 — New-asset checklist (drop-in, on-style)

If you generate new VFX sprites, mirror the existing six (`fire_bolt`, `water_orb`,
`wind_blade`, `lightning_orb`, `gravity_ring`, `star_shard`):

| New asset id | System | Role | Spec |
|---|---|---|---|
| `ice_orb` / `tide_wave` | Water | projectile | small, `#4a7a9c`, cyan rim, magenta-key |
| `stone_shard` / `bulwark_slab` | Earth | projectile / cover | chunky, `#7a8e5e`, gold rune flecks |
| `void_bolt` / `eclipse_ring` | Void | projectile / screen | `#07060c` body, `#6d5a9e` rim |
| `tempest_bolt` | Storm | projectile | `#3bb0b8` + violet tips |
| `blood_bolt` | Blood | projectile | `#8f2230`, bright core, drippy |
| `hex_glyph` / `arcane_sigil` | Mystic | projectile / trap | `#c14fb8`, rotating rune, angular |
| `wish_spark` | Star | homing pickup | gold `#c9a86b` + violet twinkle |

**Every one:** magenta-key background · thin void-blue outline · single readable jewel
cluster · soft bloom · NEAREST downscale to match the chunky grid. Generate with the
§0 STYLE FORMULA string prepended, and the system's palette hex named in the prompt.

---

### TL;DR for staying on-style
1. Pick the **color from the palette table** — never invent a new hue.
2. **Particles do the heavy lifting** (4×4 squares, batched by color) — most "new" FX are just a new *motion* of existing-colored particles (inward for gravity, sideways for wind, dripping for blood, orbiting for mystic).
3. New **sprites** follow the six existing VFX exactly: magenta key, void-blue outline, jewel glow, NEAREST.
4. **Big moments = one flash + one batched burst**, not many sprites (budget: 60 fps / 80 draw calls).
5. Keep **violet (lightning)** and **gold/violet (star)** the rarest, brightest glows — they signal "forbidden" and "the goddess," the two things that should always feel special.
