import {api,escapeHtml as e,norm,notice,price,statusLabels,wa} from './shared.js';

const $=id=>document.getElementById(id);
const dialog=$('shop-dialog');
let products=[],category='',cart=new Map(),pending=null,submitting=false,checkoutError='';
try{
  for(const [id,quantity] of JSON.parse(localStorage.getItem('babi-shop-cart')||'[]')){
    if(typeof id==='string'&&Number.isSafeInteger(quantity)&&quantity>0&&quantity<=99)cart.set(id,quantity);
  }
}catch{}
const lookup=id=>products.find(p=>p.id===id);
const qtyText=n=>n===1?'1 unidade':n+' unidades';
function saveCart(){
  try{localStorage.setItem('babi-shop-cart',JSON.stringify([...cart]));}catch{}
  const count=[...cart.values()].reduce((a,b)=>a+b,0);
  document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count);
  $('floating-bag').setAttribute('aria-label','Abrir sacola, '+count+(count===1?' item':' itens'));
}
function renderFilters(){
  const cats=[...new Set(products.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(category&&!cats.includes(category))category='';
  $('filters').innerHTML=['',...cats].map(c=>`<button type="button" class="filter" data-category="${e(c)}" aria-pressed="${category===c}">${e(c||'Todos')}</button>`).join('');
}
function renderProducts(){
  const query=norm($('search').value).trim();
  const shown=products.filter(p=>(!category||p.category===category)&&norm([p.name,p.description,p.category].join(' ')).includes(query));
  $('results').textContent=shown.length===1?'1 produto':shown.length+' produtos';
  $('products').innerHTML=shown.length?shown.map(p=>`<article class="product">
    <button type="button" class="product-image" data-detail="${e(p.id)}" aria-label="Ver detalhes de ${e(p.name)}"><img src="${e(p.photo)}" alt="" loading="lazy" width="360" height="480"><span class="photo-expand" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span><span class="photo-caption" aria-hidden="true">Conheça o produto <span>↗</span></span></button>
    <div class="product-copy"><p class="product-category">${e(p.category)}</p><h3><button type="button" class="product-name" data-detail="${e(p.id)}">${e(p.name)}</button></h3>
      <div class="product-meta"><div class="product-price"><span>Valor do produto</span><strong>${price(p.priceCents)}</strong></div><span class="product-stock">${qtyText(p.stock)} em estoque</span></div>
      <button type="button" class="button add" data-add="${e(p.id)}" aria-label="Adicionar ${e(p.name)} à sacola">Adicionar à sacola <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z M8 9V6a4 4 0 0 1 8 0v3"/></svg></button>
    </div></article>`).join(''):`<div class="empty"><strong>Nenhum produto encontrado.</strong><p>${query||category?'Tente outra busca ou categoria.':'Confira novamente em outro momento.'}</p></div>`;
}
async function refresh(){
  products=await api('/api/catalog');
  const featured=products.find(p=>p.category==='Cronograma Capilar')||products[0];
  const hero=$('hero-product');hero.hidden=!featured;
  if(featured){hero.src=featured.photo;hero.alt=featured.name;}
  else hero.removeAttribute('src');
  for(const [id,q] of cart){
    const p=lookup(id);
    if(!p)cart.delete(id);else if(q>p.stock)cart.set(id,p.stock);
  }
  saveCart();renderFilters();renderProducts();
}
function add(id){
  const p=lookup(id);
  if(!p)return;
  const n=(cart.get(id)||0)+1;
  if(n>p.stock||n>99){notice('Você já adicionou todas as unidades disponíveis deste produto.');return;}
  if(!cart.has(id)&&cart.size>=50){notice('A sacola aceita até 50 produtos diferentes.');return;}
  cart.set(id,n);pending=null;saveCart();notice('Produto adicionado à sacola.');
}
const closeButton='<button type="button" class="close" data-close aria-label="Fechar janela">×</button>';
function open(content,kind=''){
  dialog.className=kind;dialog.innerHTML=content;
  if(!dialog.open)dialog.showModal();
}
function details(id){
  const p=lookup(id);if(!p)return;
  open(`<div class="dialog-head"><p class="eyebrow">DETALHES DO PRODUTO</p>${closeButton}</div>
    <div class="detail-layout"><div class="detail-images"><img src="${e(p.photo)}" alt="${e(p.name)}">${p.alternatePhoto?`<img src="${e(p.alternatePhoto)}" alt="Outra foto de ${e(p.name)}">`:''}</div>
    <div class="detail-copy"><p class="product-category">${e(p.category)}</p><h2 id="dialog-title">${e(p.name)}</h2>
    ${p.description?`<p>${e(p.description)}</p>`:''}<strong class="detail-price">${price(p.priceCents)}</strong>
    <p>${qtyText(p.stock)} em estoque</p><button type="button" class="button" data-add="${e(id)}">Adicionar à sacola +</button><button type="button" class="text-link" data-bag>Ver sacola</button></div></div>`,'detail-dialog');
}
function bag(){
  const items=[...cart].map(([id,quantity])=>({p:lookup(id),quantity})).filter(i=>i.p);
  const unknown=items.some(({p})=>p.priceCents===null),known=items.reduce((sum,{p,quantity})=>sum+(p.priceCents??0)*quantity,0);
  open(`<div class="dialog-head"><div><p class="eyebrow">SEU PEDIDO</p><h2 id="dialog-title">Sua sacola.</h2></div>${closeButton}</div>
    ${items.length?`<div class="bag-items">${items.map(({p,quantity})=>`<article class="bag-item"><img src="${e(p.photo)}" alt="" width="60" height="72">
    <div><strong>${e(p.name)}</strong><p>${price(p.priceCents)}</p><button type="button" class="text-link" data-remove="${e(p.id)}">Remover</button></div>
    <label class="qty-label"><span class="sr-only">Quantidade de ${e(p.name)}</span><input type="number" min="1" max="${Math.min(99,p.stock)}" value="${quantity}" data-qty="${e(p.id)}"></label></article>`).join('')}</div>
    <div class="subtotal"><span>${unknown?'Subtotal com preço informado':'Subtotal dos produtos'}</span><strong>${unknown&&items.every(i=>i.p.priceCents===null)?'A combinar':price(known)}</strong></div>
    ${unknown?'<p class="muted">A Babi combina com você o valor dos produtos sem preço definido.</p>':''}
    <form id="checkout" class="form-stack"><label>Seu nome<input name="name" autocomplete="name" maxlength="100" minlength="2" required></label>
    <label>WhatsApp com DDD<input name="phone" type="tel" autocomplete="tel" maxlength="22" required></label>
    <label>Observação <span class="muted">(opcional)</span><textarea name="note" rows="2" maxlength="400"></textarea></label>
    <label class="check-label"><input type="checkbox" name="consent" required> Autorizo a Babi a usar meu contato para cuidar deste pedido.</label>
    <p class="muted">O envio reserva as unidades. O pagamento e a entrega são combinados com a Babi.</p>
    <p class="error" id="checkout-error" role="alert">${e(checkoutError)}</p><button class="button full" type="submit">Enviar pedido <span aria-hidden="true">↗</span></button></form>`:
    '<div class="empty"><strong>Sua sacola está vazia.</strong><p>Escolha um produto para começar.</p><button class="button" type="button" data-close>Voltar aos produtos</button></div><p class="error" role="alert">'+e(checkoutError)+'</p>'}`,'bag-dialog');
  $('checkout')?.addEventListener('submit',send);
}
function updateBag(change){
  const values=$('checkout')?new FormData($('checkout')):null;
  change();pending=null;checkoutError='';saveCart();bag();
  restoreForm(values);
}
function restoreForm(values){
  const form=$('checkout');
  if(!form||!values)return;
  for(const name of ['name','phone','note'])form.elements[name].value=values.get(name)||'';
  form.elements.consent.checked=values.has('consent');
}
async function send(event){
  event.preventDefault();if(submitting)return;
  const form=event.currentTarget,data=new FormData(form),button=form.querySelector('button[type=submit]');
  const details={name:data.get('name'),phone:data.get('phone'),note:data.get('note'),consent:data.has('consent'),
    items:[...cart].map(([id,quantity])=>({id,quantity,priceCents:lookup(id)?.priceCents??null}))};
  const signature=JSON.stringify(details);
  if(pending?.signature!==signature)pending={signature,key:crypto.randomUUID()};
  submitting=true;button.disabled=true;button.textContent='Enviando pedido…';$('checkout-error').textContent='';
  try{
    const order=await api('/api/orders','POST',{...details,key:pending.key});
    cart.clear();pending=null;saveCart();
    history.replaceState(null,'','#pedido='+order.token);
    receipt(order);refresh().catch(()=>{});
  }catch(error){
    if(error.status===409){
      try{await refresh();}catch{}
      checkoutError=error.message;bag();restoreForm(data);
    }else{
      $('checkout-error').textContent=error.message;button.disabled=false;button.textContent='Enviar pedido';
    }
  }finally{submitting=false;}
}
function receipt(order){
  open(`<div class="dialog-head"><div><p class="eyebrow">PEDIDO ${e(order.code)}</p><h2 id="dialog-title">${order.status==='novo'?'Pedido enviado.':'Seu pedido.'}</h2></div>${closeButton}</div>
  <div class="receipt"><p>${order.status==='novo'?'A Babi recebeu seu pedido e vai entrar em contato pelo WhatsApp informado.':'Consulte a situação do seu pedido abaixo.'}</p>
  <ul>${order.items.map(i=>`<li><span>${i.quantity} × ${e(i.name)}</span><strong>${price(i.priceCents===null?null:i.priceCents*i.quantity)}</strong></li>`).join('')}</ul>
  <div class="subtotal"><span>Total dos produtos</span><strong>${price(order.totalCents)}</strong></div>
  <p>Situação: <strong>${statusLabels[order.status]}</strong> · Pagamento: <strong>${statusLabels[order.payment]}</strong></p>
  <button type="button" class="button full" id="copy-order">Copiar link do pedido</button>
  <a class="text-link" href="${wa}" target="_blank" rel="noopener noreferrer">Falar com a Babi ↗</a></div>`,'bag-dialog');
  $('copy-order').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notice('Link do pedido copiado.');}catch{notice('Copie o endereço da página para guardar seu pedido.');}};
}
$('search').addEventListener('input',renderProducts);
$('filters').addEventListener('click',event=>{
  const button=event.target.closest('[data-category]');if(!button)return;
  category=button.dataset.category;
  for(const option of $('filters').querySelectorAll('button'))option.setAttribute('aria-pressed',String(option===button));
  renderProducts();
});
$('products').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.add)add(button.dataset.add);
  if(button.dataset.detail)details(button.dataset.detail);
});
document.querySelectorAll('[data-bag-open]').forEach(button=>button.onclick=()=>{checkoutError='';bag();});
dialog.addEventListener('click',event=>{
  if(submitting)return;
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')){dialog.close();return;}
  if(button.dataset.add)add(button.dataset.add);
  if(button.hasAttribute('data-bag'))bag();
  if(button.dataset.remove)updateBag(()=>cart.delete(button.dataset.remove));
});
dialog.addEventListener('change',event=>{
  const id=event.target.dataset.qty;
  if(!id||submitting)return;
  const n=Number(event.target.value),p=lookup(id);
  if(p)updateBag(()=>cart.set(id,Math.max(1,Math.min(99,p.stock,Number.isSafeInteger(n)?n:1))));
});
dialog.addEventListener('cancel',event=>{if(submitting)event.preventDefault();});
refresh().catch(error=>{$('results').textContent=error.message;});
async function openTracking(){
  const requestedHash=location.hash;
  const tracking=/^#pedido=([a-f0-9]{48})$/.exec(requestedHash)?.[1];
  if(!tracking)return;
  open(`<div class="dialog-head"><h2 id="dialog-title">Acompanhamento</h2>${closeButton}</div><div class="receipt" role="status"><p>Buscando os detalhes do pedido…</p></div>`,'bag-dialog');
  try{
    const order=await api('/api/orders/'+tracking);
    if(location.hash===requestedHash)receipt(order);
  }catch(error){
    if(location.hash===requestedHash)open(`<div class="dialog-head"><h2 id="dialog-title">Pedido indisponível.</h2>${closeButton}</div><div class="receipt"><p role="alert">${e(error.message)}</p><button type="button" class="button full" data-close>Voltar aos produtos</button></div>`,'bag-dialog');
  }
}
window.addEventListener('hashchange',openTracking);
openTracking();
