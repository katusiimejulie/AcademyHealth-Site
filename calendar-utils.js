(function(root){
  'use strict';
  const pad=n=>String(n).padStart(2,'0');
  function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;}
  function addDays(date,n){if(!validDate(date))throw new Error('Choose a valid date.');const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function escapeICS(text){return String(text??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function fold(line){let out='',current='',size=0;for(const ch of line){const n=new TextEncoder().encode(ch).length;if(size+n>75){out+=current+'\r\n';current=' ';size=1;}current+=ch;size+=n;}return out+current;}
  function ics(events){
    const now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AcademyHealth Student Chapter at VCU//Chapter Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:AcademyHealth at VCU','X-WR-TIMEZONE:America/New_York','BEGIN:VTIMEZONE','TZID:America/New_York','BEGIN:DAYLIGHT','TZOFFSETFROM:-0500','TZOFFSETTO:-0400','TZNAME:EDT','DTSTART:19700308T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','END:DAYLIGHT','BEGIN:STANDARD','TZOFFSETFROM:-0400','TZOFFSETTO:-0500','TZNAME:EST','DTSTART:19701101T020000','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','END:STANDARD','END:VTIMEZONE'];
    for(const e of events){
      if(!validDate(e.date)||!/^\d{2}:\d{2}$/.test(e.start)||!/^\d{2}:\d{2}$/.test(e.end)||e.end<=e.start)throw new Error('A calendar entry needs a valid date and start/end times.');
      const dt=(time)=>e.date.replaceAll('-','')+'T'+time.replace(':','')+'00';
      lines.push('BEGIN:VEVENT','UID:'+escapeICS(e.uid||e.id+'@academyhealth-vcu'),'DTSTAMP:'+now,'DTSTART;TZID=America/New_York:'+dt(e.start),'DTEND;TZID=America/New_York:'+dt(e.end),'SUMMARY:'+escapeICS(e.title),'DESCRIPTION:'+escapeICS(e.description||''),'LOCATION:'+escapeICS(e.location||''),'STATUS:CONFIRMED');
      if(e.url)lines.push('URL:'+escapeICS(e.url));
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
  }
  root.ChapterCalendar={validDate,addDays,escapeICS,ics,pad};
})(typeof window!=='undefined'?window:globalThis);
