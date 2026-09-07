(function (root) {
  'use strict';
  // Ordered descriptions, not a validated skill scale or national certification.
  const rows = [
    ['N','มือใหม่','เริ่มฝึกตีและเสิร์ฟ ยังเรียนรู้กติกาและตำแหน่งในสนาม'],
    ['S/BG','มือเริ่มต้น','ตีโต้ได้ เข้าใจกติกา แต่ลูกเคลียร์และการยืนตำแหน่งยังไม่สม่ำเสมอ'],
    ['P-','มือประคองเริ่มต้น','เริ่มเคลียร์ถึงหลังสนามและเข้าใจตำแหน่งรุก–รับ แต่ลูกตบและแบ็กแฮนด์ยังไม่แน่นอน'],
    ['P','มือประคอง','ใช้ลูกพื้นฐานและหมุนตำแหน่งคู่ได้ ตีต่อเนื่องได้แต่ยังเสียเอง'],
    ['P+','มือประคองสูง','รับลูกและวางทิศทางได้ดีขึ้น เคลื่อนที่และเปลี่ยนจากรับเป็นรุกได้'],
    ['C','มือแข่งขันเริ่มต้น','ควบคุมน้ำหนักและทิศทาง ใช้แผนการเล่นและรับมือเกมเข้มข้นได้'],
    ['C+','มือแข่งขันระดับกลาง','ปรับแผนได้รวดเร็ว เสียเองน้อย และมีประสบการณ์แข่งขันต่อเนื่อง'],
    ['B/B+','มือแข่งขันระดับสูง','มีประสบการณ์แข่งขันระดับมหาวิทยาลัยหรือจังหวัด ควรมีผู้ประเมินประกอบ'],
    ['A/Pro','มืออาชีพ','ระดับอาชีพหรือทีมชาติ ต้องตรวจประสบการณ์และหลักฐาน ไม่รับรองจากแบบสอบถาม']
  ];
  const levels = Object.fromEntries(rows.map(([code,name,description], index) => [code,{label:code+' — '+name,description,value:index+1}]));
  const questions = [
    'เสิร์ฟเข้าพื้นที่และนับคะแนนตามกติกาได้',
    'เคลียร์ลูกไปท้ายสนามได้สม่ำเสมอ',
    'ใช้ลูกหยอด ตบ และไดรฟ์ตามสถานการณ์ได้',
    'หมุนตำแหน่งรุก–รับกับคู่เล่นได้',
    'รับลูกเร็วและกลับสู่ตำแหน่งพร้อมเล่นได้',
    'ควบคุมทิศทางและปรับแผนระหว่างเกมได้'
  ];
  const valid = code => Object.hasOwn(levels,code);
  const anchors = [
    'พิจารณาจากเกมล่าสุด: เสิร์ฟถูกช่อง ไม่เสียกติกาบ่อย และนับคะแนนได้เอง',
    'พิจารณาว่าลูกไปถึงบริเวณท้ายคอร์ตซ้ำได้หรือไม่ ไม่ใช้เพียงครั้งที่ตีได้ไกลที่สุด',
    'พิจารณาการเลือกใช้ลูกหยอด ตบ และไดรฟ์ในเกม แยกจากการตีตามแบบฝึก',
    'พิจารณาการยืนหน้า–หลังเมื่อบุก และซ้าย–ขวาเมื่อตั้งรับ โดยไม่แย่งลูกกับคู่',
    'พิจารณาการเข้าถึงลูก การทรงตัว และกลับมาพร้อมรับลูกถัดไป',
    'พิจารณาการวางลูกไปยังพื้นที่ที่ตั้งใจและเปลี่ยนวิธีเล่นเมื่อคู่แข่งรับทางเดิมได้'
  ];
  function summarize(answers) {
    return {
      strengths: questions.filter((_, i) => answers[i] === 'ทำได้สม่ำเสมอ'),
      practice: questions.filter((_, i) => ['ยังทำไม่ได้','ทำได้บางครั้ง'].includes(answers[i])),
      uncertain: questions.filter((_, i) => !answers[i] || answers[i] === 'ไม่แน่ใจ')
    };
  }
  const effective = profile => {
    const assessment=profile?.assessment;
    if (!assessment || assessment.version!==2) return '';
    return valid(assessment.confirmedLevel) ? assessment.confirmedLevel : valid(assessment.selfLevel) ? assessment.selfLevel : '';
  };
  const confirmed = profile => profile?.assessment?.version===2 && valid(profile.assessment.confirmedLevel) ? profile.assessment.confirmedLevel : '';
  const pending = assessment => ['pending','needs-evidence'].includes(assessment?.request?.status);
  const status = profile => {
    const a=profile?.assessment;
    if(confirmed(profile))return pending(a)?'ผู้จัดยืนยันแล้ว • รอทบทวน (ใช้ระดับเดิม)':'ผู้จัดยืนยันแล้ว';
    if(pending(a))return a.request.status==='needs-evidence'?'รอข้อมูลหรือการสังเกตเพิ่มเติม':'รอผู้จัดตรวจระดับ';
    return effective(profile)?'ประเมินตนเอง • ยังไม่ยืนยัน':'ยังไม่ทราบระดับ';
  };
  const answerOptions=['ยังทำไม่ได้','ทำได้บางครั้ง','ทำได้สม่ำเสมอ','ไม่แน่ใจ'];
  const minObservedGames=2; // Proposed prototype workflow, not a validated assessment threshold.
  function event(assessment,type,actor,details,now){return [...(assessment.events||[]),{type,actor,at:now,...details}];}
  function updateSelf(previous={},input,actor,now=new Date().toISOString()){
    if(input.selfLevel && !valid(input.selfLevel))throw Error('เลือกระดับจากรายการหรือเลือกยังไม่แน่ใจ');
    if(!Array.isArray(input.answers)||input.answers.length!==questions.length||input.answers.some(a=>!answerOptions.includes(a)))throw Error('ตอบคำถามทักษะให้ครบทั้ง 6 ด้าน');
    const next={...previous,version:2,selfLevel:input.selfLevel,answers:input.answers,experience:String(input.experience||'').trim(),updatedAt:now};
    next.events=event(previous,'self-update',actor,{selfLevel:next.selfLevel,answers:next.answers,experience:next.experience},now);
    if(!valid(next.confirmedLevel)&&!next.request)next.request={id:now,kind:'initial',status:'pending',reason:'ประเมินครั้งแรก',createdAt:now};
    return next;
  }
  function requestReview(previous={},reason,actor,now=new Date().toISOString()){
    if(pending(previous))throw Error('มีคำขอรอตรวจอยู่แล้ว สามารถอัปเดตคำตอบและประสบการณ์เพิ่มเติมได้');
    if(!String(reason||'').trim())throw Error('ระบุเหตุผลที่ต้องการตรวจหรือทบทวนระดับ');
    return {...previous,version:2,request:{id:now,kind:valid(previous.confirmedLevel)?'reassessment':'initial',status:'pending',reason:reason.trim(),createdAt:now},events:event(previous,'review-request',actor,{reason:reason.trim()},now)};
  }
  function review(previous={},input,actor,now=new Date().toISOString()){
    if(!input.reason?.trim()||!input.assessor?.trim())throw Error('ระบุชื่อผู้ประเมินและเหตุผล');
    const decision=input.decision;
    if(!['confirm','defer'].includes(decision))throw Error('เลือกผลการตรวจ');
    if(decision==='confirm'){
      if(!valid(input.level))throw Error('เลือกระดับที่ยืนยัน');
      if(!input.qualification?.trim())throw Error('ระบุบทบาทหรือประสบการณ์ของผู้ประเมิน');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(input.observedDate||'')||!Number.isFinite(Date.parse(input.observedDate))||input.observedDate>now.slice(0,10))throw Error('ระบุวันที่สังเกตการเล่นที่ไม่ใช่วันในอนาคต');
      if(!Number.isInteger(Number(input.games))||Number(input.games)<minObservedGames)throw Error('บันทึกการสังเกตอย่างน้อย 2 เกมตามกติกาทดลองของต้นแบบ');
      if(!Array.isArray(input.observations)||input.observations.length!==questions.length||input.observations.some(a=>!answerOptions.includes(a)||a==='ไม่แน่ใจ'))throw Error('สังเกตทักษะให้ครบ หากยังไม่แน่ใจให้เลือกขอข้อมูลเพิ่ม');
      if(['B/B+','A/Pro'].includes(input.level)&&!input.evidence?.trim())throw Error('ระดับสูงต้องระบุข้อมูลการแข่งขันหรือหลักฐานการเล่นประกอบ');
      if(input.disputed&&(!input.secondAssessor?.trim()||input.secondAssessor.trim()===input.assessor.trim()||input.secondLevel!==input.level))throw Error('กรณีเห็นต่างต้องมีผู้ประเมินอีกคนและผลตรงกัน มิฉะนั้นให้ขอข้อมูลเพิ่ม');
    }
    const entry={decision,level:input.level||'',reason:input.reason.trim(),assessor:input.assessor.trim(),qualification:input.qualification||'',observedDate:input.observedDate||'',games:Number(input.games)||0,observations:input.observations||[],evidence:input.evidence||'',disputed:!!input.disputed,secondAssessor:input.secondAssessor||'',secondLevel:input.secondLevel||'',previousLevel:previous.confirmedLevel||'',requestId:previous.request?.id||''};
    const next={...previous,version:2,request:{...(previous.request||{id:now,kind:'organizer',createdAt:now}),status:decision==='confirm'?'resolved':'needs-evidence',response:entry.reason,respondedAt:now},events:event(previous,'organizer-review',actor,entry,now)};
    if(decision==='confirm')Object.assign(next,{confirmedLevel:input.level,assessor:entry.assessor,reason:entry.reason,reviewedBy:actor,reviewedAt:now,reviewEvidence:entry});
    return next;
  }
  root.SmashLevels={levels,questions,anchors,summarize,valid,effective,confirmed,pending,status,answerOptions,minObservedGames,updateSelf,requestReview,review,version:2};
  if(typeof module!=='undefined') module.exports=root.SmashLevels;
})(typeof window==='undefined'?globalThis:window);
