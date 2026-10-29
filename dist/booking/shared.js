export const icons={
 wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8h18m-5 4h5v5h-5zM6 5V3h12"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',up:'<path d="M6 18 18 6M6 6h12v12"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-11 4h1m4 0h1m-6 3h1"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',check:'<path d="m5 12 4 4L19 6"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',chevron:'<path d="m9 5 7 7-7 7"/>',
 flower:'<path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z"/>',
 shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',
 logout:'<path d="M9 4H4v16h5m5-13 5 5-5 5m-7-5h12"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2"/>'
};
export const icon=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.flower}</svg>`;
export const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export async function api(path,options={}){let response;try{response=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});}catch{throw Error('Não foi possível conectar. Confira sua conexão e tente novamente.');}let data;try{data=await response.json();}catch{throw Error('O serviço não respondeu como esperado. Tente novamente.');}if(!response.ok)throw Object.assign(Error(data.error||'Não foi possível concluir.'),{status:response.status});return data;}
export const dateLabel=(date,options={day:'numeric',month:'long'})=>new Date(date+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC',...options});
export const minuteLabel=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
export const durationLabel=value=>value>=60?`${Math.floor(value/60)}h${value%60?` ${value%60}min`:''}`:`${value}min`;
export function addDays(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
export const statusLabel={confirmed:'Confirmado',completed:'Concluído',cancelled:'Cancelado'};
export const moneyLabel=cents=>cents===null?'Valor a informar':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const paymentLabels={pix:'Pix',cash:'Dinheiro',credit:'Cartão de crédito',debit:'Cartão de débito',transfer:'Transferência',other:'Outro',unrecorded:'Não informado'};
export function moneyCents(text){const value=String(text).trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(value))return NaN;const [whole,fraction='']=value.replace(',','.').split('.');const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));return Number.isSafeInteger(cents)?cents:NaN;}
export const brand='<a class="booking-brand" href="/" aria-label="Babi Instituto de Beleza — início"><strong>babi<span>.</span></strong><small>INSTITUTO DE BELEZA</small></a>';
export function notify(message,error=false){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';el.setAttribute('role','status');document.body.append(el);}el.textContent=message;el.classList.toggle('error',error);el.classList.add('show');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove('show'),5500);}
