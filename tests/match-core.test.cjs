// Matchmaking scoring core: deterministic (no randomness), documented weights,
// honest reasons and level source. Not an AI model; not a success guarantee.
const assert = require('node:assert/strict');
Object.defineProperty(global, 'navigator', { value: {}, configurable: true });
const mem = new Map();
global.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)) };
require('../shared/player-levels.js');
const core = require('../shared/match-core.js');

// 1. Determinism: identical inputs → identical output, even across calls.
const a1 = core.scoreCandidate('P', '19:00', '5', { level: 'P+', time: '19:30', distanceKm: 2 });
const a2 = core.scoreCandidate('P', '19:00', '5', { level: 'P+', time: '19:30', distanceKm: 2 });
assert.deepEqual(a1, a2, 'scoring is deterministic (no Math.random)');

// 2. Skill weights (70%): same level = 100, one step = 65, more = 30.
assert.equal(core.skillScore('P', 'P'), 100);
assert.equal(core.skillScore('P', 'P+'), 65);
assert.equal(core.skillScore('P', 'C'), 30);

// 3. Time closeness (15%) and distance (15%) behave as documented.
assert.equal(core.timeScore('19:00', '19:00'), 100);
assert.ok(core.timeScore('19:00', '20:00') < 100 && core.timeScore('19:00', '20:00') >= 40, '1h apart scores lower but bounded');
assert.equal(core.distanceScore('', '2'), 50, 'unknown max distance is neutral');
assert.equal(core.distanceScore('5', ''), 50, 'unknown candidate distance is neutral, not fabricated');
assert.equal(core.distanceScore('5', '5'), 0, 'distance at the max scores 0');
assert.equal(core.distanceScore('5', '2'), 60, 'distance inside range scores proportionally');

// 4. Bucket mapping for the coarse filter.
assert.equal(core.bucket('N'), 'beginner');
assert.equal(core.bucket('P'), 'intermediate');
assert.equal(core.bucket('C+'), 'advanced');

// 5. Reasons explain the result.
assert.ok(a1.reasons.some(r => r.includes('ระดับ')), 'reason includes the level comparison');
assert.ok(a1.reasons.some(r => r.includes('เวลาที่สะดวก')), 'reason includes time closeness');
assert.ok(a1.reasons.some(r => r.includes('2 กม.')), 'reason includes the real distance');

// 6. Level source tells who confirmed the level.
assert.deepEqual(core.levelSource({ assessment: { version: 2, selfLevel: 'N', confirmedLevel: 'P' } }).source, 'organizer-confirmed');
assert.deepEqual(core.levelSource({ assessment: { version: 2, selfLevel: 'N' } }).source, 'self-assessed');
assert.deepEqual(core.levelSource({}).source, 'none');

// 7. Composite score = round(skill*.7 + time*.15 + distance*.15).
const exact = core.scoreCandidate('P', '19:00', '10', { level: 'P', time: '19:00', distanceKm: 0 });
assert.equal(exact.total, 100, 'perfect match scores 100');

console.log('PASS: deterministic scoring, weights, reasons, level source, buckets');
// explicitly exit 0
process.exit(0);