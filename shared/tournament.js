(function (root) {
  'use strict';
  const KEY = 'smashup_tournaments_v1';
  const TYPES = ['ชายเดี่ยว', 'หญิงเดี่ยว', 'คู่ผสม'];
  const EVENTS = ['SMASHUP CHAMPIONSHIP #1', 'OPEN DOUBLES DAY'];

  function read() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
  function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { throw Error('บันทึกข้อมูลการแข่งขันไม่สำเร็จ'); } }
  function freshId() { return 'TN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5); }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function mutate(id, fn) {
    const list = read();
    const t = list.find(x => x.id === id);
    if (!t) throw Error('ไม่พบการแข่งขัน');
    fn(t);
    write(list);
    return t;
  }

  function listAll() { return read(); }
  function getById(id) { return read().find(t => t.id === id) || null; }
  function active() { return read().filter(t => t.status !== 'deleted'); }
  function byEvent(eventName) { return read().filter(t => t.event === eventName && t.status !== 'deleted'); }

  function create(input) {
    const name = String(input.name || '').trim();
    const event = String(input.event || '').trim();
    if (!name) throw Error('กรุณาระบุชื่อการแข่งขัน');
    if (!EVENTS.includes(event)) throw Error('เลือกรายการแข่งขัน');
    const list = read();
    if (list.some(t => t.event === event && t.status !== 'deleted' && t.status !== 'completed'))
      throw Error('มีการแข่งขันรายการนี้กำลังเปิดรับสมัครหรือแข่งอยู่แล้ว');
    const tournament = {
      id: freshId(), name, event, status: 'registration',
      categories: input.categories || TYPES.slice(),
      registrations: [], brackets: {}, startedAt: null, createdAt: new Date().toISOString(),
    };
    list.push(tournament);
    write(list);
    return tournament;
  }

  function register(tournamentId, input, expected) {
    if (!expected || !expected.id) throw Error('กรุณาเข้าสู่ระบบก่อนสมัคร');
    const category = String(input.category || '').trim();
    if (!TYPES.includes(category)) throw Error('เลือกประเภทแข่งขัน');
    let reg;
    mutate(tournamentId, (t) => {
      if (t.status !== 'registration') throw Error('ปิดรับสมัครแล้ว');
      const event = t.event;
      if (!event || !EVENTS.includes(event)) throw Error('รายการแข่งขันไม่ถูกต้อง');
      const same = t.registrations.filter(r => r.category === category && r.event === event && r.status !== 'cancelled');
      if (same.some(r => r.userId === expected.id)) throw Error('คุณลงชื่อประเภทนี้ไว้แล้ว');
      if (same.length >= 64) throw Error('ประเภทนี้เต็มแล้ว');
      const level = input.level || '';
      reg = {
        id: freshId(), userId: expected.id, name: expected.name || expected.id,
        category, event, level,
        partner: category === 'คู่ผสม' ? String(input.partner || '').trim() : undefined,
        status: 'registered', createdAt: new Date().toISOString(),
      };
      t.registrations.push(reg);
    });
    return reg;
  }

  function cancelRegistration(tournamentId, regId, expected) {
    let cancelled;
    mutate(tournamentId, (t) => {
      const reg = t.registrations.find(r => r.id === regId);
      if (!reg) throw Error('ไม่พบรายการสมัคร');
      if (!expected || reg.userId !== expected.id) throw Error('ยกเลิกได้เฉพาะรายการของตัวเอง');
      if (reg.status === 'cancelled') throw Error('ยกเลิกไปแล้ว');
      if (t.status !== 'registration') throw Error('ไม่สามารถยกเลิกได้หลังจากจัดสายการแข่งขันแล้ว');
      reg.status = 'cancelled';
      cancelled = reg;
    });
    return cancelled;
  }

  function rankOf(level) {
    const R = root.SmashLevels && root.SmashLevels.levels && root.SmashLevels.levels[level];
    if (R && R.value != null) return Number(R.value) || 0;
    if (!level) return 0;
    const LADDER = { N: 1, D: 2, 'S/BG': 2, 'P-': 3, P: 4, 'P+': 5, C: 6, 'C+': 7, B: 8, 'B+': 8, 'B/B+': 8, A: 9, 'A+': 9, 'A/Pro': 9 };
    return LADDER[level] || 0;
  }

  // Sort by level (strongest first); players of the same level are shuffled.
  function seedByLevel(regs) {
    const groups = new Map();
    regs.forEach(p => {
      const r = rankOf(p.level);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(p);
    });
    const out = [];
    [...groups.keys()].sort((a, b) => b - a).forEach(r => out.push(...shuffle(groups.get(r))));
    return out;
  }

  // Standard bracket slots so top seeds never meet early:
  // seed 1 at slot 0, seed 2 at slot n-1, seed 3 middle-top, seed 4 middle-bottom, ...
  function seedOrder(n) {
    let order = [0, 1];
    let size = 2;
    while (size < n) {
      const next = [];
      for (let i = 0; i < order.length; i += 2) {
        const a = order[i];
        next.push(a, 2 * size - 1 - a, size + a, 2 * size - 1 - (size + a));
      }
      order = next;
      size *= 2;
    }
    return order;
  }

  function bracketKey(category, skillLevel) {
    return skillLevel ? category + '::' + skillLevel : category;
  }

  function buildBracket(tournamentId, category, skillLevel) {
    let rounds;
    mutate(tournamentId, (t) => {
      if (t.status === 'completed' || t.status === 'deleted') throw Error('การแข่งขันนี้เสร็จสิ้นแล้ว');
      const regs = t.registrations.filter(r =>
        r.category === category && r.status !== 'cancelled' && (!skillLevel || r.level === skillLevel)
      );
      if (regs.length < 2) throw Error('ผู้สมัครไม่พอจัดสาย (ต้องมีอย่างน้อย 2 คน)');
      const seeded = seedByLevel(regs.map(r => ({ id: r.userId, name: r.name, level: r.level })));
      const size = 1 << Math.ceil(Math.log2(seeded.length));
      const arranged = new Array(size).fill(null);
      seedOrder(size).forEach((slot, idx) => { if (idx < seeded.length) arranged[slot] = seeded[idx]; });
      rounds = [];
      const totalRounds = Math.log2(size);
      for (let r = 0; r < totalRounds; r++) {
        const count = size >> (r + 1);
        const matches = [];
        for (let m = 0; m < count; m++) {
          const match = { id: freshId(), category, round: r, position: m, player1: null, player2: null, winnerSlot: null, score: null };
          if (r === 0) {
            match.player1 = arranged[m * 2] || null;
            match.player2 = arranged[m * 2 + 1] || null;
            if (!match.player1 && match.player2) { match.winnerSlot = 2; match.score = 'BYE'; }
            else if (match.player1 && !match.player2) { match.winnerSlot = 1; match.score = 'BYE'; }
          }
          matches.push(match);
        }
        const roundNames = { 0: null, 1: null, 2: 'รอบ 16', 3: 'รอบก่อนรองชนะเลิศ', 4: 'รอบรองชนะเลิศ', 5: 'รอบชิงชนะเลิศ' };
        rounds.push({ round: r, name: roundNames[r] || ('รอบ ' + (r + 1)), matches });
      }
      for (let r = 0; r < totalRounds - 1; r++) {
        rounds[r].matches.forEach((m, i) => {
          if (m.winnerSlot) {
            const winner = m.winnerSlot === 1 ? m.player1 : m.player2;
            const nextM = rounds[r + 1].matches[Math.floor(i / 2)];
            if (i % 2 === 0) nextM.player1 = winner; else nextM.player2 = winner;
          }
        });
      }
      t.brackets[bracketKey(category, skillLevel)] = rounds;
      t.status = 'in-progress';
      t.startedAt = new Date().toISOString();
    });
    return rounds;
  }

  function setWinner(tournamentId, category, round, position, winnerSlot, score) {
    let match;
    mutate(tournamentId, (t) => {
      if (!t.brackets || !t.brackets[category]) throw Error('ไม่พบข้อมูลสายการแข่ง');
      const rounds = t.brackets[category];
      if (round < 0 || round >= rounds.length) throw Error('รอบไม่ถูกต้อง');
      const m = rounds[round].matches[position];
      if (!m) throw Error('ไม่พบคู่แข่ง');
      if (!m.player1 || !m.player2) throw Error('คู่นี้ยังไม่มีผู้เล่นครบทั้งสองฝั่ง');
      if (winnerSlot !== 1 && winnerSlot !== 2) throw Error('เลือกฝั่งผู้ชนะ');
      m.winnerSlot = winnerSlot;
      m.score = String(score || '');
      if (round + 1 < rounds.length) {
        const winner = winnerSlot === 1 ? m.player1 : m.player2;
        const nextM = rounds[round + 1].matches[Math.floor(position / 2)];
        if (position % 2 === 0) nextM.player1 = winner; else nextM.player2 = winner;
      }
      const finalRound = rounds[rounds.length - 1];
      if (finalRound.matches[0] && finalRound.matches[0].winnerSlot) t.status = 'completed';
      match = m;
    });
    return match;
  }

  function rankings(tournamentId, category) {
    const t = getById(tournamentId);
    if (!t || !t.brackets || !t.brackets[category]) return [];
    const rounds = t.brackets[category];
    const results = [];
    const final = rounds[rounds.length - 1].matches[0];
    if (final && final.winnerSlot) {
      const winner = final.winnerSlot === 1 ? final.player1 : final.player2;
      const loser = final.winnerSlot === 1 ? final.player2 : final.player1;
      if (winner) results.push({ rank: 1, ...winner });
      if (loser) results.push({ rank: 2, ...loser });
    }
    if (rounds.length >= 2) {
      rounds[rounds.length - 2].matches.forEach(m => {
        if (m.winnerSlot && m.player1 && m.player2) {
          const loser = m.winnerSlot === 1 ? m.player2 : m.player1;
          if (loser) results.push({ rank: 3, ...loser });
        }
      });
    }
    return results;
  }

  root.SmashTournament = {
    TYPES, EVENTS, listAll, getById, active, byEvent, bracketKey,
    create, register, cancelRegistration,
    buildBracket, setWinner, rankings, shuffle,
    rankOf, seedOrder,
  };
  if (typeof module !== 'undefined') module.exports = root.SmashTournament;
})(typeof window === 'undefined' ? globalThis : window);