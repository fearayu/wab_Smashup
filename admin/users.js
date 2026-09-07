const $=(s,r=document)=>r.querySelector(s);
$('#menuToggle')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',e=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

let users=[
  {name:'คุณบีม',email:'beam@example.com',date:'01 ก.ย. 2026',status:'active'},
  {name:'คุณต้น',email:'ton@example.com',date:'02 ก.ย. 2026',status:'active'},
  {name:'คุณมายด์',email:'mind@example.com',date:'03 ก.ย. 2026',status:'suspended'},
  {name:'คุณฟ้า',email:'fah@example.com',date:'04 ก.ย. 2026',status:'active'},
  {name:'คุณโอ๊ต',email:'oat@example.com',date:'05 ก.ย. 2026',status:'active'},
  {name:'user_spam',email:'spam@test.com',date:'06 ก.ย. 2026',status:'banned'},
];
const STORAGE='smashup_admin_users_v1';
try{ const saved=JSON.parse(localStorage.getItem(STORAGE)); if(saved) users=saved; }catch{}
function save(){ localStorage.setItem(STORAGE,JSON.stringify(users)); }
function statusBadge(s){
  if(s==='active') return '<span class="user-status active">ใช้งานได้</span>';
  if(s==='suspended') return '<span class="user-status suspended">ระงับสิทธิ์</span>';
  return '<span class="user-status banned">ลบ/แบน</span>';
}
function render(){
  const q=($('#searchUser').value||'').toLowerCase();
  const f=$('#filterUserStatus').value;
  let list=users.filter(u=> (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (!f || u.status===f));
  $('#userCount').textContent=list.length+' บัญชี';
  $('#userBody').innerHTML=list.map(u=>{
    const idx=users.indexOf(u);
    let actions='';
    if(u.status==='active') actions=`<div class="actions"><button class="btn-cancel btn-suspend" data-suspend="${idx}">ระงับสิทธิ์</button><button class="btn-cancel btn-ban" data-ban="${idx}">ลบ</button></div>`;
    else if(u.status==='suspended') actions=`<div class="actions"><button class="btn-approve btn-restore" data-restore="${idx}">คืนสิทธิ์</button><button class="btn-cancel btn-ban" data-ban="${idx}">ลบ</button></div>`;
    else actions=`<div class="actions"><button class="btn-approve btn-restore" data-restore="${idx}">กู้คืน</button></div>`;
    return `<tr><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${u.date}</td><td>${statusBadge(u.status)}</td><td>${actions}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px">ไม่พบบัญชี</td></tr>`;
  document.querySelectorAll('[data-suspend]').forEach(b=>b.addEventListener('click',()=>{ users[Number(b.dataset.suspend)].status='suspended'; save(); render(); }));
  document.querySelectorAll('[data-ban]').forEach(b=>b.addEventListener('click',()=>{ if(confirm('ยืนยันลบบัญชีนี้?')){ users[Number(b.dataset.ban)].status='banned'; save(); render(); } }));
  document.querySelectorAll('[data-restore]').forEach(b=>b.addEventListener('click',()=>{ users[Number(b.dataset.restore)].status='active'; save(); render(); }));
}
$('#searchUser').addEventListener('input',render);
$('#filterUserStatus').addEventListener('change',render);
render();
