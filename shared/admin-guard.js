(function () {
  const SESSION_KEY = 'smashup_session_v1';

  // Robust under both http(s) and file:// (pathname includes the drive on Windows).
  function nested() {
    return /\/(booking|matching|appointments|admin)\//.test(location.pathname.replace(/\\/g, '/'));
  }

  // Relative "go back" path measured from auth/ so nextPage() honors it (starts with '../').
  function backTo() {
    const path = location.pathname.replace(/\\/g, '/');
    const file = path.split('/').filter(Boolean).pop();
    if (!nested()) return file + location.search;
    const dir = path.split('/').filter(Boolean).slice(-2, -1)[0];
    return '../' + dir + '/' + file + location.search;
  }

  function loginUrl() {
    const base = (nested() ? '../' : '') + 'auth/index.html';
    return base + '?next=' + encodeURIComponent(backTo());
  }

  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    const isAdmin = s && (s.role === 'admin' || s.id === 'admin' || s.name === 'admin');
    if (!isAdmin) location.replace(loginUrl());
  } catch (e) {
    location.replace(loginUrl());
  }
})();