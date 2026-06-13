# Asteria: Wish of the Fallen Star — Project Export
Exported: 2026-06-12 · Play it live: https://cosy-willow-917.higgsfield.gg/

A 2.5D pixel-art chase platformer. Every elementalist hunts Asteria, goddess of
fallen stars — she can grant any wish. You hunt too, wielding forbidden elements,
but you've forgotten why. And like Carmen Sandiego, she slips away every time.

## What's in this zip

### game/  — the playable build (deploy-ready)
- index.html        entry page (canvas + dev overlay; add ?dev=1 for FPS/draw calls)
- game.js           the whole engine + game (fixed-timestep loop, seeded RNG,
                    input as commands, procedural animation rig, level generator)
- strings.js        every player-visible string (external for localization)
- assets/           processed in-game assets (keyed, cropped, NEAREST-scaled):
  - player_*.png        run-pose sprite, one per cloak (ember/tide/gilded/umbral)
  - pose_stand_*.png    standing idle pose, per cloak
  - pose_jump_*.png     mid-air jump pose, per cloak
  - asteria.png         the goddess (racially ambiguous, glancing back)
  - rival_fire/water/air.png   rival elementalists
  - oracle.png, guardian.png   sanctuary keeper + nexus boss
  - harpy/golem/serpent/lion.png  zodiac bestiary
  - tile.png, bg_far/mid/near.png  ground tile + 3 parallax layers
  - fire_bolt/water_orb/wind_blade/lightning_orb/gravity_ring/star_shard.png  VFX/pickups
  - music.m4a, sfx_cast/pickup/dash/hit.mp3  audio
- Note: cloak variants and pose sprites are procedural recolors of the ember
  originals (hue-shift on the warm cloak mask) — recipe in tools/, see process.py history.

### assets/  — raw AI generations (pre-processing)
Original 1024px outputs on magenta/green key backgrounds, before keying/cropping.
Useful if you want to re-cut sprites at different sizes.

### design/  — the design system artifacts
- plan.md           game profile, laws, concept, verbs, prototype questions +
                    iteration logs (fusion/waystation/boss, cloaks/ward/blink/
                    bestiary/escape ending, poses/double jump)
- assets.csv        the asset manifest (every asset, its role, source)
- thresholds.md     all tuning numbers + smoke test results per iteration

### tools/  — headless test harness (node)
- smoke.mjs         reference/contrast/pattern-less routes + determinism + fuzzer
                    (runs update+render every frame; catches render-only crashes)
- seeds.mjs         20-seed completability sweep (pass a seed for verbose trace)
- trace_seed.mjs    deep trace of a single seed
Run: node tools/smoke.mjs  (from the project root)

## Controls
A/D or arrows: run · Space/W: jump (press again mid-air: DOUBLE JUMP) ·
J/X: cast · K/C: blink step · I / hold S: star ward · Q: switch element ·
L/Z: fusion art · P: pause. Touch buttons on mobile; gamepad supported.

## The STYLE FORMULA (byte-identical in every asset generation)
chunky pixel art with crisp pixel clusters and HD-2D glow depth; angular mythic
silhouettes with thin dark void-blue outlines; environment in void-dark indigo
stone with muted gold trim, hero in warm coral-fire tones contrasting the
surroundings, hazards and pickups marked with saturated jewel glows of violet,
teal and amber; saturated jewel tones on near-black void atmosphere with soft
starlight bloom; high contrast between game elements and backgrounds, clean
readable silhouettes, consistent side-view perspective across all assets

## Palette anchors
fire #d4634a · earth #7a8e5e · air/gold #c9a86b · water #4a7a9c · void #07060c · special #9f7bff
