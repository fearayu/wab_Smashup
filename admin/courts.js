// Courts management – vanilla JS with localStorage
const $ = (s,r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click',()=> $('#sidebar').classList.toggle('open'));
$('#adminLogout')?.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('smashup_session_v1');location.href='../auth/index.html';});

const STORAGE='smashup_courts_v1';
const defaultCourts=[
  {id:'1',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'2',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'3',type:'มาตรฐาน',status:'ไม่ว่าง',price:130,hours:'11:00–23:00'},
  {id:'4',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'5',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'6',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'7',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'8',type:'มาตรฐาน',status:'ปิดปรับปรุง',price:130,hours:'11:00–18:00'},
  {id:'9',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'10',type:'มาตรฐาน',status:'ไม่ว่าง',price:130,hours:'11:00–23:00'},
  {id:'11',type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'},
  {id:'A',type:'พรีเมียม',status:'ว่าง',price:150,hours:'11:00–23:00'},
  {id:'B',type:'พรีเมียม',status:'ว่าง',price:150,hours:'11:00–23:00'},
];
let courts=[];
try{ courts=JSON.parse(localStorage.getItem(STORAGE))||defaultCourts; }catch{ courts=defaultCourts; }
function save(){ localStorage.setItem(STORAGE, JSON.stringify(courts)); }

let editing=null;
const body=$('#courtBody'), search=$('#searchCourt'), filter=$('#filterStatus');

function render(){
  const q=(search.value||'').toLowerCase();
  const f=filter.value;
  let list=courts.filter(c=> (!q || c.id.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)) && (!f || c.status===f));
  $('#courtCount').textContent=list.length+' คอร์ต';
  $('#statAvailable').textContent=courts.filter(c=>c.status==='ว่าง').length;
  $('#statMaintenance').textContent=courts.filter(c=>c.status==='ปิดปรับปรุง').length;
  body.innerHTML=list.map(c=>{
    const realIdx=courts.indexOf(c);
    const cls=c.status==='ว่าง'?'open':c.status==='ไม่ว่าง'?'busy':'maintenance';
    const toggleLabel=c.status==='ว่าง'?'ปิดคอร์ต':'เปิดคอร์ต';
    const toggleClass=c.status==='ว่าง'?'':'off';
    return `<tr>
      <td><strong>คอร์ต ${c.id}</strong></td>
      <td>${c.type}</td>
      <td><span class="status ${cls}">${c.status}</span></td>
      <td class="price">฿ ${c.price}</td>
      <td>${c.hours}</td>
      <td><div class="actions"><button class="btn-toggle ${toggleClass}" data-toggle="${realIdx}">${toggleLabel}</button><button class="btn-edit" data-edit="${realIdx}">แก้ไข</button></div></td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:28px">ไม่พบคอร์ตที่ค้นหา</td></tr>`;
  body.querySelectorAll('[data-toggle]').forEach(b=> b.addEventListener('click',()=>{
    const i=Number(b.dataset.toggle);
    const c=courts[i];
    if(c.status==='ว่าง') c.status='ไม่ว่าง';
    else if(c.status==='ไม่ว่าง') c.status='ว่าง';
    else c.status='ว่าง';
    save(); render();
  }));
  body.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click',()=>{
    const i=Number(b.dataset.edit);
    editing=i;
    const c=courts[i];
    $('#editTitle').textContent='แก้ไขคอร์ต '+c.id;
    $('#editPrice').value=c.price;
    $('#editHours').value=c.hours;
    $('#editStatus').value=c.status;
    $('#editDialog').showModal();
  }));
}
search.addEventListener('input',render);
filter.addEventListener('change',render);
$('#addCourtBtn').addEventListener('click',()=>{
  const id=prompt('ชื่อคอร์ตใหม่ (เช่น 12 หรือ C):');
  if(!id) return;
  if(courts.some(c=>c.id===id.trim())){ alert('มีคอร์ตนี้อยู่แล้ว'); return; }
  courts.push({id:id.trim(),type:'มาตรฐาน',status:'ว่าง',price:130,hours:'11:00–23:00'});
  save(); render();
});
$('#closeDialog').addEventListener('click',()=> $('#editDialog').close());
$('#editForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  if(editing===null) return;
  const c=courts[editing];
  c.price=Number($('#editPrice').value)||c.price;
  c.hours=$('#editHours').value.trim()||c.hours;
  c.status=$('#editStatus').value;
  save(); render();
  $('#editDialog').close();
  editing=null;
});
render();
