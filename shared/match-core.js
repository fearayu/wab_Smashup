(function (root) {
  'use strict';
  // Deterministic matchmaking scoring shared by the matching pages.
  // This is a rule-based comparison, NOT an AI model and NOT a success guarantee.
  // Weights: skill 70%, free-time closeness 15%, distance 15% (experimental).
  const Levels = root.SmashLevels || null;

  function levelRank(code) {
    if (Levels && Levels.levels && Levels.levels[code]) return Number(Levels.levels[code].value) || 0;
    if (!code) return 0;
    return { N: 1, 'S/BG': 2, 'P-': 3, P: 4, 'P+': 5, C: 6, 'C+': 7, 'B/B+': 8, 'A/Pro': 9 }[code] || 0;
  }

  // Coarse bucket used for the filter dropdown only.
  function bucket(code) {
    const rank = levelRank(code);
    if (rank <= 3) return 'beginner';
    if (rank <= 6) return 'intermediate';
    if (rank >= 7) return 'advanced';
    return '';
  }

  const BUCKET_LABEL = { beginner: 'มือใหม่', intermediate: 'ระดับกลาง', advanced: 'ระดับสูง' };

  // 70% — smaller level gap scores higher (full ladder values 1..9).
  function skillScore(myLevel, otherLevel) {
    const gap = Math.abs(levelRank(myLevel) - levelRank(otherLevel));
    if (gap === 0) return 100;
    if (gap === 1) return 65;
    return 30;
  }

  // 15% — closeness of preferred start times.
  function timeScore(myTime, otherTime) {
    if (!myTime || !otherTime) return 50;
    const a = Number(String(myTime).slice(0, 2));
    const b = Number(String(otherTime).slice(0, 2));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 50;
    if (a === b) return 100;
    return Math.max(40, 100 - Math.abs(a - b) * 15);
  }

  // 15% — travel distance against an optional max distance.
  // Unknown distance is neutral (50), never fabricated.
  function distanceScore(maxKm, distKm) {
    if (maxKm === '' || maxKm == null || distKm === '' || distKm == null || !Number.isFinite(Number(distKm))) return 50;
    const max = Number(maxKm);
    const dist = Number(distKm);
    if (max <= 0) return dist === 0 ? 100 : 0;
    return Math.max(0, Math.round(100 - (dist / max) * 100));
  }

  // Single candidate score. candidate = { level, time, distanceKm }.
  // Returns { total, skill, schedule, travel, gap, reasons[] }.
  function scoreCandidate(myLevel, myTime, maxDistance, candidate) {
    const skill = skillScore(myLevel, candidate.level);
    const schedule = timeScore(myTime, candidate.time);
    const travel = distanceScore(maxDistance, candidate.distanceKm);
    const total = Math.round(skill * 0.7 + schedule * 0.15 + travel * 0.15);
    const gap = Math.abs(levelRank(myLevel) - levelRank(candidate.level));
    const reasons = [];
    reasons.push(gap === 0 ? 'ระดับเดียวกัน' : gap === 1 ? 'ระดับใกล้เคียง (ต่าง 1 ชั้น)' : 'ระดับต่างกันเกิน 1 ชั้น');
    if (candidate.time && myTime) {
      reasons.push(String(candidate.time).slice(0, 2) === String(myTime).slice(0, 2) ? 'เวลาที่สะดวกตรงกัน' : 'เวลาที่สะดวกใกล้กัน');
    } else {
      reasons.push('ยังไม่ระบุเวลาที่สะดวก');
    }
    if (candidate.distanceKm == null || candidate.distanceKm === '') reasons.push('ยังไม่ระบุระยะทาง');
    else reasons.push('ระยะทาง ' + candidate.distanceKm + ' กม.');
    return { total, skill, schedule, travel, gap, reasons };
  }

  // Level source label: organizer-confirmed vs self-assessed vs none.
  function levelSource(profile) {
    if (Levels && Levels.confirmed && Levels.confirmed(profile)) return { source: 'organizer-confirmed', label: 'ผู้จัดยืนยัน' };
    if (Levels && Levels.effective && Levels.effective(profile)) return { source: 'self-assessed', label: 'ประเมินเอง (ยังไม่ยืนยัน)' };
    return { source: 'none', label: 'ยังไม่ระบุระดับ' };
  }

  root.SmashMatch = { levelRank, bucket, BUCKET_LABEL, skillScore, timeScore, distanceScore, scoreCandidate, levelSource };
  if (typeof module !== 'undefined') module.exports = root.SmashMatch;
})(typeof window === 'undefined' ? globalThis : window);