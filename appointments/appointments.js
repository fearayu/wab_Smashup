// Appointments – Tab switching + actions
const $ = (s, r=document)=> r.querySelector(s);
$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));

const invites = [
  { id:1, name:'คุณบีม', avatar:'https://i.pravatar.cc/120?img=33', date:'12 ก.ย. 2026', time:'19:00 - 20:00', court:'คอร์ต 3 • SMASHUP สาขาเมืองเชียงราย', status:'pending' },
  { id:2, name:'คุณมายด์', avatar:'https://i.pravatar.cc/120?img=26', date:'13 ก.ย. 2026', time:'18:00 - 19:30', court:'คอร์ต 1 • SMASHUP สาขาเซ็นทรัล', status:'pending' },
  { id:3, name:'คุณต้น', avatar:'https://i.pravatar.cc/120?img=12', date:'14 ก.ย. 2026', time:'20:00 - 21:00', court:'คอร์ต 5 • SMASHUP สาขาเมืองเชียงราย', status:'pending' },
];

const schedule = [
  { date:'10 ก.ย. 2026', time:'19:00', court:'คอร์ต 2', partner:'คุณฟ้า', status:'ยืนยันแล้ว' },
  { date:'08 ก.ย. 2026', time:'18:00', court:'คอร์ต 4', partner:'คุณโอ๊ต', status:'ยืนยันแล้ว' },
  { date:'15 ก.ย. 2026', time:'20:00', court:'คอร์ต 1', partner:'คุณบีม', status:'รอยืนยัน' },
];

function renderInvites(){
  const list = $('#inviteList');
  const count = $('#inviteCount');
  const pending = invites.filter(x=> x.status==='pending');
  count.textContent = String(pending.length);
  $('#inviteEmpty').hidden = pending.length!==0;
  list.innerHTML = invites.map(inv=>{
    if(inv.status==='accepted'){
      return `<article class="invite-card accepted"><div class="invite-avatar"><img src="${inv.avatar}" alt=""></div><div class="invite-info"><strong>${inv.name}</strong><span>${inv.date} • ${inv.time}</span><div class="invite-meta"><span>📍 ${inv.court}</span></div></div><span class="badge green">ตอบรับแล้ว</span></article>`;
    }
    if(inv.status==='declined'){
      return `<article class="invite-card declined"><div class="invite-avatar"><img src="${inv.avatar}" alt=""></div><div class="invite-info"><strong>${inv.name}</strong><span>${inv.date} • ${inv.time}</span><div class="invite-meta"><span>📍 ${inv.court}</span></div></div><span class="badge gray">ปฏิเสธแล้ว</span></article>`;
    }
    return `<article class="invite-card" data-id="${inv.id}">
      <div class="invite-avatar"><img src="${inv.avatar}" alt="${inv.name}"></div>
      <div class="invite-info"><strong>${inv.name}</strong><span>${inv.date} • ${inv.time}</span><div class="invite-meta"><span>📍 ${inv.court}</span></div></div>
      <div class="invite-actions"><button class="btn-primary" data-action="accept" data-id="${inv.id}">ตอบรับ</button><button class="btn-secondary" data-action="decline" data-id="${inv.id}">ปฏิเสธ</button></div>
    </article>`;
  }).join('');
  list.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.dataset.id);
      const inv = invites.find(x=> x.id===id);
      if(!inv) return;
      if(btn.dataset.action==='accept'){
        inv.status='accepted';
        schedule.unshift({ date:inv.date, time:inv.time.split(' - ')[0], court: inv.court.split('•')[0].trim(), partner: inv.name, status:'ยืนยันแล้ว' });
      } else inv.status='declined';
      renderInvites(); renderSchedule();
    });
  });
}

function renderSchedule(){
  const tbody = $('#scheduleBody');
  tbody.innerHTML = schedule.map(row=>{
    const badge = row.status==='ยืนยันแล้ว' ? 'badge green' : row.status==='รอยืนยัน' ? 'badge orange' : 'badge gray';
    return `<tr><td>${row.date}</td><td>${row.time}</td><td>${row.court}</td><td>${row.partner}</td><td><span class="${badge}">${row.status}</span></td></tr>`;
  }).join('');
}

// Tabs
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected','true');
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(p=> p.hidden = true);
    const panel = target==='invites' ? $('#panel-invites') : $('#panel-schedule');
    panel.hidden = false; panel.classList.remove('active'); void panel.offsetWidth; panel.classList.add('active');
  });
});

renderInvites();
renderSchedule();
