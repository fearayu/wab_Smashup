const $=(s,r=document)=>r.querySelector(s);
$('#menuToggle')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',e=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

const USERS_KEY='smashup_users_v1';
function getUsers(){try{const list=JSON.parse(localStorage.getItem(USERS_KEY));return Array.isArray(list)?list:[]}catch{return[]}}
function saveUsers(list){localStorage.setItem(USERS_KEY,JSON.stringify(list))}
function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function statusBadge(s){
  if(!s||s==='active') return '<span class="user-status active">ใช้งานได้</span>';
  if(s==='suspended') return '<span class="user-status suspended">ระงับสิทธิ์</span>';
  return '<span class="user-status banned">ยกเลิกบัญชี</span>';
}
function fmtDate(iso){
  try{const d=new Date(iso);const months=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()+543}`}catch{return iso||'—'}
}
function render(){
  const users=getUsers();
  const q=($('#searchUser').value||'').toLowerCase();
  const f=$('#filterUserStatus').value;
  let list=users.filter(u=>{
    const name=(u.username||u.name||'');
    const email=(u.email||'');
    const matchQ=!q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || (u.username||'').toLowerCase().includes(q);
    const status=u.is_active===false?'suspended':(u.deleted?'banned':'active');
    const matchF=!f || status===f;
    return matchQ&&matchF;
  });
  const total=users.length;
  $('#userCount').textContent=list.length+' / '+total+' บัญชี';
  $('#userBody').innerHTML=list.map(u=>{
    const status=(u.is_active===false?'suspended':(u.deleted?'banned':'active'));
    const level=u.profile&&u.profile.assessment&&u.profile.assessment.confirmedLevel?u.profile.assessment.confirmedLevel:(u.profile&&u.profile.assessment&&u.profile.assessment.selfLevel?u.profile.assessment.selfLevel:'');
    let actions='';
    if(status==='active') actions=`<div class="actions"><button class="btn-cancel btn-suspend" data-id="${u.id||u.username}" data-act="suspend">ระงับสิทธิ์</button><button class="btn-cancel btn-ban" data-id="${u.id||u.username}" data-act="ban">ปิดบัญชี</button></div>`;
    else if(status==='suspended') actions=`<div class="actions"><button class="btn-approve btn-restore" data-id="${u.id||u.username}" data-act="restore">คืนสิทธิ์</button><button class="btn-cancel btn-ban" data-id="${u.id||u.username}" data-act="ban">ปิดบัญชี</button></div>`;
    else actions=`<div class="actions"><button class="btn-approve btn-restore" data-id="${u.id||u.username}" data-act="restore">กู้คืน</button></div>`;
    return `<tr><td><strong>${escapeHtml(u.username||u.name||'—')}</strong>${u.role==='admin'?'<span style="margin-left:6px;padding:2px 8px;border-radius:999px;font:600 11px Kanit;background:#eef2ff;color:#4f46e5;border:1px solid #e0e7ff">admin</span>':''}${level?`<small style="display:block;color:var(--muted);font-size:11px">ระดับ ${escapeHtml(level)}</small>`:''}</td><td>${escapeHtml(u.email||'—')}</td><td>${fmtDate(u.createdAt)}</td><td>${statusBadge(status)}</td><td>${actions}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ไม่พบบัญชี</td></tr>`;
  document.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.id; const act=b.dataset.act;
    const users=getUsers(); const u=users.find(x=>(x.id||x.username)===id);
    if(!u){alert('ไม่พบบัญชี');return;}
    if(act==='suspend'){ if(!confirm('ระงับสิทธิ์บัญชีนี้?'))return; u.is_active=false; delete u.deleted; }
    if(act==='ban'){ if(!confirm('ปิดบัญชีนี้? ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้ — ยังเก็บข้อมูลไว้'))return; u.deleted=true; u.is_active=false; }
    if(act==='restore'){ u.is_active=true; delete u.deleted; }
    saveUsers(users);
    // force logout if it's the currently-active session
    const s=JSON.parse(localStorage.getItem('smashup_session_v1')||'null');
    if(s && (s.id===u.id||s.id===u.username) && (act==='suspend'||act==='ban')){ localStorage.removeItem('smashup_session_v1'); }
    render();
  }));
}
$('#searchUser').addEventListener('input',render);
$('#filterUserStatus').addEventListener('change',render);
window.addEventListener('storage',e=>{ if(e.key===USERS_KEY) render(); });
setInterval(()=>{ const n=getUsers().length; if(n!==lastCount){lastCount=n;render()} },1500);
let lastCount=-1;
render();