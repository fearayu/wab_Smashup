(function (root) {
  'use strict';
  const KEY = 'smashup_appointments_v1';
  const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days auto-cancel

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  function session() { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } }
  function escape(v) { const fn = (root.SmashUtils && root.SmashUtils.escapeHtml) || ((x) => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))); return fn(v); }

  function normalize(r) {
    if (r.status !== 'pending') return r;
    if (r.expiresAt && new Date(r.expiresAt).getTime() <= Date.now()) {
      return { ...r, status: 'auto-cancelled', cancelledAt: new Date().toISOString(), cancelReason: 'หมดเวลารอการตอบรับ (7 วัน)' };
    }
    return r;
  }

  function users() { try { return JSON.parse(localStorage.getItem('smashup_users_v1')) || []; } catch { return []; } }

  function resolveReceiver(name) {
    const wanted = String(name || '').trim().toLowerCase();
    if (!wanted) return null;
    return users().find(u =>
      (!u.deleted && u.is_active !== false) &&
      (String(u.username || '').toLowerCase() === wanted || String(u.name || '').toLowerCase() === wanted || String(u.email || '').toLowerCase() === wanted)
    ) || null;
  }

  function resolveReceiverById(id) {
    if (!id) return null;
    return users().find(u => u.id === id && !u.deleted && u.is_active !== false) || null;
  }

  function listAll() { return read().map(normalize).filter(a => a.status !== 'deleted'); }
  function myReceived() {
    const s = session(); if (!s?.id) return [];
    return listAll().filter(a => a.receiverId === s.id && a.status === 'pending');
  }
  function mySent() {
    const s = session(); if (!s?.id) return [];
    return listAll().filter(a => a.senderId === s.id && a.status === 'pending');
  }
  function mySchedule() {
    const s = session(); if (!s?.id) return [];
    return listAll().filter(a =>
      (a.senderId === s.id || a.receiverId === s.id) && (a.status === 'accepted' || a.status === 'pending')
    ).sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  function send(input, expected) {
    if (!expected || !expected.id) throw Error('กรุณาเข้าสู่ระบบก่อนส่งคำเชิญ');
    const s = session();
    if (!s || s.id !== expected.id) throw Error('บัญชีเปลี่ยนไปหรือออกจากระบบแล้ว');

    const receiverName = String(input.receiverName || '').trim();
    const date = String(input.date || '').trim();
    const time = String(input.time || '').trim();
    const court = String(input.court || '').trim();
    const note = String(input.note || '').trim();

    if (!receiverName) throw Error('กรุณาระบุชื่อผู้รับคำเชิญ');
    if (!date) throw Error('กรุณาระบุวันที่นัดหมาย');
    if (!time) throw Error('กรุณาระบุเวลา');
    if (!court) throw Error('กรุณาระบุสนาม');

    // Bind the invite to an exact registered user id — never just a display name.
    const receiver = resolveReceiverById(input.receiverId) || resolveReceiver(receiverName);
    if (!receiver) throw Error('ไม่พบบัญชีผู้รับในระบบ (ต้องเป็น username หรือชื่อที่ใช้สมัครสมาชิก) — ไม่พึ่งชื่อแสดงผลเพียงอย่างเดียว');

    // Validate date is within future window
    const today = new Date().toISOString().split('T')[0];
    if (date < today) throw Error('วันที่นัดหมายต้องไม่ย้อนหลัง');

    const records = read();
    // Check duplicate: same sender→receiver on same date
    const dup = records.some(a =>
      a.status !== 'deleted' && a.senderId === s.id && a.receiverId === receiver.id && a.date === date
    );
    if (dup) throw Error('คุณส่งคำเชิญให้คนนี้ในวันเดียวกันแล้ว');

    const appointment = {
      id: 'AP' + Date.now().toString(36).toUpperCase(),
      senderId: s.id,
      senderName: s.name || s.id,
      receiverId: receiver.id,
      receiverName: receiver.username || receiver.name || receiver.id,
      date,
      time,
      court,
      note,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
    };
    records.push(appointment);
    write(records);
    return appointment;
  }

  function respond(id, action, expected) {
    if (!expected || !expected.id) throw Error('กรุณาเข้าสู่ระบบ');
    const s = session();
    if (!s || s.id !== expected.id) throw Error('บัญชีเปลี่ยนไปหรือออกจากระบบแล้ว');

    const records = read();
    const idx = records.findIndex(a => a.id === id);
    if (idx === -1) throw Error('ไม่พบคำเชิญนี้');
    const a = records[idx];
    if (a.status !== 'pending') throw Error('คำเชิญนี้ดำเนินการแล้ว');
    if (a.receiverId !== s.id && a.receiverName !== (s.name || s.id)) {
      throw Error('คำเชิญนี้ไม่ได้ส่งถึงคุณ');
    }

    if (action === 'accept') {
      records[idx] = { ...a, status: 'accepted', receiverId: s.id, acceptedAt: new Date().toISOString() };
    } else if (action === 'decline') {
      records[idx] = { ...a, status: 'declined', receiverId: s.id, declinedAt: new Date().toISOString() };
    } else {
      throw Error('การกระทำไม่ถูกต้อง');
    }
    write(records);
    return records[idx];
  }

  function cancel(id, expected) {
    if (!expected || !expected.id) throw Error('กรุณาเข้าสู่ระบบ');
    const s = session();
    if (!s || s.id !== expected.id) throw Error('บัญชีเปลี่ยนไปหรือออกจากระบบแล้ว');

    const records = read();
    const idx = records.findIndex(a => a.id === id);
    if (idx === -1) throw Error('ไม่พบคำเชิญนี้');
    const a = records[idx];
    if (a.senderId !== s.id) throw Error('ยกเลิกได้เฉพาะคำเชิญที่คุณเป็นคนส่ง');
    if (a.status !== 'pending') throw Error('คำเชิญนี้ดำเนินการแล้ว');

    records[idx] = { ...a, status: 'cancelled', cancelledAt: new Date().toISOString() };
    write(records);
    return records[idx];
  }

  function stats() {
    const all = listAll();
    const s = session();
    const myId = s?.id;
    return {
      pending: all.filter(a => a.status === 'pending' && a.receiverId === myId).length,
      accepted: all.filter(a => a.status === 'accepted' && (a.senderId === myId || a.receiverId === myId)).length,
      total: all.filter(a => (a.senderId === myId || a.receiverId === myId)).length,
    };
  }

  // migrate legacy records that only stored a receiver name
  function resolveIds() {
    const records = read();
    let changed = false;
    for (const a of records) {
      if (!a.receiverId && a.receiverName) {
        const found = resolveReceiver(a.receiverName);
        if (found) { a.receiverId = found.id; changed = true; }
      }
    }
    if (changed) write(records);
  }

  root.SmashAppointments = { listAll, myReceived, mySent, mySchedule, send, respond, cancel, stats, resolveIds, resolveReceiver, normalize, escape };
  if (typeof module !== 'undefined') module.exports = root.SmashAppointments;
})(typeof window === 'undefined' ? globalThis : window);
