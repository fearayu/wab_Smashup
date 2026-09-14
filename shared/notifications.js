(function (root) {
  'use strict';
  const KEY = 'smashup_notifications_v1';

  const TYPES = ['booking', 'invite', 'tournament', 'system'];

  function read() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { throw Error('บันทึกการแจ้งเตือนไม่สำเร็จ'); }
    try { root.dispatchEvent && root.dispatchEvent(new Event('smashup-notify')); } catch {}
  }
  function session() { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } }

  function create(input) {
    const userId = input.userId;
    if (!userId) throw Error('กรุณาระบุผู้รับการแจ้งเตือน');
    if (!String(input.title || '').trim()) throw Error('การแจ้งเตือนต้องมีหัวข้อ');
    if (input.type && !TYPES.includes(input.type)) throw Error('ประเภทการแจ้งเตือนไม่ถูกต้อง');
    const list = read();
    const n = {
      id: 'NT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6),
      userId,
      title: String(input.title),
      body: String(input.body || ''),
      type: input.type || 'system',
      link: input.link || '',
      read: false,
      createdAt: input.createdAt || new Date().toISOString(),
    };
    list.unshift(n);
    write(list);
    return n;
  }

  function forUser(userId) {
    if (!userId) return [];
    return read().filter(n => n.userId === userId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  function unreadCount(userId) {
    if (!userId) return 0;
    return read().filter(n => n.userId === userId && !n.read).length;
  }
  function markRead(id, userId) {
    const list = read();
    const idx = list.findIndex(n => n.id === id && n.userId === userId);
    if (idx === -1) throw Error('ไม่พบการแจ้งเตือนนี้');
    if (list[idx].read) return list[idx];
    list[idx] = { ...list[idx], read: true, readAt: new Date().toISOString() };
    write(list);
    return list[idx];
  }
  function markAllRead(userId) {
    const list = read();
    let changed = false;
    const next = list.map(n => {
      if (n.userId === userId && !n.read) { changed = true; return { ...n, read: true, readAt: new Date().toISOString() }; }
      return n;
    });
    if (changed) write(next);
    return changed;
  }
  function clear(userId) {
    if (!userId) return 0;
    const list = read();
    const before = list.filter(n => n.userId === userId).length;
    if (!before) return 0;
    write(list.filter(n => n.userId !== userId));
    return before;
  }

  root.SmashNotify = { create, forUser, unreadCount, markRead, markAllRead, clear };
  if (typeof module !== 'undefined') module.exports = root.SmashNotify;
})(typeof window === 'undefined' ? globalThis : window);