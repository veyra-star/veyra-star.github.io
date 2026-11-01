const key='veyra-suno-stats-v1';
const fallback=[{date:'2026-10-31',followers:171,plays:'3.1K',likes:500,songs:23}];
let localRecords=[];
try { const saved=JSON.parse(localStorage.getItem(key)); if(Array.isArray(saved)) localRecords=saved; } catch {}
let sharedRecords=fallback, records=[];
const dateFormat=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const shortDate=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',timeZone:'UTC'});
const dateOf=s=>new Date(s+'T12:00:00Z');
function numeric(value){
  if(typeof value==='number') return Number.isFinite(value)?value:null;
  const match=String(value).trim().replace(',','.').match(/^(\d+(?:\.\d+)?)\s*([kKmM])?$/);
  if(!match)return null;
  return Number(match[1])*(match[2]?.toLowerCase()==='k'?1000:match[2]?.toLowerCase()==='m'?1000000:1);
}
const svgNS='http://www.w3.org/2000/svg';
function element(name,attributes,content){const e=document.createElementNS(svgNS,name);for(const [k,v] of Object.entries(attributes))e.setAttribute(k,v);if(content!==undefined)e.textContent=content;return e;}
function chart(){
 const metric=document.getElementById('metric').value, svg=document.getElementById('chart'), status=document.getElementById('chart-status');
 const points=[...records].reverse().map(r=>({date:r.date,raw:r[metric],value:numeric(r[metric])})).filter(r=>r.value!==null);
 svg.replaceChildren();svg.setAttribute('aria-label','Grafico '+document.getElementById('metric').selectedOptions[0].textContent);
 if(!points.length){status.textContent='Nessun dato disponibile per questo grafico.';return}
 const vals=points.map(p=>p.value), lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max((hi-lo)*.18,hi*.03,1),min=Math.max(0,lo-pad),max=hi+pad;
 for(let i=0;i<3;i++){const y=20+i*88,v=max-(max-min)*i/2;svg.append(element('line',{x1:58,y1:y,x2:700,y2:y,class:'chart-grid'}),element('text',{x:48,y:y+4,'text-anchor':'end',class:'chart-axis'},Math.round(v).toLocaleString('it-IT')))}
 const coords=points.map((p,i)=>({x:points.length===1?379:58+i*642/(points.length-1),y:196-(p.value-min)/(max-min)*176,...p}));
 if(coords.length>1)svg.append(element('polyline',{points:coords.map(p=>p.x+','+p.y).join(' '),class:'chart-line'}));
 coords.forEach((p,i)=>{const dot=element('circle',{cx:p.x,cy:p.y,r:6,class:'chart-point'});dot.append(element('title',{},shortDate.format(dateOf(p.date))+': '+p.raw));svg.append(dot);if(coords.length<=6||i===0||i===coords.length-1)svg.append(element('text',{x:p.x,y:230,'text-anchor':'middle',class:'chart-axis'},shortDate.format(dateOf(p.date))))});
 const approximate=metric==='plays'&&points.some(p=>/[kKmM]/.test(String(p.raw)));
 status.textContent=(points.length===1?'Per mostrare la crescita serve almeno un’altra rilevazione.':'Ogni punto rappresenta una rilevazione salvata.')+(approximate?' Gli ascolti indicati con K o M sono arrotondati da Suno.':'');
}
function render(){
 const merged=new Map();for(const r of sharedRecords)merged.set(r.date,r);for(const r of localRecords)merged.set(r.date,r);records=[...merged.values()].filter(r=>r&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)).sort((a,b)=>b.date.localeCompare(a.date));
 if(!records.length)return;
 const latest=records[0];for(const id of ['followers','plays','likes','songs']) document.getElementById(id).textContent=latest[id]??'—';
 document.getElementById('updated').textContent='Ultima rilevazione: '+dateFormat.format(dateOf(latest.date));
 const body=document.getElementById('rows');body.replaceChildren();for(const record of records){const row=document.createElement('tr');for(const value of [dateFormat.format(dateOf(record.date)),record.followers,record.plays,record.likes,record.songs]){const cell=document.createElement('td');cell.textContent=value??'—';row.append(cell)}body.append(row)}chart();
}
const form=document.getElementById('edit'),toggle=document.getElementById('toggle');
toggle.addEventListener('click',()=>{form.hidden=!form.hidden;toggle.setAttribute('aria-expanded',String(!form.hidden));});
const today=new Date();form.elements.date.value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const plays=String(data.get('plays')).trim();if(numeric(plays)===null){form.elements.plays.setCustomValidity('Inserisci un numero, per esempio 3200 o 3.2K.');form.elements.plays.reportValidity();return}const date=String(data.get('date'));const record={date,followers:Number(data.get('followers')),plays,likes:Number(data.get('likes')),songs:Number(data.get('songs'))};const next=localRecords.filter(item=>item.date!==date);next.push(record);try{localStorage.setItem(key,JSON.stringify(next));localRecords=next}catch{alert('Non riesco a salvare i dati in questo browser.');return}form.hidden=true;toggle.setAttribute('aria-expanded','false');render();});
form.elements.plays.addEventListener('input',()=>form.elements.plays.setCustomValidity(''));
document.getElementById('metric').addEventListener('change',chart);
render();fetch('./data/suno-stats.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('unavailable');return r.json()}).then(data=>{if(Array.isArray(data)&&data.length){sharedRecords=data;render()}}).catch(()=>{});
