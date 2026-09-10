(function(root){
 'use strict';
 const keys={court:'smashup_bookings_v1',buffet:'smashup_buffet_bookings_v1',service:'smashup_service_requests_v1',queue:'smashup_buffet_queue_v2'};
 const courts=['1','2','3','4','5','6','7','8','9','10','11','A','B'];
 const sessions=['11:00–14:00','17:00–20:00','19:00–22:00'];
 const pending=s=>['รอยืนยัน','รอตรวจสอบ','รอตรวจสอบการชำระเงิน','รอชำระเงิน'].includes(s);
 const escape=(root.SmashUtils&&root.SmashUtils.escapeHtml)||((value)=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
 function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
 function lastDate(){const d=new Date();d.setDate(d.getDate()+7);return localDate(d);}
 function read(key,fallback){const raw=localStorage.getItem(key);if(raw===null)return fallback;try{return JSON.parse(raw)}catch{throw Error('ข้อมูลที่บันทึกไว้เสียรูปแบบ กรุณาติดต่อผู้ดูแล ไม่ได้ล้างข้อมูลเดิม');}}
 function session(){return read('smashup_session_v1',null);}
 function actor(expected,admin=false){const s=session();if(!s?.id||!expected?.id||s.id!==expected.id||s.role!==expected.role)throw Error('บัญชีเปลี่ยนไปหรือออกจากระบบแล้ว กรุณาโหลดหน้าใหม่');if(admin&&s.role!=='admin')throw Error('เฉพาะผู้ดูแลเท่านั้นที่จัดการรายการได้');return s;}
 function expired(r,now=Date.now()){return pending(r.status)&&r.paymentStatus!=='ชำระเงินยืนยันแล้ว'&&r.paymentDueAt&&new Date(r.paymentDueAt).getTime()<=now;}
 function normalize(r){return expired(r)?{...r,status:'ยกเลิกแล้ว',cancelReason:'หมดเวลายืนยันรายการจำลอง'}:r;}
 function list(key){const a=read(key,[]);if(!Array.isArray(a))throw Error('ข้อมูลรายการไม่ถูกต้อง กรุณาติดต่อผู้ดูแล');return a.map(normalize);}
 function active(r){return normalize(r).status!=='ยกเลิกแล้ว';}
 function start(r){return new Date(`${r.date}T${String(r.time||r.session||'').slice(0,5)}:00`).getTime();}
 function dateTime(date,time){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||date<localDate()||date>lastDate())throw Error('เลือกวันตั้งแต่วันนี้ถึง 7 วันล่วงหน้า');const value=start({date,time});if(!Number.isFinite(value)||localDate(new Date(value))!==date||value<=Date.now())throw Error('รอบเวลานี้ผ่านไปแล้ว กรุณาเลือกรอบในอนาคต');}
 function contact(input){if(!String(input.name||'').trim())throw Error('กรุณาระบุชื่อ');const phone=String(input.phone||'').replace(/[\s-]/g,'');if(!/^0\d{8,9}$/.test(phone))throw Error('กรุณาระบุเบอร์โทรศัพท์ 9–10 หลัก เริ่มด้วย 0');return {name:input.name.trim(),phone};}
 function overlaps(a,b){const aa=String(a).slice(0,5),bb=String(b).slice(0,5);return aa===bb;}
 function courtConflict(records,r){return records.some(x=>x.id!==r.id&&active(x)&&x.date===r.date&&String(x.court)===String(r.court)&&overlaps(x.time,r.time));}
 async function locked(key,fn){if(root.navigator?.locks)return root.navigator.locks.request('smashup:'+key,fn);return fn();}
 function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{throw Error('บันทึกไม่สำเร็จ พื้นที่จัดเก็บอาจเต็ม กรุณาลองใหม่ก่อนออกจากหน้านี้');}}
 async function mutate(key,expected,fn,admin=false){return locked(key,()=>{const who=actor(expected,admin),records=list(key);const result=fn(records,who);write(key,records);root.dispatchEvent?.(new Event('smashup-data'));return result;});}
 const freshId=()=>root.crypto.randomUUID();
 async function bookCourt(input,expected){return mutate(keys.court,expected,(records,who)=>{
   const c=contact(input);dateTime(input.date,input.time);
   if(!courts.includes(input.court)||!/^\d{2}:00$/.test(input.time)||Number(input.time.slice(0,2))<11||Number(input.time.slice(0,2))>22)throw Error('เลือกหมายเลขคอร์ตและรอบเวลาจากรายการ');
   const record={id:freshId(),...c,date:input.date,time:input.time,court:input.court,ownerId:who.id,amount:130,status:'รอตรวจสอบ',paymentStatus:'ยังไม่ชำระเงินจริง (ต้นแบบ)',paymentDueAt:new Date(Date.now()+15*60000).toISOString(),createdAt:new Date().toISOString()};
   if(courtConflict(records,record))throw Error('คอร์ตนี้เพิ่งถูกจอง กรุณาเลือกคอร์ตหรือรอบอื่น');records.push(record);return record;
 });}
 async function bookBuffet(input,expected){return mutate(keys.buffet,expected,(records,who)=>{
   const c=contact(input);dateTime(input.date,input.session);if(!sessions.includes(input.session)||!['0','25'].includes(input.shuttle))throw Error('เลือกรอบเวลาและค่าลูกตามรายการ');
   const same=records.filter(r=>active(r)&&r.date===input.date&&r.session===input.session);
   if(same.some(r=>r.ownerId===who.id))throw Error('คุณลงชื่อในรอบนี้แล้ว');if(same.length>=30)throw Error('รอบนี้ครบ 30 คนแล้ว กรุณาเลือกรอบอื่น');
   const range=s=>String(s).match(/\d{2}:\d{2}/g)||[];
   if(records.some(r=>{if(!active(r)||r.ownerId!==who.id||r.date!==input.date)return false;const a=range(r.session),b=range(input.session);return a.length===2&&b.length===2&&a[0]<b[1]&&b[0]<a[1]}))throw Error('คุณมีรอบบุฟเฟต์ที่เวลาทับซ้อนกัน กรุณาตรวจรายการของฉัน');
   const members=read('smashup_users_v1',[]);const profile=Array.isArray(members)?members.find(u=>u.id===who.id)?.profile:null;
   const level=root.SmashLevels.confirmed(profile)||input.level||'';if(level&&!root.SmashLevels.valid(level))throw Error('เลือกระดับจากรายการ');
   const record={id:freshId(),...c,date:input.date,session:input.session,level,levelSource:level?(root.SmashLevels.confirmed(profile)===level?'organizer-confirmed':'self-assessed'):'pending',note:String(input.note||''),shuttle:input.shuttle,amount:60+Number(input.shuttle),ownerId:who.id,createdAt:new Date().toISOString(),status:'รอตรวจสอบ',paymentStatus:'ยังไม่ชำระเงินจริง (ต้นแบบ)'};records.push(record);return record;
 });}
 async function requestService(input,expected){return mutate(keys.service,expected,(records,who)=>{
   const c=contact(input),r={...input,...c};const integer=(v,max)=>Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=max;
   if(r.service==='สมัครแข่งขัน'){
     if(!['SMASHUP CHAMPIONSHIP #1','OPEN DOUBLES DAY'].includes(r.event)||!['ชายเดี่ยว','หญิงเดี่ยว','คู่ผสม'].includes(r.category))throw Error('เลือกรายการและประเภทแข่งขัน');
     if(r.category==='คู่ผสม'&&!r.partner?.trim())throw Error('ประเภทคู่ผสมต้องระบุชื่อคู่เล่น');
     const same=records.filter(x=>active(x)&&x.service===r.service&&x.event===r.event&&x.category===r.category);if(same.some(x=>x.ownerId===who.id))throw Error('สมัครประเภทนี้ไว้แล้ว');if(same.length>=64)throw Error('ประเภทแข่งขันนี้เต็มแล้ว');
   }else if(r.service==='จองสนามซ้อม'){
     dateTime(r.date,r.time);if(!['11:00–13:00','15:00–17:00','19:00–21:00'].includes(r.time)||!integer(r.players,8))throw Error('เลือกรอบซ้อมและจำนวนผู้เล่นเป็นจำนวนเต็ม 1–8 คน');
     if(records.some(x=>active(x)&&x.ownerId===who.id&&x.service===r.service&&x.date===r.date&&x.time===r.time))throw Error('ส่งคำขอซ้อมรอบนี้ไว้แล้ว');
   }else if(r.service==='ลงชื่อซื้อของ'){
     if(!['ลูกแบดมินตัน','กริ๊ปไม้แบด','เสื้อ SMASHUP'].includes(r.item)||!integer(r.quantity,5))throw Error('เลือกสินค้าและจำนวนเต็ม 1–5 ชิ้น');
     if(records.some(x=>pending(x.status)&&x.ownerId===who.id&&x.service===r.service&&x.item===r.item&&x.quantity===r.quantity&&x.note===r.note))throw Error('มีคำขอสินค้ารายการเดียวกันรอตรวจอยู่แล้ว');
   }else throw Error('ไม่รู้จักประเภทบริการ');
   const record={...r,id:freshId(),ownerId:who.id,createdAt:new Date().toISOString(),status:'รอตรวจสอบ'};records.push(record);return record;
 });}
 function own(type,who){if(!keys[type]||type==='queue')throw Error('ประเภทไม่ถูกต้อง');if(!who?.id)throw Error('กรุณาเข้าสู่ระบบ');return list(keys[type]).filter(r=>r.ownerId===who.id);}
  function canCancel(r,type,now=Date.now()){if(!active(r)||r.status==='ดำเนินการแล้ว')return false;if(type==='service'&&r.service!=='จองสนามซ้อม')return pending(r.status);return Number.isFinite(start(r))&&start(r)-now>=2*3600000;}
 async function cancel(type,id,expected){if(!keys[type]||type==='queue')throw Error('ประเภทไม่ถูกต้อง');return mutate(keys[type],expected,(records,who)=>{const r=records.find(x=>x.id===id);if(!r||r.ownerId!==who.id)throw Error('ยกเลิกได้เฉพาะรายการของคุณ');if(!canCancel(r,type))throw Error('รายการนี้ยกเลิกไม่ได้: เริ่มภายใน 2 ชั่วโมง หรือดำเนินการแล้ว');r.status='ยกเลิกแล้ว';r.cancelReason='ผู้ใช้ยกเลิก';r.cancelledAt=new Date().toISOString();r.history=[...(r.history||[]),{action:'cancel',actor:who.id,at:r.cancelledAt}];return r;});}
 async function setStatus(type,id,status,expected){return mutate(keys[type],expected,(records,who)=>{const r=records.find(x=>x.id===id);if(!r)throw Error('ไม่พบรายการ');if(!active(r))throw Error('รายการยกเลิกหรือหมดเวลาแล้ว กรุณาสร้างรายการใหม่');const allowed=type==='service'?['ดำเนินการแล้ว','ยกเลิกแล้ว']:['ยืนยันแล้ว','ยกเลิกแล้ว'];if(!allowed.includes(status))throw Error('เลือกยืนยัน ดำเนินการ หรือยกเลิก');if(r.status==='ดำเนินการแล้ว')throw Error('รายการดำเนินการเสร็จแล้ว');if(status==='ยืนยันแล้ว'&&type==='court'&&courtConflict(records,r))throw Error('คอร์ตและรอบเวลาชนกับรายการอื่น');if(status==='ยืนยันแล้ว'&&type==='buffet'&&records.filter(x=>x.id!==id&&active(x)&&x.date===r.date&&x.session===r.session).length>=30)throw Error('รอบนี้เต็มแล้ว');const before=r.status;r.status=status;r.history=[...(r.history||[]),{action:'status',from:before,to:status,actor:who.id,at:new Date().toISOString()}];return r;},true);}
 root.SmashRules={keys,courts,sessions,pending,escape,localDate,lastDate,read,list,session,actor,active,start,normalize,expired,dateTime,courtConflict,locked,write,own,bookCourt,bookBuffet,requestService,canCancel,cancel,setStatus};
 if(typeof module!=='undefined')module.exports=root.SmashRules;
})(typeof window==='undefined'?globalThis:window);
