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

const levelScript=document.createElement('script');levelScript.src='../shared/player-levels.js';levelScript.onload=initializeMatching;levelScript.onerror=()=>{document.getElementById('message').textContent='โหลดเกณฑ์ระดับไม่สำเร็จ กรุณาโหลดหน้าใหม่';};document.head.append(levelScript);
function initializeMatching(){
const levels=window.SmashLevels.levels;
document.getElementById('myLevel').innerHTML=levelOptions();
const assessmentLink=document.createElement('p');assessmentLink.innerHTML='<a href="../auth/player-assessment.html">ประเมินทักษะ / ดูคำอธิบายระดับ</a> · ระดับที่เลือกเองยังไม่ใช่การรับรองฝีมือ';document.getElementById('myLevel').parentElement.after(assessmentLink);
const STORAGE_KEY='smashup_matching_v1';
const matchingSession = (() => { try { return JSON.parse(localStorage.getItem('smashup_session_v1')); } catch { return null; } })();
const players=document.getElementById('players'),addPlayer=document.getElementById('addPlayer'),calculate=document.getElementById('calculate');
const results=document.getElementById('results'),resultList=document.getElementById('resultList'),message=document.getElementById('message');
function levelOptions(){return '<option value="">เลือกระดับ</option>'+Object.entries(levels).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('')}
function timeOptions(){return '<option value="">ไม่ระบุ</option>'+['11:00','13:00','15:00','17:00','19:00','21:00'].map(t=>`<option>${t}</option>`).join('')}
function addPlayerRow(data={}){
 const row=document.createElement('div');row.className='player-row';
 row.innerHTML=`<label>ชื่อผู้เล่น<input class="player-name" value="${escapeAttr(data.name||'')}" placeholder="เช่น ผู้เล่น A"></label><label>ระดับการเล่น<select class="player-level">${levelOptions()}</select></label><label>เวลาที่สะดวก<select class="player-time">${timeOptions()}</select></label><label>ระยะทาง (กม.)<input class="player-distance" type="number" min="0" step="0.5" value="${escapeAttr(data.distance??'')}" placeholder="เช่น 3"></label><button class="remove" type="button">ลบ</button>`;
 if(data.level)row.querySelector('.player-level').value=data.level;if(data.time)row.querySelector('.player-time').value=data.time;
 const goalLabel=document.createElement('label');goalLabel.textContent='เป้าหมาย';const goalSelect=document.createElement('select');goalSelect.className='player-goal';['','ออกกำลังกาย','พัฒนาฝีมือ','หาเพื่อนเล่น','แข่งขัน'].forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value||'ไม่ระบุ';goalSelect.append(option)});goalSelect.value=data.goal||'';goalLabel.append(goalSelect);row.insertBefore(goalLabel,row.querySelector('.remove'));
 row.querySelector('.remove').addEventListener('click',()=>{row.remove();if(!players.children.length)addPlayerRow();});players.appendChild(row);
}
function saveState(){
 const state={myLevel:document.getElementById('myLevel').value,playDate:document.getElementById('playDate').value,playTime:document.getElementById('playTime').value,maxDistance:document.getElementById('maxDistance').value,players:[...players.querySelectorAll('.player-row')].map(r=>({name:r.querySelector('.player-name').value,level:r.querySelector('.player-level').value,time:r.querySelector('.player-time').value,distance:r.querySelector('.player-distance').value,goal:r.querySelector('.player-goal').value}))};
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function loadState(){try{const state=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!state)return;['myLevel','playDate','playTime','maxDistance'].forEach(id=>{if(state[id]!=null)document.getElementById(id).value=state[id]});players.innerHTML='';(state.players||[]).forEach(p=>addPlayerRow(p));if(!players.children.length)addPlayerRow({name:'ผู้เล่น 1'});}catch(e){localStorage.removeItem(STORAGE_KEY)}}
addPlayer.addEventListener('click',()=>addPlayerRow({name:`ผู้เล่น ${players.children.length+1}`}));addPlayerRow({name:'ผู้เล่น 1'});loadState();
function freshMatchingProfile(){try{const list=JSON.parse(localStorage.getItem('smashup_users_v1'))||[];return Array.isArray(list)?list.find(u=>u.id===matchingSession?.id)?.profile:null}catch{return null}}
if (matchingSession) {
 const profile = matchingSession.profile;
 const myLevel = document.getElementById('myLevel'), playTime = document.getElementById('playTime');
 const freshUsers=(()=>{try{return JSON.parse(localStorage.getItem('smashup_users_v1'))||[]}catch{return []}})();
 const freshProfile=(Array.isArray(freshUsers)?freshUsers.find(u=>u.id===matchingSession.id)?.profile:null);
 const effective=window.SmashLevels.effective(freshProfile);
 if(effective)myLevel.value=effective;
 myLevel.disabled=!!window.SmashLevels.confirmed(freshProfile);
 assessmentLink.append(document.createTextNode(' · '+window.SmashLevels.status(freshProfile)));
 if (!playTime.value && profile?.availability) playTime.value = profile.availability;
}
function levelScore(my,other){const gap=Math.abs(levels[my].value-levels[other].value);return gap===0?100:gap===1?65:30}
function timeScore(my,other){if(!my||!other)return 50;const a=Number(my.slice(0,2)),b=Number(other.slice(0,2));return a===b?100:Math.max(40,100-Math.abs(a-b)*15)}
function distanceScore(max,dist){if(max===''||dist==='')return 50;max=Number(max);dist=Number(dist);if(max<=0)return dist===0?100:0;return Math.max(0,Math.round(100-(dist/max)*100))}
function calculateMatches(){
 const currentProfile=freshMatchingProfile();
 const locked=window.SmashLevels.confirmed(currentProfile);
 if(locked){document.getElementById('myLevel').value=locked;document.getElementById('myLevel').disabled=true;}
 const my=locked||document.getElementById('myLevel').value;if(!levels[my]){message.textContent='ยังไม่ทราบระดับ กรุณาประเมินตนเองหรือให้ผู้จัดช่วยสังเกตก่อนคำนวณ';return}
 const myTime=document.getElementById('playTime').value,maxDistance=document.getElementById('maxDistance').value;
 const data=[...players.querySelectorAll('.player-row')].map((row,i)=>({name:row.querySelector('.player-name').value.trim()||`ผู้เล่น ${i+1}`,level:row.querySelector('.player-level').value,time:row.querySelector('.player-time').value,distance:row.querySelector('.player-distance').value,goal:row.querySelector('.player-goal').value})).filter(p=>levels[p.level]);
 if(!data.length){message.textContent='กรุณาเพิ่มผู้เล่นและเลือกระดับอย่างน้อย 1 คน';return}
 if(maxDistance!==''&&(!Number.isFinite(Number(maxDistance))||Number(maxDistance)<0)||data.some(p=>p.distance!==''&&(!Number.isFinite(Number(p.distance))||Number(p.distance)<0))){message.textContent='ระยะทางต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป';return}
 const goalFilter=document.getElementById('goalFilter').value;
 const scored=data.filter(p=>!goalFilter||p.goal===goalFilter).map(p=>{const skillScore=levelScore(my,p.level),scheduleScore=timeScore(myTime,p.time),travelScore=distanceScore(maxDistance,p.distance);const score=Math.round(skillScore*.7+scheduleScore*.15+travelScore*.15);return {...p,score,skillScore,gap:Math.abs(levels[my].value-levels[p.level].value)}}).filter(p=>p.gap<=1).sort((a,b)=>b.score-a.score);saveState();
 resultList.innerHTML=scored.map((p,i)=>{const reason=p.gap===0?'ระดับเดียวกัน':'ระดับใกล้เคียงตามลำดับคำอธิบาย';return `<article class="result-card"><div class="rank">${String(i+1).padStart(2,'0')}</div><div><div class="result-name">${escapeHtml(p.name)}</div><div class="result-detail">${levels[p.level].label} · ${reason} · ข้อมูลที่กรอกเอง · เวลา ${escapeHtml(p.time||'ไม่ระบุ')} · ระยะ ${p.distance===''?'ไม่ระบุ':escapeHtml(p.distance)+' กม.'}</div></div><div class="score match-mid"><strong>${p.score}/100</strong><small>คะแนนเปรียบเทียบ</small></div></article>`}).join('')||'<p>ไม่พบผู้เล่นระดับเดียวกันหรือใกล้เคียง กรุณาทบทวนผู้เล่นที่กรอก ไม่ควรเปลี่ยนระดับเพื่อให้ได้ผลลัพธ์</p>';
 results.hidden=false;message.textContent=`พบ ${scored.length} จาก ${data.length} คน · น้ำหนักทดลอง ระดับ 70% + เวลา 15% + ระยะทาง 15% ไม่ใช่โอกาสจับคู่สำเร็จ เป้าหมายไม่เพิ่มคะแนน`;results.scrollIntoView({behavior:'smooth',block:'start'});
}
const escapeHtml=window.SmashUtils?.escapeHtml||((v)=>String(v==null?'':v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
function escapeAttr(v){return escapeHtml(v)}
calculate.addEventListener('click',calculateMatches);
['myLevel','playDate','playTime','maxDistance'].forEach(id=>document.getElementById(id).addEventListener('change',saveState));
const filterLabel=document.createElement('label');filterLabel.textContent='กรองเป้าหมายผู้เล่น (ไม่เพิ่มคะแนนทักษะ)';const filter=document.createElement('select');filter.id='goalFilter';['','ออกกำลังกาย','พัฒนาฝีมือ','หาเพื่อนเล่น','แข่งขัน'].forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value||'ทุกเป้าหมาย';filter.append(option)});filterLabel.append(filter);document.getElementById('maxDistance').parentElement.after(filterLabel);
}
