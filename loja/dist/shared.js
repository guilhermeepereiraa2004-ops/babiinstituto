export const wa='https://wa.me/5573981701666';
const integrated=new URL(import.meta.url).pathname.startsWith('/loja/');
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const norm=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
export const price=cents=>Number.isSafeInteger(cents)?brl.format(cents/100):'A combinar';
export const moneyInput=cents=>Number.isSafeInteger(cents)?(cents/100).toFixed(2).replace('.',','):'';
export function cents(value,optional=false){
  const text=String(value).trim();
  if(optional&&!text)return null;
  if(!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(text))throw Error('Informe um valor como 149,00.');
  const [int,fraction='']=text.split(/[.,]/);
  return Number(int)*100+Number(fraction.padEnd(2,'0'));
}
export const statusLabels={novo:'Novo',confirmado:'Confirmado',concluido:'Concluído',cancelado:'Cancelado',pendente:'Pendente',recebido:'Recebido',estornado:'Estornado'};
export const paymentLabels={pix:'Pix',dinheiro:'Dinheiro',cartao:'Cartão',transferencia:'Transferência',outro:'Outro',cortesia:'Cortesia'};
export const stamp=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Bahia'}).format(new Date(value));
export const localDay=value=>new Intl.DateTimeFormat('en-CA',{dateStyle:'short',timeZone:'America/Bahia'}).format(new Date(value));
export async function api(path,method='GET',body){
  if(integrated&&path.startsWith('/api/'))path='/api/shop/'+path.slice(5);
  let response;
  try{response=await fetch(path,{method,cache:'no-store',...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});}
  catch{throw Error('Sem conexão com a loja. Tente novamente.');}
  const result=await response.json().catch(()=>({error:'Não foi possível concluir.'}));
  if(!response.ok)throw Object.assign(Error(result.error||'Não foi possível concluir.'),{status:response.status});
  return result;
}
export function notice(message){
  const el=document.getElementById('toast');
  el.textContent=message;el.classList.add('show');
  clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove('show'),4200);
}
