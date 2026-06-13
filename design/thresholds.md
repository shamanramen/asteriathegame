# thresholds.md — fixed before implementation
- target_fps: 60 (16 ms frame budget); smoke red if avg FPS on reference route < 45
- draw_call_budget: 80 (mobile floor; same-type sprites batched — particles in one pass, tiles in one pass)
- worst_case_scene: fusion ultimate during 3-rival fight, 4 parallax layers, ~80 particles, screen flash, full HUD
- input latency: visible reaction ≤ 100 ms for every verb
- coyote time ≥ 80 ms; input buffer ≥ 100 ms (forgiveness, perturbed-route safe)
- trail heat: full = 100; decay 1.6/s while moving, 5/s while idle; star shard +12; rival kill +20; loss at 0
- comeback: from 33 heat a clean no-detour sprint to next shard cluster must survive (shard spacing ≤ 18 s of decay)
- contrast: contrast route (linger 10 s/chunk, wrong elements) must lose ≥ 60 s earlier or die at rival 2
- pattern-less (no dash) route must fail at rival 2's projectile fan
- launch→gameplay: ≤ 3 steps (title → element pick → run)
- run length target: 3–6 min; 6 chunks + nexus

## Smoke results (final, on published build)
- avg FPS dev overlay: 60 (idle scene and mid-run combat scene)
- draw calls: 14 (title) / 62 (mid-run) / 74 (death-state worst observed) — budget 80: PASS
- reference route (seed 7): WIN in 83s, hp 3, heat 90 — PASS
- contrast route (idle): trail-cold loss at 20s — PASS (decisions matter)
- pattern-less route (no dash): dies at first dash-gap, 16s — PASS (dash pattern is load-bearing)
- determinism: identical state after 600 fixed-input frames on same seed — PASS
- fuzzer: 3000 random-input frames, no crash — PASS
- seed sample: 20/20 seeds traversable to WIN — PASS

## Iteration 2 smoke (fusion + waystation + guardian + meta)
- reference route (seed 7): WIN 87s, beats The First Hunter (phase 2 reached, fragment persisted) — PASS
- contrast (idle): trail-cold at 20s — PASS
- pattern-less (no dash): fails first dash-gap — PASS
- determinism: PASS; fuzzer 3000 frames: PASS
- seed sample 20/20 WIN (harness uses altar trading when hurt) — PASS

## Iteration 3 smoke (animations, ward, blink, bestiary, cloaks, escape ending)
- reference (seed 7, no meta boons): ESCAPE reached 74.5s, hp 4 — PASS
- all four cloaks complete seed 7: ember 74s, tide 78s, gilded 74s, umbral 95s — PASS
- contrast (idle): trail-cold 20s — PASS; pattern-less (no blink): dies at first wide gap — PASS
- determinism PASS; fuzzer 3000 frames PASS
- seed sample 20/20 ESCAPE with frags reset to 0 (no boon assist) — PASS
- void fall is now 1 HP + respawn at last footing (forgiveness, §9); death only at 0 HP
- rival kill heals +1 HP (comeback support, L4)
