(function () {
  'use strict';
  const api=window.SmashLevels, usersKey='smashup_users_v1', sessionKey='smashup_session_v1';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const users=()=>{const list=read(usersKey,[]);return Array.isArray(list)?list:[]};
  const esc=(window.SmashUtils&&window.SmashUtils.escapeHtml)||((value)=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const options='<option value="">ยังไม่แน่ใจ / ยังไม่ระบุ</option>'+Object.entries(api.levels).map(([code,l])=>`<option value="${code}">${l.label}</option>`).join('');
  const answers='<option value="">เลือกคำตอบ</option>'+api.answerOptions.map(a=>`<option>${a}</option>`).join('');
  const session=read(sessionKey,null), current=document.querySelector('#current');
  const signature=a=>JSON.stringify(a||{});
  const dateText=value=>value?new Date(value).toLocaleString('th-TH'):'ไม่ระบุวัน';
  document.querySelector('#guide').innerHTML=Object.values(api.levels).map(l=>`<p><strong>${l.label}</strong> ${l.description}</p>`).join('');
  function audit(a={}){
    const names={'self-update':'อัปเดตคำตอบ','review-request':'ขอทบทวนระดับ','organizer-review':'ผู้จัดตรวจระดับ'};
    const latest=a.reviewedAt?`<p>ผลยืนยันล่าสุด: ${esc(a.confirmedLevel)} · ${esc(a.assessor)} · ${esc(dateText(a.reviewedAt))}<br>${esc(a.reason)}${!a.reviewEvidence?'<br>ผลเดิมก่อนเพิ่มแบบบันทึกหลักฐาน สามารถขอทบทวนได้':''}</p>`:'';
    const entries=(a.events||[]).slice().reverse().map(e=>`<li><strong>${esc(names[e.type]||e.type)}</strong> · ${esc(dateText(e.at))}<br>${esc(e.reason||('ระดับที่เลือกเอง: '+(e.selfLevel||'ยังไม่แน่ใจ')))}${e.assessor?'<br>ผู้ประเมิน: '+esc(e.assessor):''}${e.type==='organizer-review'?'<br>'+(e.decision==='confirm'?'ยืนยัน: '+esc(e.previousLevel||'ยังไม่มี')+' → '+esc(e.level):'รอข้อมูลเพิ่ม · คงระดับเดิม'):''}</li>`).join('');
    const evidence=a.reviewEvidence;
    const detail=evidence?`<details><summary>รายละเอียดการสังเกตล่าสุด</summary><p>${esc(evidence.qualification)} · วันที่ ${esc(evidence.observedDate)} · ${esc(evidence.games)} เกม</p>${api.questions.map((q,i)=>`<p>${esc(q)}: ${esc(evidence.observations?.[i]||'ยังไม่ระบุ')}</p>`).join('')}<p>บริบท / หลักฐาน: ${esc(evidence.evidence||'ไม่ระบุ')}</p>${evidence.disputed?'<p>ผู้ประเมินอีกคน: '+esc(evidence.secondAssessor)+' · '+esc(evidence.secondLevel)+'</p>':''}</details>`:'';
    return latest+detail+`<details><summary>ประวัติการประเมินและทบทวน</summary>${entries?'<ol>'+entries+'</ol>':'<p>ยังไม่มีประวัติในขั้นตอนใหม่</p>'}</details>`;
  }
  function save(id,expected,change,admin=false){
    const fresh=read(sessionKey,null), list=users();
    if(!fresh||fresh.id!==session.id||fresh.role!==session.role||(admin&&fresh.role!=='admin'))throw Error('บัญชีเปลี่ยนไป กรุณาโหลดหน้าใหม่');
    if(!admin&&id!==fresh.id)throw Error('แก้ได้เฉพาะข้อมูลตนเอง');
    const record=list.find(u=>u.id===id);if(!record)throw Error('ไม่พบสมาชิก');
    if(signature(record.profile?.assessment)!==expected)throw Error('ข้อมูลถูกปรับในหน้าต่างอื่น กรุณาโหลดหน้าใหม่ก่อนบันทึก');
    record.profile={...record.profile,...change(record.profile||{},fresh.id)};
    localStorage.setItem(usersKey,JSON.stringify(list));
    if(record.id===fresh.id){try{localStorage.setItem(sessionKey,JSON.stringify({...fresh,profile:record.profile}))}catch{}}
    return record;
  }
  if(!session){current.innerHTML='กรุณา <a href="login.html?next=../auth/player-assessment.html">เข้าสู่ระบบ</a> เพื่อบันทึกข้อมูล';return}
  if(session.role==='admin'){
    document.querySelector('#adminBack').hidden=false;document.querySelector('#review').hidden=false;
    const list=users().filter(u=>u.role!=='admin');
    document.querySelector('#reviewList').innerHTML=list.map((u,i)=>{
      const a=u.profile?.assessment||{};
      return `<article data-index="${i}"><h3>${esc(u.username||u.name)}</h3><div class="review-overview"></div><p>ประเมินตนเอง: ${esc(a.selfLevel||'ไม่แน่ใจ')}<br>ประสบการณ์: ${esc(a.experience||'ยังไม่ระบุ')}</p><details><summary>คำตอบแบบประเมินตนเอง</summary>${api.questions.map((q,i)=>`<p>${esc(q)}: ${esc(a.answers?.[i]||'ยังไม่ตอบ')}</p>`).join('')}</details>
      <form class="review-form"><label>ผลการตรวจ<select name="decision"><option value="defer">ขอข้อมูลหรือสังเกตเพิ่ม (คงระดับเดิม)</option><option value="confirm">ยืนยันระดับจากการสังเกต</option></select></label>
      <label>ระดับที่จะยืนยัน<select name="level">${options}</select></label><label>ชื่อผู้ประเมิน<input name="assessor" maxlength="100" required></label><label>บทบาท / ประสบการณ์ที่ใช้ประเมิน<input name="qualification" maxlength="300" placeholder="เช่น ผู้จัดก๊วนที่สังเกตการเล่น หรือผู้ฝึกสอน"></label>
      <div class="assessment-grid"><label>วันที่สังเกตการเล่น<input name="observedDate" type="date"></label><label>จำนวนเกมที่สังเกต<input name="games" type="number" min="0" max="1000" step="1"></label></div>
      <fieldset><legend>ผลสังเกตทักษะทั้ง 6 ด้าน</legend>${api.questions.map((q,i)=>`<label>${esc(q)}<small class="skill-anchor">${esc(api.anchors[i])}</small><select class="observation">${answers}</select></label>`).join('')}</fieldset>
      <label>บริบท / เกมที่สังเกต / หลักฐานการแข่งขัน<textarea name="evidence" maxlength="1500" placeholder="ระบุรอบ วัน คู่เล่น และเงื่อนไข เช่น บาดเจ็บ ระดับสูงต้องระบุหลักฐานการเล่นหรือการแข่งขัน"></textarea></label>
      <label class="check-label"><input name="disputed" type="checkbox">มีข้อโต้แย้งหรือผู้ประเมินให้ผลต่างกัน</label><div class="second-review" hidden><p>ให้ผู้ประเมินอีกคนตรวจอย่างอิสระ หากผลยังต่างกันให้ขอข้อมูลเพิ่ม</p><label>ชื่อผู้ประเมินคนที่สอง<input name="secondAssessor" maxlength="100"></label><label>ระดับที่คนที่สองประเมิน<select name="secondLevel">${options}</select></label></div>
      <label>เหตุผลของผลตรวจ / สิ่งที่ต้องตรวจเพิ่ม<textarea name="reason" maxlength="1500" required></textarea></label><button type="submit">บันทึกผลตรวจ</button><p class="review-message" role="status"></p></form></article>`;
    }).join('')||'<p>ยังไม่มีสมาชิกให้ตรวจ</p>';
    document.querySelectorAll('[data-index]').forEach(card=>{
      let target=list[Number(card.dataset.index)];const form=card.querySelector('form');
      function refresh(){const a=target.profile?.assessment||{};card.querySelector('.review-overview').innerHTML=`<p>ระดับใช้งาน: ${esc(api.effective(target.profile)||'ยังไม่ทราบ')} · ${esc(api.status(target.profile))}</p><p>คำขอ: ${esc(a.request?.reason||'ยังไม่มีคำขอ')}<br>ผู้จัดตอบ: ${esc(a.request?.response||'ยังไม่มี')}</p>`+audit(a)}
      refresh();form.elements.assessor.value=session.name||session.username||'';form.elements.level.value=target.profile?.assessment?.confirmedLevel||'';
      form.elements.disputed.onchange=()=>{card.querySelector('.second-review').hidden=!form.elements.disputed.checked};
      form.onsubmit=e=>{e.preventDefault();const msg=card.querySelector('.review-message');try{
        const input={...Object.fromEntries(new FormData(form)),disputed:form.elements.disputed.checked,observations:[...form.querySelectorAll('.observation')].map(el=>el.value)};
        target=save(target.id,signature(target.profile?.assessment),(profile,actor)=>({assessment:api.review(profile.assessment||{},input,actor)}),true);refresh();
        msg.textContent=input.decision==='confirm'?'บันทึกผลยืนยันแล้ว':'บันทึกคำขอข้อมูลเพิ่มแล้ว ระดับเดิมยังคงอยู่';
      }catch(error){msg.textContent=error.message||'บันทึกไม่สำเร็จ'}};
    });return;
  }
  let user=users().find(u=>u.id===session.id);if(!user){current.textContent='ไม่พบบัญชี กรุณาเข้าสู่ระบบใหม่';return}
  document.querySelector('#member').hidden=false;
  const q=document.querySelector('#questions'), form=document.querySelector('#assessmentForm');
  q.innerHTML=api.questions.map((text,i)=>`<label>${i+1}. ${text}<small class="skill-anchor">${api.anchors[i]}</small><select required>${answers}</select></label>`).join('');
  [...q.querySelectorAll('select')].forEach((el,i)=>{el.value=user.profile?.assessment?.answers?.[i]||''});
  const level=document.querySelector('#selfLevel'), experience=document.querySelector('#experience');level.innerHTML=options;level.required=false;level.value=user.profile?.assessment?.selfLevel||'';experience.value=user.profile?.assessment?.experience||'';
  if(user.profile?.goal)document.querySelector('#goal').value=user.profile.goal;
  const describe=()=>{document.querySelector('#description').textContent=api.levels[level.value]?.description||'เลือกไม่แน่ใจได้ และให้ผู้จัดช่วยสังเกตก่อนจัดคู่'};level.onchange=describe;describe();
  function summary(){const s=api.summarize([...q.querySelectorAll('select')].map(el=>el.value));document.querySelector('#skillSummary').innerHTML='<h2>สรุปทักษะจากคำตอบของคุณ</h2>'+[['ทักษะที่ทำได้สม่ำเสมอ',s.strengths],['ทักษะที่ควรฝึกเพิ่ม',s.practice],['ทักษะที่ควรลองหรือให้ผู้จัดช่วยสังเกต',s.uncertain]].map(([title,items])=>`<h3>${title}</h3>${items.length?'<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>':'<p>ยังไม่มีรายการในกลุ่มนี้</p>'}`).join('')+'<p>ใช้ประกอบการเลือกระดับ ไม่ใช่ผลทดสอบทักษะมาตรฐาน</p>'}
  q.addEventListener('change',summary);summary();
  function refresh(){const a=user.profile?.assessment||{};current.textContent='ระดับที่ระบบใช้: '+(api.effective(user.profile)||'ยังไม่ทราบ')+' · '+api.status(user.profile);document.querySelector('#memberHistory').innerHTML=audit(a);document.querySelector('#requestStatus').textContent=a.request?'คำขอล่าสุด: '+a.request.reason+(a.request.response?' · ผู้จัดตอบ: '+a.request.response:''):'ยังไม่มีคำขอตรวจระดับ';document.querySelector('#requestForm button').disabled=api.pending(a);document.querySelector('#pendingHint').hidden=!api.pending(a)}
  refresh();
  form.onsubmit=e=>{e.preventDefault();const msg=document.querySelector('#feedback');try{user=save(user.id,signature(user.profile?.assessment),(profile,actor)=>({assessment:api.updateSelf(profile.assessment||{},{selfLevel:level.value,answers:[...q.querySelectorAll('select')].map(el=>el.value),experience:experience.value},actor),goal:document.querySelector('#goal').value}));refresh();msg.textContent=api.confirmed(user.profile)?'บันทึกคำตอบแล้ว ระดับที่ยืนยันยังคงเดิม หากต้องการเปลี่ยนให้ส่งคำขอทบทวนด้านล่าง':'บันทึกแล้ว รอผู้จัดตรวจระดับ เลือกไม่แน่ใจได้และยังลงทะเบียนบุฟเฟต์ได้'}catch(error){msg.textContent=error.message||'บันทึกไม่สำเร็จ'}};
  document.querySelector('#requestForm').onsubmit=e=>{e.preventDefault();const msg=document.querySelector('#requestMessage');try{user=save(user.id,signature(user.profile?.assessment),(profile,actor)=>({assessment:api.requestReview(profile.assessment||{},document.querySelector('#requestReason').value,actor)}));refresh();msg.textContent='ส่งคำขอแล้ว ระหว่างรอตรวจใช้ระดับเดิม'}catch(error){msg.textContent=error.message||'ส่งคำขอไม่สำเร็จ'}};
})();
