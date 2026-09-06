const $=(s,r=document)=>r.querySelector(s);
$('#menuToggle')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',e=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

function mockExport(type,format){
  const names={daily:'รายงานการจองรายวัน',revenue:'รายงานรายได้',users:'รายงานผู้ใช้งาน',pending:'รายงานคำขอรอดำเนินการ'};
  const name=names[type]||type;
  const date=new Date().toISOString().slice(0,10);
  // Create dummy blob and trigger download
  const content=`SMASHUP ${name}\nวันที่ ${date}\nรูปแบบ ${format.toUpperCase()}\n\n(ไฟล์จำลองสำหรับเดโม - ข้อมูลจริงจะถูกสร้างจากระบบ)`;
  const blob=new Blob([content],{type:format==='pdf'?'application/pdf':'application/vnd.ms-excel'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`SMASHUP-${type}-${date}.${format==='pdf'?'pdf':'xlsx'}`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#exportMsg').textContent=`กำลังดาวน์โหลด ${name} (${format.toUpperCase()}) — ไฟล์จำลอง ${a.download}`;
}
document.querySelectorAll('[data-export]').forEach(btn=>{
  btn.addEventListener('click',()=> mockExport(btn.dataset.type, btn.dataset.export));
});
