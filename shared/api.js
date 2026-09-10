(function (root) {
  'use strict';
  // API seam — separates "demo mode" (localStorage) from "API mode" (real HTTP backend).
  // Default: demo mode. In API mode this module talks to a backend and NEVER writes
  // to localStorage, so a failed request surfaces as an error instead of a fake success.
  const MODE_KEY = 'smashup_api_mode';
  const URL_KEY = 'smashup_api_base_url';

  function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }

  function mode() {
    const configured = root.SMASHUP_API_CONFIG && root.SMASHUP_API_CONFIG.mode;
    const value = configured || stored(MODE_KEY) || 'demo';
    return value === 'api' ? 'api' : 'demo';
  }

  function baseUrl() {
    const configured = root.SMASHUP_API_CONFIG && root.SMASHUP_API_CONFIG.baseUrl;
    const url = configured || stored(URL_KEY) || '';
    return url.replace(/\/+$/, '');
  }

  function isApi() { return mode() === 'api'; }

  function authHeaders() {
    try {
      const s = JSON.parse(localStorage.getItem('smashup_session_v1'));
      if (s && s.token) return { Authorization: 'Bearer ' + s.token };
    } catch { /* ignore */ }
    return {};
  }

  async function request(path, options = {}) {
    if (!isApi()) throw Error('ระบบอยู่ในโหมดเดโม (localStorage) ไม่มีการเรียก API — ตั้งค่า smashup_api_mode = api ก่อน');
    const url = baseUrl() + path;
    if (!baseUrl()) throw Error('ยังไม่ได้กำหนดที่อยู่ API (smashup_api_base_url) — ไม่ได้บันทึกข้อมูลในเครื่อง');

    let res;
    try {
      res = await root.fetch(url, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (e) {
      const detail = e && e.message ? e.message : 'network error';
      throw Error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ (' + detail + ') — ไม่ได้บันทึกข้อมูลในเครื่อง');
    }

    if (!res.ok) {
      let message = 'เซิร์ฟเวอร์ตอบกลับ HTTP ' + res.status;
      try {
        const data = await res.json();
        if (data && data.error && data.error.message) message = data.error.message;
      } catch { /* no json body */ }
      throw Error(message + ' — ไม่ได้บันทึกข้อมูลในเครื่อง');
    }

    return res.json();
  }

  root.SmashApi = { mode, baseUrl, isApi, request };
  if (typeof module !== 'undefined') module.exports = root.SmashApi;
})(typeof window === 'undefined' ? globalThis : window);