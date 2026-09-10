(function(){
  const SESSION_KEY='smashup_session_v1';
  try{
    const s=JSON.parse(localStorage.getItem(SESSION_KEY));
    const isAdmin = s && (s.role==='admin' || s.id==='admin' || s.name==='admin');
    if(!isAdmin){
      const next = encodeURIComponent(location.pathname + location.search);
      const depth = (location.pathname.match(/\//g) || []).length - 1;
      const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
      const loginUrl = prefix + 'auth/index.html?next=' + next;
      if(!location.pathname.includes('auth/index.html')){
        location.replace(loginUrl);
      }
    }
  }catch(e){
    const depth = (location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
    location.replace(prefix + 'auth/index.html?next='+encodeURIComponent(location.pathname));
  }
})();
