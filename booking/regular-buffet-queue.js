
(function(){
'use strict';
const R=window.SmashRules,group=location.pathname.includes('beginner-')?'beginner':'regular';
const initialSession=(()=>{try{return R.session()}catch{return null}})();
const queueList=document.querySelector('#queueList'),waitingList=document.querySelector('#waitingList'),historyList=document.querySelector('#historyList'),waitingForm=document.querySelector('#waitingForm');
const toolbar=document.createElement('section');toolbar.className='queue-panel';toolbar.style.cssText='margin-bottom:20px;padding:16px';
toolbar.innerHTML='<label>วันที่เล่น <input id="queueDate" type="date"></label> <label>รอบเวลา <select id="queueSession"></select></label><p id="queueNotice" role="status"></p>';
document.querySelector('.queue-layout').before(toolbar);
const date=document.querySelector('#queueDate'),session=document.querySelector('#queueSession'),notice=document.querySelector('#queueNotice');
date.value=R.localDate();session.innerHTML=R.sessions.map(s=>'<option>'+s+'</option>').join('');
const style=document.createElement('style');style.textContent='.queue-player small{display:block;font-size:12px}.queue-row{height:auto;min-height:58px}.waiting-item{flex-wrap:wrap}.queue-panel input,.queue-panel select{font:inherit;max-width:100%;min-height:44px}.queue-row button{min-height:44px}';document.head.append(style);
let state,signature='';
const empty=()=>({slots:Array(30).fill(null),waiting:[],history:[],completed:[]});
const scope=()=>group+'|'+date.value+'|'+session.value;
function store(){const x=R.read(R.keys.queue,{});if(!x||Array.isArray(x)||typeof x!=='object')throw Error('ข้อมูลคิวไม่ถูกต้อง');return x;}
function eligible(){return R.list(R.keys.buffet).filter(r=>r.id&&r.status==='ยืนยันแล้ว'&&r.date===date.value&&r.session===session.value&&(r.group||'regular')===group);}
function hydrate(raw){
 const e=eligible(),valid=new Set(e.map(r=>r.id));let b=raw;
 if(!b){const old=R.read('smashup_buffet_queue_v1',null);b=empty();if(old&&Array.isArray(old.slots)){b.slots=old.slots.map(p=>p&&valid.has(p.registrationId)?p:null);b.waiting=(Array.isArray(old.waiting)?old.waiting:[]).filter(p=>valid.has(p.registrationId));}}
 if(!Array.isArray(b.slots)||b.slots.length!==30||!Array.isArray(b.waiting))throw Error('คิวรอบนี้มีข้อมูลไม่ถูกต้อง');
 const done=Array.isArray(b.completed)?b.completed:[],seen=new Set(done);
 const keep=p=>{if(!p||!p.id&&!p.registrationId)return false;const id=p.registrationId||p.id;if(seen.has(id)||p.registrationId&&!valid.has(p.registrationId))return false;seen.add(id);return true;};
 const slots=b.slots.map(p=>keep(p)?{...p,id:p.id||p.registrationId}:null),waiting=b.waiting.filter(keep).map(p=>({...p,id:p.id||p.registrationId}));
 e.sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))).forEach(r=>{if(!seen.has(r.id)){waiting.push({id:r.id,registrationId:r.id,name:r.name,shuttle:Number(r.shuttle)?1:0,level:r.level,levelSource:r.levelSource});seen.add(r.id)}});
 return {slots,waiting,history:Array.isArray(b.history)?b.history:[],completed:done};
}
function isAdmin(){try{const current=R.session();return current?.role==='admin'&&current?.id===initialSession?.id}catch{return false}}
function levelText(p){return R.escape(p.level||'ยังไม่ทราบระดับ')+' · '+(p.levelSource==='organizer-confirmed'?'ยืนยัน ณ วันลงชื่อ':'ให้ผู้จัดตรวจระดับ');}
function render(){
 const admin=isAdmin();waitingForm.hidden=!admin;
 document.querySelector('#queueCount').textContent=state.slots.filter(Boolean).length+' / 30 คิว';
 document.querySelector('#waitingCount').textContent=state.waiting.length+' คน';
 queueList.innerHTML=state.slots.map((p,i)=>'<div class="queue-row"><span class="queue-number">'+(i+1)+'</span><span class="queue-player">'+(p?R.escape(p.name)+'<small>'+levelText(p)+'</small>':'—')+'</span>'+(p?'<button data-action="shuttle" data-id="'+R.escape(p.id)+'" '+(!admin?'disabled':'')+'>'+Number(p.shuttle||0)+' ลูก</button><button data-action="court" data-id="'+R.escape(p.id)+'" '+(!admin?'disabled':'')+'>'+R.escape(p.court||'—')+'</button>'+(admin?'<button data-action="finish" data-id="'+R.escape(p.id)+'">จบรอบ</button>':''):'<span>—</span><span>—</span>')+'</div>').join('');
 waitingList.innerHTML=state.waiting.map(p=>'<div class="waiting-item"><span>'+R.escape(p.name)+'<small> · '+levelText(p)+'</small></span>'+(admin?'<button data-action="assign" data-id="'+R.escape(p.id)+'">จัดคิว</button>':'<small>รอผู้จัดเรียก</small>')+'</div>').join('')||'<p>ไม่มีผู้เล่นรอในวันและรอบนี้</p>';
 historyList.innerHTML=state.history.slice().reverse().slice(0,30).map((p,i)=>'<tr><td>'+(i+1)+'</td><td>'+R.escape(p.queue)+'</td><td>'+R.escape(p.name)+'</td><td>'+Number(p.shuttle||0)+'</td><td>'+R.escape(p.court||'—')+'</td><td>'+R.escape(p.action)+' · '+R.escape(p.time)+'</td></tr>').join('')||'<tr><td colspan="6">ยังไม่มีประวัติรอบนี้</td></tr>';
}
function refresh(){try{const data=store();signature=JSON.stringify(data[scope()]||null);state=hydrate(data[scope()]);render();notice.textContent=(isAdmin()?'เฉพาะผู้จัดจัดคิวได้ · ':'ดูคิวได้ ส่วนการจัดคิวเป็นหน้าที่ผู้จัด · ')+'แสดงเฉพาะรายการยืนยันของวันและรอบที่เลือก';}catch(e){notice.textContent=e.message;waitingForm.hidden=true;queueList.innerHTML='';waitingList.innerHTML='';}}
async function change(fn){try{await R.locked(R.keys.queue,()=>{R.actor(initialSession,true);const data=store();if(signature!==JSON.stringify(data[scope()]||null))throw Error('คิวถูกปรับจากอีกหน้าต่าง กรุณารีเฟรชก่อน');const next=hydrate(data[scope()]);fn(next);data[scope()]=next;R.write(R.keys.queue,data)});refresh();}catch(e){notice.textContent=e.message;}}
async function action(e){const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id,action=b.dataset.action;await change(next=>{
 if(action==='assign'){const i=next.waiting.findIndex(p=>p.id===id),slot=next.slots.indexOf(null);if(i<0)throw Error('รายชื่อนี้ถูกยกเลิกหรือเปลี่ยนสถานะแล้ว กรุณารีเฟรช');if(slot<0)throw Error('ครบ 30 คิวแล้ว');const p=next.waiting.splice(i,1)[0];next.slots[slot]={...p,court:'—'};next.history.push({...p,queue:slot+1,action:'เข้าคิว',time:new Date().toLocaleTimeString('th-TH'),actor:initialSession.id});return;}
 const slot=next.slots.findIndex(p=>p?.id===id);if(slot<0)throw Error('คิวนี้เปลี่ยนแล้ว กรุณารีเฟรช');const p=next.slots[slot];
 if(action==='shuttle')p.shuttle=(Number(p.shuttle||0)+1)%4;
 if(action==='court')p.court=R.courts[(R.courts.indexOf(p.court)+1)%R.courts.length];
 if(action==='finish'){next.history.push({...p,queue:slot+1,action:'จบรอบ',time:new Date().toLocaleTimeString('th-TH'),actor:initialSession.id});next.completed.push(id);next.slots[slot]=null;}
});}
waitingList.addEventListener('click',action);queueList.addEventListener('click',action);
waitingForm.addEventListener('submit',async e=>{e.preventDefault();const name=document.querySelector('#playerName').value.trim();if(!name)return;await change(next=>{if(next.waiting.length+next.slots.filter(Boolean).length>=30)throw Error('รอบนี้ครบ 30 คนแล้ว');next.waiting.push({id:crypto.randomUUID(),name,shuttle:Number(document.querySelector('#shuttleCount').value),levelSource:'pending'})});});
date.addEventListener('change',refresh);session.addEventListener('change',refresh);document.querySelector('#refreshQueue').addEventListener('click',refresh);window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);refresh();
})();
