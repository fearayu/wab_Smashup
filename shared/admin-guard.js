(function(){
  const SESSION_KEY='smashup_session_v1';
  try{
    const s=JSON.parse(localStorage.getItem(SESSION_KEY));
    const isAdmin = s && (s.role==='admin' || s.id==='admin' || s.name==='admin');
    if(!isAdmin){
      const next = encodeURIComponent(location.pathname + location.search);
      const isNested = /\/(admin)\//.test(location.pathname);
      const loginUrl = (isNested ? '../' : '') + 'auth/index.html?next=' + next;
      // avoid infinite loop
      if(!location.pathname.includes('auth/index.html')){
        location.replace(loginUrl);
      }
    }
  }catch(e){
    location.replace('../auth/index.html?next='+encodeURIComponent(location.pathname));
  }
})();
