// Matchmaking – Vanilla JS
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

$('#menuToggle')?.addEventListener('click', ()=> $('#sidebar').classList.toggle('open'));

const PLAYERS = [
  { id:1, name:'คุณบีม', level:'intermediate', label:'ระดับกลาง', img:'https://i.pravatar.cc/120?img=33', distance:'2.1 กม.', time:'19:00', match:92 },
  { id:2, name:'คุณต้น', level:'beginner', label:'มือใหม่', img:'https://i.pravatar.cc/120?img=12', distance:'4.5 กม.', time:'18:30', match:84 },
  { id:3, name:'คุณมายด์', level:'advanced', label:'ระดับสูง', img:'https://i.pravatar.cc/120?img=26', distance:'1.2 กม.', time:'20:00', match:78 },
  { id:4, name:'คุณโอ๊ต', level:'intermediate', label:'ระดับกลาง', img:'https://i.pravatar.cc/120?img=68', distance:'6.0 กม.', time:'19:30', match:71 },
];

const levelRank = { beginner:1, intermediate:2, advanced:3 };

function badgeClass(m){ return m>=85?'high': m>=75?'mid':''; }

function render(list){
  const grid = $('#cardGrid');
  const count = $('#resultCount');
  if(count) count.textContent = `${list.length} คน`;
  grid.innerHTML = list.map(p=>`
    <article class="player-card" data-id="${p.id}">
      <div class="card-top">
        <div class="avatar"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.textContent='${p.name.slice(0,1)}'"></div>
        <div class="card-meta"><strong>${p.name}</strong><small>${p.label} • ${p.distance}</small></div>
        <div class="match-badge ${badgeClass(p.match)}">${p.match}%<br><small style="font:400 10px Kanit">ตรงกัน</small></div>
      </div>
      <div class="card-details">
        <span class="chip level">${p.label}</span>
        <span class="chip">เวลา ${p.time}</span>
        <span class="chip">${p.distance}</span>
        <span class="chip">${p.id%2?'เดี่ยว':'คู่'} • ใกล้คุณ</span>
      </div>
      <button type="button" class="btn-primary invite-btn" data-invite="${p.id}">ส่งคำเชิญ</button>
    </article>
  `).join('');
  grid.querySelectorAll('[data-invite]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btn.textContent = '✓ ส่งคำเชิญแล้ว';
      btn.classList.add('sent');
      btn.disabled = true;
      try{
        const invites = JSON.parse(localStorage.getItem('smashup_invites_v1')||'[]');
        invites.push({ id: Date.now(), to: btn.dataset.invite, name: PLAYERS.find(x=> String(x.id)===btn.dataset.invite)?.name, at: new Date().toISOString() });
        localStorage.setItem('smashup_invites_v1', JSON.stringify(invites));
      }catch{}
    });
  });
}

function filtered(){
  const skill = $('#skillLevel').value;
  const type = $('#matchType').value;
  const dist = $('#distance').value;
  let list = [...PLAYERS];
  if(skill){
    // sort by level proximity to selected
    const rank = levelRank[skill]||2;
    list = list.map(p=>({ ...p, _gap: Math.abs(levelRank[p.level]-rank) }))
               .sort((a,b)=> a._gap - b._gap || b.match - a.match)
               .map(({_gap,...r})=> r);
    // recalc match% slightly based on gap
    list = list.map(p=>{
      const gap = Math.abs(levelRank[p.level]-rank);
      const adj = gap===0?0: gap===1? -10 : -20;
      return { ...p, match: Math.max(52, Math.min(98, p.match + adj)) };
    });
  }
  if(dist){
    const max = Number(dist);
    list = list.filter(p=> Number(p.distance.replace(' กม.','')) <= max + 2).slice(0,4);
    if(!list.length) list = [...PLAYERS].slice(0,2);
  }
  if(type){
    // just tag, no filter needed but keep all
  }
  return list;
}

$('#searchForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const skill = $('#skillLevel').value;
  const msg = $('#searchMessage');
  if(!skill){ msg.textContent = 'กรุณาเลือกระดับฝีมือก่อนค้นหา'; msg.className='form-message error'; return; }
  msg.textContent = 'กำลังค้นหาผู้เล่นที่ตรงกับเงื่อนไขของคุณ...';
  msg.className='form-message';
  setTimeout(()=>{
    const list = filtered();
    const sort = $('#sortBy').value;
    if(sort==='level') list.sort((a,b)=> levelRank[b.level]-levelRank[a.level]);
    else list.sort((a,b)=> b.match - a.match);
    render(list);
    msg.textContent = `พบ ${list.length} คนที่ตรงกับเงื่อนไข • อัปเดต ${new Date().toLocaleTimeString('th-TH')}`;
    $('#resultsSection').scrollIntoView({ behavior:'smooth', block:'start' });
  }, 420);
});

$('#sortBy').addEventListener('change', ()=>{
  const list = filtered();
  const sort = $('#sortBy').value;
  if(sort==='level') list.sort((a,b)=> levelRank[b.level]-levelRank[a.level]);
  else list.sort((a,b)=> b.match - a.match);
  render(list);
});

// initial render
render([...PLAYERS].sort((a,b)=> b.match-a.match));

// persist search
try{
  const s = JSON.parse(localStorage.getItem('smashup_matchmaking_search_v1')||'null');
  if(s){ $('#skillLevel').value=s.skillLevel||''; $('#matchType').value=s.matchType||''; $('#playDateTime').value=s.playDateTime||''; $('#distance').value=s.distance||''; }
}catch{}
['skillLevel','matchType','playDateTime','distance'].forEach(id=> $('#'+id)?.addEventListener('change', ()=>{
  localStorage.setItem('smashup_matchmaking_search_v1', JSON.stringify({
    skillLevel:$('#skillLevel').value, matchType:$('#matchType').value, playDateTime:$('#playDateTime').value, distance:$('#distance').value
  }));
}));
