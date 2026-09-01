const authUiScript = document.createElement('script');
authUiScript.src = '../shared/auth-ui.js';
document.head.append(authUiScript);

const matchingHeader = document.querySelector('.topbar');
const matchingNavigation = matchingHeader?.querySelector('nav');
if (matchingNavigation) matchingNavigation.outerHTML = '<a class="back" href="../booking/court-booking.html">← หน้าจองสนาม</a>';

const navigationStyle = document.createElement('link');
navigationStyle.rel = 'stylesheet';
navigationStyle.href = '../booking/topic.css';
document.head.append(navigationStyle);

const navigationScript = document.createElement('script');
navigationScript.src = '../booking/topic-nav.js';
document.body.append(navigationScript);

const themeStyle = document.createElement('link');
themeStyle.rel = 'stylesheet';
themeStyle.href = '../shared/theme.css';
document.head.append(themeStyle);

const levels={beginner:{label:'Beginner — มือใหม่',value:1},intermediate:{label:'Intermediate — ระดับกลาง',value:2},advanced:{label:'Advanced — ระดับสูง',value:3}};
const STORAGE_KEY='smashup_matching_v1';
const matchingSession = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
const players=document.getElementById('players'),addPlayer=document.getElementById('addPlayer'),calculate=document.getElementById('calculate');
const results=document.getElementById('results'),resultList=document.getElementById('resultList'),message=document.getElementById('message');
function levelOptions(){return '<option value="">เลือกระดับ</option>'+Object.entries(levels).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('')}
function timeOptions(){return '<option value="">ไม่ระบุ</option>'+['11:00','13:00','15:00','17:00','19:00','21:00'].map(t=>`<option>${t}</option>`).join('')}
function addPlayerRow(data={}){
 const row=document.createElement('div');row.className='player-row';
 row.innerHTML=`<label>ชื่อผู้เล่น<input class="player-name" value="${escapeAttr(data.name||'')}" placeholder="เช่น ผู้เล่น A"></label><label>ระดับการเล่น<select class="player-level">${levelOptions()}</select></label><label>เวลาที่สะดวก<select class="player-time">${timeOptions()}</select></label><label>ระยะทาง (กม.)<input class="player-distance" type="number" min="0" step="0.5" value="${data.distance??''}" placeholder="เช่น 3"></label><button class="remove" type="button">ลบ</button>`;
 if(data.level)row.querySelector('.player-level').value=data.level;if(data.time)row.querySelector('.player-time').value=data.time;
 row.querySelector('.remove').addEventListener('click',()=>{row.remove();if(!players.children.length)addPlayerRow();});players.appendChild(row);
}
function saveState(){
 const state={myLevel:document.getElementById('myLevel').value,playDate:document.getElementById('playDate').value,playTime:document.getElementById('playTime').value,maxDistance:document.getElementById('maxDistance').value,players:[...players.querySelectorAll('.player-row')].map(r=>({name:r.querySelector('.player-name').value,level:r.querySelector('.player-level').value,time:r.querySelector('.player-time').value,distance:r.querySelector('.player-distance').value}))};
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function loadState(){try{const state=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!state)return;['myLevel','playDate','playTime','maxDistance'].forEach(id=>{if(state[id]!=null)document.getElementById(id).value=state[id]});players.innerHTML='';(state.players||[]).forEach(p=>addPlayerRow(p));if(!players.children.length)addPlayerRow({name:'ผู้เล่น 1'});}catch(e){localStorage.removeItem(STORAGE_KEY)}}
addPlayer.addEventListener('click',()=>addPlayerRow({name:`ผู้เล่น ${players.children.length+1}`}));addPlayerRow({name:'ผู้เล่น 1'});loadState();
if (matchingSession?.profile) {
 const profile = matchingSession.profile;
 const myLevel = document.getElementById('myLevel'), playTime = document.getElementById('playTime');
 if (!myLevel.value && profile.level) myLevel.value = profile.level;
 if (!playTime.value && profile.availability) playTime.value = profile.availability;
}
function levelScore(my,other){const gap=Math.abs(levels[my].value-levels[other].value);return gap===0?100:gap===1?65:30}
function timeScore(my,other){if(!my||!other)return 50;const a=Number(my.slice(0,2)),b=Number(other.slice(0,2));return a===b?100:Math.max(40,100-Math.abs(a-b)*15)}
function distanceScore(max,dist){if(max===''||dist==='')return 50;max=Number(max);dist=Number(dist);if(max<=0)return dist===0?100:0;return Math.max(0,Math.round(100-(dist/max)*100))}
function calculateMatches(){
 const my=document.getElementById('myLevel').value;if(!my){message.textContent='กรุณาเลือกระดับการเล่นของคุณก่อน';return}
 const myTime=document.getElementById('playTime').value,maxDistance=document.getElementById('maxDistance').value;
 const data=[...players.querySelectorAll('.player-row')].map((row,i)=>({name:row.querySelector('.player-name').value.trim()||`ผู้เล่น ${i+1}`,level:row.querySelector('.player-level').value,time:row.querySelector('.player-time').value,distance:row.querySelector('.player-distance').value})).filter(p=>p.level);
 if(!data.length){message.textContent='กรุณาเพิ่มผู้เล่นและเลือกระดับอย่างน้อย 1 คน';return}
 const scored=data.map(p=>{const level=levelScore(my,p.level),time=timeScore(myTime,p.time),distance=distanceScore(maxDistance,p.distance);const score=Math.round(level*.7+time*.15+distance*.15);return {...p,score,level,time,distance,gap:Math.abs(levels[my].value-levels[p.level].value)}}).sort((a,b)=>b.score-a.score);saveState();
 resultList.innerHTML=scored.map((p,i)=>{const cls=p.score>=80?'match-good':p.score>=60?'match-mid':'match-low';const reason=p.gap===0?'ระดับตรงกัน':`ต่างกัน ${p.gap} ระดับ`;return `<article class="result-card"><div class="rank">${String(i+1).padStart(2,'0')}</div><div><div class="result-name">${escapeHtml(p.name)}</div><div class="result-detail">${levels[p.level].label} · ${reason} · ระดับ ${p.level}% · เวลา ${p.time||'ไม่ระบุ'} · ระยะ ${p.distance===''?'ไม่ระบุ':p.distance+' กม.'}</div></div><div class="score ${cls}"><strong>${p.score}%</strong><small>ความเหมาะสม</small></div></article>`}).join('');
 results.hidden=false;message.textContent=`คำนวณจากผู้เล่น ${scored.length} คน · ระดับ 70% + เวลา 15% + ระยะทาง 15%`;results.scrollIntoView({behavior:'smooth',block:'start'});
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(v){return escapeHtml(v)}
calculate.addEventListener('click',calculateMatches);
['myLevel','playDate','playTime','maxDistance'].forEach(id=>document.getElementById(id).addEventListener('change',saveState));
