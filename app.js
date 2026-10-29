(function(){
  'use strict';
  const C=window.CHAPTER,U=window.ChapterCalendar,$=s=>document.querySelector(s);
  const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateText=d=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
  const timeText=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+(m?':'+U.pad(m):'')+' '+(h>=12?'p.m.':'a.m.');};
  function download(name,body,type){const b=new Blob([body],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function feedback(id,text,error=false){const el=$(id);if(el){el.textContent=text;el.className='feedback '+(error?'error':'success');}}
  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  const menu=$('.menu-toggle');if(menu)menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#navlinks').classList.toggle('open',open);});
  if($('#event-list')){
    $('#event-list').innerHTML=C.events.map(ev=>`<article class="event-card ${ev.id==='mixer'?'featured':''}" id="${ev.id}" data-type="${ev.type}"><div><span class="status ${ev.status==='Confirmed'?'':'proposed'}">${e(ev.status)}</span><h2>${e(ev.title)}</h2><p class="event-date">${ev.date?dateText(ev.date):'Date to be announced'}${ev.start?'<br>'+timeText(ev.start)+'–'+timeText(ev.end)+' Eastern':''}<br>${e(ev.location)}</p><p class="detail">${e(ev.description)}</p><div class="actions">${ev.id==='writing'?'<a class="button" href="writing.html">Writing-group details</a>':`<a class="button" href="forms.html?form=interest&event=${ev.id}#interest">${ev.id==='mixer'?'Contact / express interest':'Express interest'}</a>`}${ev.calendar?`<a href="${ev.calendar}" download>Add to calendar</a>`:''}${ev.pdf?`<a href="${ev.pdf}">Print guide / flyer</a>`:''}</div>${ev.id==='mixer'?'<p class="small">Open to all. No formal RSVP requirement is stated in the chapter flyer. Contact officers with access or event questions.</p>':''}</div>${ev.id==='mixer'?'<img src="chapter-networking.webp" alt="Illustration of a campus networking gathering.">':''}</article>`).join('');
    document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));document.querySelectorAll('.event-card').forEach(card=>{card.hidden=!(filter==='all'||card.dataset.type===filter||(filter==='Research'&&!['Social','Writing'].includes(card.dataset.type)));});}));
  }
  const docs=[
    ['mixer-flyer.pdf','Welcome mixer flyer','One-page flyer with the confirmed October 29 event details.','qr-mixer.svg'],
    ['writing-group-guide.pdf','Writing-group guide','Session structure, opening and closing updates, and how to take part.','qr-writing.svg'],
    ['writing-check-in.pdf','Writing progress check-in','Fillable PDF for opening, closing, or asynchronous updates.','qr-progress.svg'],
    ['weekly-writing-planner.pdf','Weekly writing planner','A fillable planning sheet for dates, goals, progress, and next steps.','qr-calendar.svg'],
    ['event-interest-feedback.pdf','Event interest & feedback','A fillable form to express interest, request an invitation, or give feedback.','qr-forms.svg'],
    ['chapter-event-guide.pdf','Chapter event guide','A take-home overview of confirmed and proposed activities.','qr-events.svg'],
    ['mixer-host-checklist.pdf','Mixer host checklist','Practical officer checklist for setup, refreshments, access, printouts, and follow-up.','qr-resources.svg']
  ];
  if($('#document-list'))$('#document-list').innerHTML=docs.map(([file,title,desc,qr])=>`<article class="document"><img class="qr" src="${qr}" alt="QR code for the relevant website page"><div><h2>${title}</h2><p>${desc}</p><a class="button secondary" href="${file}" download>Download PDF</a></div></article>`).join('');
  if($('#hosting-notice')&&/^https:$/.test(location.protocol)&&location.href.startsWith(C.baseUrl))$('#hosting-notice').hidden=true;
  if($('#calendar-grid')){
    let blocks=load('ah-writing-blocks-v1',[]).filter(b=>U.validDate(b.date)&&typeof b.goal==='string');
    const initial=new Date();let year=initial.getFullYear(),month=initial.getMonth();
    function renderCalendar(){
      $('#calendar-title').textContent=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1)));
      const offset=new Date(Date.UTC(year,month,1)).getUTCDay(),days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
      let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="weekday">${d}</div>`).join('');
      for(let i=0;i<offset;i++)html+='<div class="day empty" aria-hidden="true"></div>';
      for(let day=1;day<=days;day++){
        const date=`${year}-${U.pad(month+1)}-${U.pad(day)}`;
        const events=C.events.filter(ev=>ev.date===date);
        const personal=blocks.filter(b=>b.date===date);
        html+=`<div class="day ${date===new Date().toLocaleDateString('en-CA')?'today':''}" aria-label="${dateText(date)}"><span class="day-number">${day}</span>${events.map(ev=>`<a class="cal-event ${ev.status==='Confirmed'?'':'proposed'}" href="${ev.url}">${ev.status==='Confirmed'?'':'Proposed: '}${e(ev.title)}${ev.start?'<br>'+timeText(ev.start):''}</a>`).join('')}${personal.map(b=>`<a class="cal-event personal" href="#planner">My writing · 11 a.m.<br>${e(b.goal)}</a>`).join('')}</div>`;
      }
      const end=(offset+days)%7;for(let i=end;i>0&&i<7;i++)html+='<div class="day empty" aria-hidden="true"></div>';
      $('#calendar-grid').innerHTML=html;
      $('#block-list').innerHTML=blocks.length?blocks.map(b=>`<li><span><strong>${dateText(b.date)}</strong><br>11 a.m.–2 p.m. Eastern<br>${e(b.goal)}</span><button type="button" data-remove="${e(b.id)}" aria-label="Remove writing block on ${dateText(b.date)}">Remove</button></li>`).join(''):'<li>No personal writing blocks yet. Choose a date and a specific goal.</li>';
      $('#block-list').querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{blocks=blocks.filter(b=>b.id!==btn.dataset.remove);save('ah-writing-blocks-v1',blocks);renderCalendar();}));
    }
    $('#previous-month').addEventListener('click',()=>{month--;if(month<0){month=11;year--;}renderCalendar();});
    $('#next-month').addEventListener('click',()=>{month++;if(month>11){month=0;year++;}renderCalendar();});
    $('#planner-form').addEventListener('submit',event=>{
      event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
      const data=new FormData(form),date=String(data.get('date')),goal=String(data.get('goal')).trim(),count=Number(data.get('repeat'));
      if(!U.validDate(date)||!goal||![1,4,8,12].includes(count)){feedback('#planner-feedback','Choose a valid date and enter a goal.',true);return;}
      for(let i=0;i<count;i++){const d=U.addDays(date,7*i);if(!blocks.some(b=>b.date===d&&b.goal===goal))blocks.push({id:crypto.randomUUID(),date:d,goal});}
      blocks.sort((a,b)=>a.date.localeCompare(b.date));const persisted=save('ah-writing-blocks-v1',blocks);year=Number(date.slice(0,4));month=Number(date.slice(5,7))-1;renderCalendar();feedback('#planner-feedback',persisted?'Added to this device’s planner. Download the calendar to add these blocks to your calendar app.':'Added for this visit. This browser cannot save entries; download your calendar before leaving.');
    });
    $('#download-blocks').addEventListener('click',()=>{if(!blocks.length){feedback('#planner-feedback','Add a writing block before downloading.',true);return;}download('my-writing-blocks.ics',U.ics(blocks.map(b=>({id:b.id,uid:b.id+'@academyhealth-vcu',title:'Personal writing: '+b.goal,date:b.date,start:'11:00',end:'14:00',location:'Independent work; chapter Zoom invitation shared separately',description:'Personal writing plan. This does not confirm a chapter meeting. Goal: '+b.goal,url:C.baseUrl+'writing.html'}))),'text/calendar;charset=utf-8');feedback('#planner-feedback','Calendar downloaded. Import it into your calendar app; all blocks use Eastern time.');});
    $('#print-planner').addEventListener('click',()=>window.print());renderCalendar();
  }
  if($('#forms-container')){
    const common='<div><label for="{k}-name">Name</label><input id="{k}-name" name="Name" maxlength="100" required autocomplete="name"></div><div><label for="{k}-email">Email</label><input id="{k}-email" name="Email" type="email" maxlength="150" required autocomplete="email"></div>';
    const options=C.events.map(ev=>`<option value="${ev.id}">${e(ev.title)}</option>`).join('');
    const eventField=k=>`<div class="full"><label for="${k}-event">Event</label><select id="${k}-event" name="Event">${options}</select></div>`;
    const area=(k,id,label,required=false)=>`<div class="full"><label for="${k}-${id}">${label}</label><textarea id="${k}-${id}" name="${e(label)}" maxlength="1800" ${required?'required':''}></textarea></div>`;
    const definitions={interest:{title:'Interest & invitation request',fields:eventField('interest')+area('interest','message','Message or invitation request',true)},progress:{title:'Writing progress check-in',fields:'<div><label for="progress-kind">Update type</label><select id="progress-kind" name="Update type"><option>Opening update</option><option>Closing update</option><option>Asynchronous update</option></select></div><div><label for="progress-date">Session / update date</label><input id="progress-date" name="Date" type="date" required></div><div class="full"><label for="progress-project">Project or work type</label><input id="progress-project" name="Project" maxlength="150" required placeholder="Analysis, dissertation, manuscript, or another project"></div>'+area('progress','previous','Previous work and output',true)+area('progress','conclusions','Findings or conclusions',true)+area('progress','goal','Goal / progress this session',true)+area('progress','blockers','Blockers or feedback requested')+area('progress','next','Next step',true)},feedback:{title:'Event feedback',fields:eventField('feedback')+area('feedback','useful','What was useful?',true)+area('feedback','improve','What should we improve?')+area('feedback','next','What would you like next?')},topic:{title:'Suggest a topic or story',fields:area('topic','idea','Topic or story idea',true)+area('topic','purpose','Why would this help the chapter?',true)+area('topic','partner','Possible speaker or collaborator')}};
    $('#forms-container').innerHTML=Object.entries(definitions).map(([k,d])=>`<section class="form-pane panel" id="${k}" role="tabpanel" aria-labelledby="tab-${k}" ${k==='interest'?'':'hidden'}><h2>${d.title}</h2><form data-chapter-form="${k}"><div class="form-grid">${common.replaceAll('{k}',k)}${d.fields}<div class="full"><label class="check"><input type="checkbox" name="Sharing acknowledgment" value="I reviewed my response for confidential information" required><span>I reviewed this response and removed confidential research details. I will review the email before sending it.</span></label></div></div><div class="actions"><button type="submit" class="primary">Prepare email</button><button type="button" class="secondary" data-export="${k}">Download my response</button><button type="button" class="secondary" data-print="${k}">Print this form</button></div><p class="feedback" id="${k}-feedback" role="status"></p><a hidden id="${k}-email-link" class="button secondary">Open email draft</a></form></section>`).join('');
    function activate(k){if(!definitions[k])k='interest';document.querySelectorAll('.form-pane').forEach(p=>p.hidden=p.id!==k);document.querySelectorAll('[data-form]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.form===k));b.tabIndex=b.dataset.form===k?0:-1;});}
    document.querySelectorAll('[data-form]').forEach(b=>{b.addEventListener('click',()=>{activate(b.dataset.form);const nextUrl=new URL(location.href);nextUrl.searchParams.set('form',b.dataset.form);nextUrl.hash=b.dataset.form;history.replaceState(null,'',nextUrl);});b.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-form]')];let i=tabs.indexOf(b);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].click();tabs[i].focus();});});
    const params=new URLSearchParams(location.search);activate(params.get('form')||location.hash.slice(1));
    if(params.get('event')&&C.events.some(ev=>ev.id===params.get('event')))$('#interest-event').value=params.get('event');
    $('#progress-date').value=new Date().toLocaleDateString('en-CA');
    function response(form,k){const vals=[...new FormData(form)].map(([key,val])=>{if(key==='Event')val=C.events.find(ev=>ev.id===val)?.title||val;return key+':\n'+val;});return 'AcademyHealth at VCU - '+definitions[k].title+'\n\n'+vals.join('\n\n')+'\n\nWebsite: '+C.baseUrl;}
    document.querySelectorAll('[data-chapter-form]').forEach(form=>{const k=form.dataset.chapterForm;form.addEventListener('submit',ev=>{ev.preventDefault();if(!form.reportValidity())return;const body=response(form,k);const link=$('#'+k+'-email-link');link.href='mailto:'+C.contact+'?subject='+encodeURIComponent('AcademyHealth: '+definitions[k].title)+'&body='+encodeURIComponent(body);link.hidden=false;feedback('#'+k+'-feedback','Draft ready. Use “Open email draft” to review and send it. Nothing has been submitted. For a long response, download the file and attach it to an email.');link.focus();});form.querySelector('[data-export]').addEventListener('click',()=>{if(!form.reportValidity())return;download('academyhealth-'+k+'.txt',response(form,k),'text/plain;charset=utf-8');feedback('#'+k+'-feedback','Response downloaded. Email or bring it to the organizer if you want to share it.');});form.querySelector('[data-print]').addEventListener('click',()=>window.print());});
  }
  function postMarkup(post){return `<p class="eyebrow">${e(post.category)}</p><h2>${e(post.title)}</h2><p class="post-meta">${e(post.author)} · ${U.validDate(post.date)?dateText(post.date):'Date to be confirmed'}</p>${post.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}`;}
  if($('#blog-posts'))$('#blog-posts').innerHTML=[...C.posts].sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<article class="post" id="${e(p.slug)}">${postMarkup(p)}</article>`).join('');
  if($('#blog-editor')){
    const form=$('#blog-editor'),stored=load('ah-blog-draft-v1',null);$('#post-date').value=new Date().toLocaleDateString('en-CA');
    if(stored)for(const [key,value]of Object.entries(stored)){const field=form.elements.namedItem(key);if(field)field.value=value;}
    const get=()=>Object.fromEntries(new FormData(form));
    const post=()=>{const d=get();return {slug:(d.title||'new-post').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),title:d.title,author:d.author,date:d.date,category:d.category,summary:d.summary,paragraphs:d.body.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)};};
    function preview(){const p=post();$('#post-preview').innerHTML=p.title?postMarkup(p):'<p>Your draft will appear here.</p>';}
    form.addEventListener('input',preview);preview();
    $('#save-draft').addEventListener('click',()=>feedback('#editor-feedback',save('ah-blog-draft-v1',get())?'Draft saved on this device. It is not published.':'This browser cannot store the draft. Export it instead.',false));
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const p=post();download(p.slug+'.json',JSON.stringify(p,null,2),'application/json');feedback('#editor-feedback','Post exported. Give this file to the website maintainer to publish it.');});
    $('#clear-draft').addEventListener('click',()=>{localStorage.removeItem('ah-blog-draft-v1');form.reset();$('#post-date').value=new Date().toLocaleDateString('en-CA');preview();feedback('#editor-feedback','Saved draft cleared from this device.');});
  }
})();
