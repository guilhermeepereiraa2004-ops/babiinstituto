import {api,cents,escapeHtml as e,localDay,moneyInput,norm,notice,paymentLabels,price,stamp,statusLabels,wa} from '../shared.js';
export function mountShopAdmin({main=document.getElementById('admin-main'),dialog=document.getElementById('admin-dialog'),view='overview',embedded=false,onChange=async()=>{},onExpired=()=>{location.href='/admin/';}}={}){
const views={overview:'Visão geral',products:'Produtos',orders:'Pedidos',finance:'Financeiro'};
const drawings={
  overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  products:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z M3 8l9 5 9-5 M12 13v9 M7 5.8l9 5"/>',
  orders:'<path d="M5 8h14l1 13H4L5 8Z M8 9V6a4 4 0 0 1 8 0v3"/>',
  finance:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M7 6V3h10v3M15 15h3"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  stock:'<path d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6"/>'
};
const graphic=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(drawings[name]||drawings.products)+'</svg>';
const productStatuses={active:'No site',inactive:'Inativos',empty:'Esgotados'};
const today=()=>localDay(new Date());
const preset=['Acidificação e pH','Cronograma Capilar','Finalizadores','Hidratação','Kits','Máscaras e tratamentos','Miniaturas','Nutrição','Óleos e reparadores','Perfumes capilares','Reconstrução','Terapia Capilar'];
let current=view,data,productFilter='all',orderFilter='all',productSearch='',orderSearch='',from=today().slice(0,7)+'-01',to=today(),busy=false;
const productStatus=p=>!p.active?'inactive':p.stock===0?'empty':'active';
const statusPill=(key,label)=>`<span class="pill pill-${e(key)}">${e(label||statusLabels[key])}</span>`;
const moneyOrDash=n=>n===null||n===undefined?'—':price(n);
const image=p=>p.photo?`<img class="admin-thumb" src="${e(p.photo)}" alt="" width="56" height="64" loading="lazy">`:'<span class="admin-thumb photo-empty" aria-label="Sem foto">—</span>';
const empty=(label,description='')=>`<div class="empty"><span class="empty-symbol">${graphic(current==='orders'||current==='overview'?'orders':current==='finance'?'finance':'products')}</span><strong>${e(label)}</strong>${description?'<p>'+e(description)+'</p>':''}</div>`;
const close='<button type="button" class="close" data-close aria-label="Fechar janela">×</button>';
const errorLine='<p class="error" data-error role="alert"></p>';
function open(title,body){
  dialog.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${e(title)}</h2>${close}</div><div class="admin-dialog-body">${body}</div>`;
  if(!dialog.open)dialog.showModal();
}
async function load(){data=await api('/api/admin/data');}
function login(session){
  if(document.getElementById('header-logout'))document.getElementById('header-logout').hidden=true;
  main.classList.remove('has-admin-shell');
  main.innerHTML=`<section class="login panel"><p class="eyebrow">ÁREA ADMINISTRATIVA</p><h1>Gestão da <em>loja.</em></h1><p>Cuide dos produtos, dos pedidos e do financeiro em um só lugar.</p>
    <form class="form-stack" id="login-form">${session.local?'<p class="muted">Acesso de desenvolvimento neste computador.</p>':'<label>E-mail<input type="email" name="email" autocomplete="username" required></label><label>Senha da loja<input type="password" name="password" autocomplete="current-password" required></label>'}
    ${errorLine}<button class="button" type="submit">${session.local?'Acessar painel local':'Entrar no painel'} ↗</button></form></section>`;
  document.getElementById('login-form').onsubmit=async event=>{
    event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');
    button.disabled=true;
    const fields=new FormData(form);
    try{await api('/api/admin/session','POST',{email:fields.get('email'),password:fields.get('password')});await load();render();}
    catch(error){form.querySelector('[data-error]').textContent=error.message;button.disabled=false;}
  };
}
async function init(){
  try{const session=await api('/api/admin/session');if(!session.authenticated){if(embedded){onExpired();return;}login(session);return;}await load();render();}
  catch(error){main.innerHTML=empty(error.message);}
}
function title(kicker,headline,description,action=''){
  return `<div class="admin-heading"><div><p class="eyebrow"><span></span> ${kicker}</p><h1>${headline}</h1><p>${description}</p></div>${action}</div>`;
}
function render(){
  if(!main.isConnected)return;
  if(embedded){main.classList.add('shop-module');main.innerHTML=({products,orders})[current]();return;}
  const pending=data.orders.filter(o=>o.status==='novo').length;
  main.classList.add('has-admin-shell');
  document.getElementById('header-logout').hidden=false;
  main.innerHTML=`<aside class="admin-sidebar"><p class="sidebar-label">ADMINISTRAÇÃO</p><nav class="admin-nav" aria-label="Áreas do painel">${Object.entries(views).map(([key,label])=>`<button class="admin-nav-link" data-view="${key}" aria-current="${current===key?'page':'false'}"><span class="nav-icon">${graphic(key)}</span><span>${label}</span>${key==='orders'&&pending?`<span class="nav-badge">${pending}</span>`:''}</button>`).join('')}</nav><div class="sidebar-note"><span class="sidebar-mark">b.</span><strong>Loja Babi</strong><p>Produtos, pedidos e financeiro em um só lugar.</p></div></aside>
    <section id="admin-content" aria-label="${views[current]}">${({overview,products,orders,finance})[current]()}</section>`;
}
function overview(){
  const available=data.products.filter(p=>productStatus(p)==='active').length;
  const noStock=data.products.filter(p=>p.stock===0).length;
  const pending=data.orders.filter(o=>o.status==='novo').length;
  const incoming=data.ledger.filter(e=>e.kind==='entrada'&&localDay(e.at).slice(0,7)===today().slice(0,7)).reduce((s,e)=>s+e.amountCents,0);
  return title('BEM-VINDA À LOJA BABI','Sua loja em um <em>olhar.</em>','Acompanhe o que precisa de atenção e cuide das próximas vendas.')+
    `<div class="metrics overview-metrics"><article><span class="metric-icon">${graphic('products')}</span><span>Produtos no site</span><strong>${available}</strong><small>Disponíveis para compra</small></article><article><span class="metric-icon">${graphic('orders')}</span><span>Pedidos novos</span><strong>${pending}</strong><small>Aguardando sua atenção</small></article><article><span class="metric-icon">${graphic('finance')}</span><span>Entradas neste mês</span><strong>${price(incoming)}</strong><small>Recebimentos registrados</small></article><article><span class="metric-icon">${graphic('stock')}</span><span>Sem estoque</span><strong>${noStock}</strong><small>Produtos para repor</small></article></div>
    <div class="overview-panels"><section class="panel"><div class="panel-head"><div><h2>Pedidos recentes</h2><p>Acompanhe as últimas solicitações.</p></div><button class="text-link" data-view="orders">Ver todos ${graphic('arrow')}</button></div>${orderRows(data.orders.slice(0,5))}</section>
    <section class="panel quick-panel"><div class="panel-head"><h2>Acesso rápido</h2></div><div class="quick-actions"><button data-new-product><span class="quick-icon">${graphic('plus')}</span><span><strong>Cadastrar produto</strong><small>Nome, foto, valor e estoque</small></span>${graphic('arrow')}</button><button data-view="products"><span class="quick-icon">${graphic('products')}</span><span><strong>Organizar catálogo</strong><small>Editar e atualizar produtos</small></span>${graphic('arrow')}</button><button data-entry><span class="quick-icon">${graphic('finance')}</span><span><strong>Registrar movimento</strong><small>Uma entrada ou saída no caixa</small></span>${graphic('arrow')}</button></div></section></div>`;
}
function products(){
  return title('CATÁLOGO','Seus <em>produtos.</em>','Edite valores, fotos e a quantidade disponível. Produtos sem estoque saem do site.', '<button class="button" data-new-product>Adicionar produto +</button>')+
    `<section class="panel"><div class="toolbar"><label class="input-label">Buscar produto<input id="product-search" type="search" value="${e(productSearch)}" placeholder="Nome ou categoria"></label>
      <label class="input-label">Situação<select id="product-filter"><option value="all">Todos os produtos</option>${Object.entries(productStatuses).map(([k,v])=>`<option value="${k}" ${productFilter===k?'selected':''}>${v}</option>`).join('')}</select></label></div><div id="product-results">${productRows()}</div></section>`;
}
function productRows(){
  const query=norm(productSearch).trim();
  const rows=data.products.filter(p=>(productFilter==='all'||productStatus(p)===productFilter)&&norm(p.name+' '+p.category).includes(query));
  if(!rows.length)return empty('Nenhum produto nesta lista.');
  return `<p class="result-count admin-count">${rows.length} de ${data.products.length} produtos</p><div class="admin-list">${rows.map(p=>{
    const state=productStatus(p);
    return `<article class="admin-row product-row">${image(p)}<div class="admin-row-title"><small>${e(p.category)}</small><strong>${e(p.name)}</strong>${statusPill(state,state==='inactive'&&!p.photo?'Aguardando foto':productStatuses[state])}</div>
      <div class="product-numbers"><div class="row-value"><small>Venda</small><strong>${price(p.priceCents)}</strong></div><div class="row-value"><small>Custo</small><strong>${moneyOrDash(p.costCents)}</strong></div><div class="row-value stock-value"><small>Estoque</small><strong>${p.stock}<span> un.</span></strong></div></div>
      <div class="row-actions"><button class="button compact" data-edit="${e(p.id)}">Editar produto</button>${p.active?`<button class="text-link" data-product-action="deactivate" data-id="${e(p.id)}">Inativar</button>`:`<button class="text-link" data-product-action="activate" data-id="${e(p.id)}">Voltar ao site</button>`}<button class="text-link danger" data-product-action="delete" data-id="${e(p.id)}">Apagar</button></div></article>`;
  }).join('')}</div>`;
}
function orders(){
  return title('VENDAS','Seus <em>pedidos.</em>','Revise pedidos, combine valores e registre os pagamentos recebidos.')+
    `<section class="panel"><div class="toolbar"><label class="input-label">Buscar pedido<input id="order-search" type="search" value="${e(orderSearch)}" placeholder="Código, nome ou telefone"></label>
    <label class="input-label">Situação<select id="order-filter"><option value="all">Todos os pedidos</option>${['novo','confirmado','concluido','cancelado'].map(k=>`<option value="${k}" ${k===orderFilter?'selected':''}>${statusLabels[k]}</option>`).join('')}</select></label></div><div id="order-results">${orderRows(filteredOrders())}</div></section>`;
}
function filteredOrders(){
  const q=norm(orderSearch).trim();
  return data.orders.filter(o=>(orderFilter==='all'||o.status===orderFilter)&&norm(o.code+' '+o.name+' '+o.phone).includes(q));
}
function orderRows(rows){
  if(!rows.length)return empty('Nenhum pedido nesta lista.','Os pedidos da loja aparecerão aqui para você acompanhar.');
  return `<div class="admin-list">${rows.map(o=>`<article class="admin-row order-row"><div class="admin-row-title"><small>${e(o.code)} · ${stamp(o.createdAt)}</small><strong>${e(o.name)}</strong></div>
    <div class="order-badges">${statusPill(o.status)} ${statusPill(o.payment)}</div><div class="order-value"><small>Total do pedido</small><strong>${price(o.totalCents)}</strong></div>
    <button class="button button-outline compact" data-order="${e(o.id)}">Ver pedido ${graphic('arrow')}</button></article>`).join('')}</div>`;
}
function finance(){
  return title('CAIXA DA LOJA','Seu <em>financeiro.</em>','Entradas, saídas e saldo do período. Recebimentos de pedidos aparecem aqui.', '<button class="button" data-entry>Novo lançamento +</button>')+
    `<div class="toolbar period"><label class="input-label">De<input type="date" id="date-from" value="${e(from)}"></label><label class="input-label">Até<input type="date" id="date-to" value="${e(to)}"></label></div><div id="finance-results">${financeRows()}</div>`;
}
function financeRows(){
  if(!from||!to||from>to)return empty('Selecione um período válido.');
  const rows=data.ledger.filter(entry=>{const d=localDay(entry.at);return d>=from&&d<=to;});
  const total=kind=>rows.filter(x=>x.kind===kind).reduce((s,x)=>s+x.amountCents,0);
  const ins=total('entrada'),outs=total('saida');
  return `<div class="metrics"><article><span>Entradas</span><strong>${price(ins)}</strong></article><article><span>Saídas</span><strong>${price(outs)}</strong></article><article><span>Saldo do período</span><strong>${price(ins-outs)}</strong></article></div>
    <section class="panel"><div class="panel-head"><h2>Movimentações</h2></div>${rows.length?`<div class="admin-list">${rows.map(x=>`<article class="admin-row ledger-row"><div class="admin-row-title"><strong>${e(x.description)}</strong><small>${stamp(x.at)}${x.method?' · '+e(paymentLabels[x.method]):''}</small></div>${statusPill(x.kind,x.kind==='entrada'?'Entrada':'Saída')}<strong>${price(x.amountCents)}</strong></article>`).join('')}</div>`:empty('Nenhum lançamento neste período.')}</section>`;
}
function editProduct(p){
  const cats=[...new Set([...preset,...data.products.map(p=>p.category)])];
  open(p?'Editar produto':'Adicionar produto',`<form class="form-stack" id="product-form">
    <div class="editor-photo">${p?image(p):''}<label>${p?.photo?'Substituir foto':'Foto do produto'}<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label></div>
    <label>Nome<input name="name" maxlength="160" minlength="2" required value="${e(p?.name)}"></label>
    <label>Categoria<input name="category" list="shop-categories" maxlength="50" required value="${e(p?.category)}"><datalist id="shop-categories">${cats.map(c=>`<option value="${e(c)}"></option>`).join('')}</datalist></label>
    <label>Descrição<textarea name="description" maxlength="600" rows="3">${e(p?.description)}</textarea></label>
    <div class="form-columns"><label>Preço de venda (R$)<input name="price" inputmode="decimal" value="${moneyInput(p?.priceCents)}" placeholder="A combinar"></label>
    <label>Custo unitário (R$)<input name="cost" inputmode="decimal" value="${moneyInput(p?.costCents)}" placeholder="Apenas no painel"></label>
    <label>Estoque disponível<input name="stock" type="number" min="0" max="100000" step="1" required value="${p?.stock??1}"></label></div>
    <label class="check-label"><input name="active" type="checkbox" ${p?.active||!p?'checked':''}> Produto ativo no catálogo</label>
    ${errorLine}<button type="submit" class="button">Salvar produto</button></form>`);
  dialog.querySelector('form').onsubmit=event=>handleForm(event,async fields=>{
    const file=fields.get('image');
    const payload={name:fields.get('name'),category:fields.get('category'),description:fields.get('description'),priceCents:cents(fields.get('price'),true),costCents:cents(fields.get('cost'),true),
      stock:Number(fields.get('stock')),active:fields.has('active'),revision:p?.revision};
    if(file?.size)payload.image=await compress(file);
    await api('/api/admin/products'+(p?'/'+p.id:''),p?'PUT':'POST',payload);
  },'Produto salvo.');
}
async function compress(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12_000_000)throw Error('Escolha uma imagem JPG, PNG ou WebP de até 12 MB.');
  let image;try{image=await createImageBitmap(file);}catch{throw Error('Não foi possível abrir a imagem.');}
  try{
    const canvas=document.createElement('canvas'),ratio=Math.min(1,1500/Math.max(image.width,image.height));
    canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',.86);
  }finally{image.close();}
}
function productAction(p,action){
  const labels={activate:'Voltar ao site',deactivate:'Inativar produto',delete:'Apagar produto'};
  const descriptions={activate:p.stock?'O produto voltará ao catálogo se tiver foto e estoque disponível.':'Ative agora e reponha o estoque para voltar a aparecer no site.',
    deactivate:'O produto sai do catálogo e fica disponível na lista de inativos.',delete:'O cadastro será apagado. Os pedidos concluídos continuarão no histórico.'};
  confirmAction(labels[action],p.name,descriptions[action],()=>api('/api/admin/products/'+p.id,'PATCH',{action,revision:p.revision}),action==='delete');
}
function confirmAction(title,name,description,action,danger=false){
  open(title,`<form class="form-stack"><strong>${e(name)}</strong><p>${e(description)}</p>${errorLine}<button type="submit" class="button ${danger?'button-danger':''}">${e(title)}</button></form>`);
  dialog.querySelector('form').onsubmit=event=>handleForm(event,action,'Alteração salva.');
}
function showOrder(o){
  const openStatus=['novo','confirmado'].includes(o.status);
  const cost=o.items.every(i=>i.costCents!==null)?o.items.reduce((sum,i)=>sum+i.costCents*i.quantity,0):null;
  open(o.code,`<div class="order-detail"><div>${statusPill(o.status)} ${statusPill(o.payment)}</div><p><strong>${e(o.name)}</strong> · ${stamp(o.createdAt)}</p>
    <p><a class="text-link" href="${wa.replace(/\d+$/,'')+(o.phone.length<=11?'55':'')+o.phone}" target="_blank" rel="noopener noreferrer">WhatsApp: ${e(o.phone)} ↗</a></p>
    ${o.note?`<p class="callout">${e(o.note)}</p>`:''}<ul>${o.items.map(i=>`<li><span>${i.quantity} × ${e(i.name)}</span><strong>${price(i.priceCents===null?null:i.priceCents*i.quantity)}</strong></li>`).join('')}</ul>
    <div class="subtotal"><span>Total combinado</span><strong>${price(o.totalCents)}</strong></div><p class="muted">Custo dos itens: ${cost===null?'não informado para todos os produtos':price(cost)}</p>
    <div class="action-group">${o.status==='novo'?'<button class="button button-outline compact" data-order-action="confirm">Confirmar pedido</button>':''}
    ${openStatus&&o.payment==='pendente'?'<button class="button button-outline compact" data-order-action="quote">Editar total</button><button class="button compact" data-order-action="receive">Registrar recebimento</button>':''}
    ${openStatus&&o.payment==='recebido'?'<button class="button compact" data-order-action="complete">Concluir pedido</button><button class="button button-outline compact" data-order-action="refund">Registrar estorno</button>':''}
    ${openStatus&&o.payment!=='recebido'?'<button class="text-link danger" data-order-action="cancel">Cancelar pedido</button>':''}</div></div>`);
  for(const button of dialog.querySelectorAll('[data-order-action]'))button.onclick=()=>editOrder(o,button.dataset.orderAction);
}
function editOrder(o,action){
  const patch=body=>api('/api/admin/orders/'+o.id,'PATCH',{...body,action,revision:o.revision});
  const labels={confirm:'Confirmar pedido',cancel:'Cancelar pedido',complete:'Concluir pedido',refund:'Registrar estorno',receive:'Registrar recebimento',quote:'Editar total'};
  if(['confirm','cancel','complete'].includes(action)){
    confirmAction(labels[action],o.code,action==='cancel'?'As unidades reservadas voltarão ao estoque.':'A situação do pedido será atualizada.',()=>patch({}),action==='cancel');return;
  }
  open(labels[action],`<form class="form-stack">
    ${action==='refund'?'<p>Registre o estorno feito fora do site. O lançamento ficará no financeiro.</p><label>Motivo<input name="reason" minlength="3" maxlength="160" required></label>':
      `<label>Total ${action==='receive'?'recebido':'combinado'} (R$)<input name="amount" inputmode="decimal" required value="${moneyInput(o.totalCents)}"></label>
      ${action==='receive'?'<label>Forma de pagamento<select name="method" required><option value="">Selecione</option>'+Object.entries(paymentLabels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')+'</select></label>':''}`}
    ${errorLine}<button type="submit" class="button">${labels[action]}</button></form>`);
  dialog.querySelector('form').onsubmit=event=>handleForm(event,fields=>patch(action==='refund'?{reason:fields.get('reason')}:{amountCents:cents(fields.get('amount')),method:fields.get('method')}),'Pedido atualizado.');
}
function newEntry(){
  open('Novo lançamento',`<form class="form-stack"><label>Tipo<select name="kind"><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
    <label>Descrição<input name="description" required minlength="3" maxlength="160"></label><label>Valor (R$)<input name="amount" inputmode="decimal" required></label>
    ${errorLine}<button type="submit" class="button">Salvar lançamento</button></form>`);
  dialog.querySelector('form').onsubmit=event=>handleForm(event,fields=>api('/api/admin/ledger','POST',{kind:fields.get('kind'),description:fields.get('description'),amountCents:cents(fields.get('amount'))}),'Lançamento registrado.');
}
async function handleForm(event,action,message){
  event.preventDefault();if(busy)return;
  const form=event.currentTarget,button=form.querySelector('button[type=submit]');busy=true;button.disabled=true;
  form.querySelector('[data-error]').textContent='';
  try{await action(new FormData(form));dialog.close();notice(message);await load();render();await onChange();}
  catch(error){
    if(error.status===401){dialog.close();await init();return;}
    if(dialog.open)form.querySelector('[data-error]').textContent=error.message;
    else notice('Atualize o painel para ver a alteração.');
    if(error.status===409){try{await load();render();}catch{}}
    button.disabled=false;
  }finally{busy=false;}
}
main.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.view){current=button.dataset.view;try{await load();render();window.scrollTo({top:0,behavior:'instant'});}catch(error){if(error.status===401)await init();else notice(error.message);}return;}
  if(button.hasAttribute('data-logout')){try{await api('/api/admin/session','DELETE');await init();}catch(error){notice(error.message);}return;}
  if(button.hasAttribute('data-new-product'))editProduct(null);
  if(button.dataset.edit)editProduct(data.products.find(p=>p.id===button.dataset.edit));
  if(button.dataset.productAction)productAction(data.products.find(p=>p.id===button.dataset.id),button.dataset.productAction);
  if(button.dataset.order)showOrder(data.orders.find(o=>o.id===button.dataset.order));
  if(button.hasAttribute('data-entry'))newEntry();
});
if(!embedded)document.getElementById('header-logout').onclick=async()=>{
  try{await api('/api/admin/session','DELETE');await init();}
  catch(error){notice(error.message);}
};
main.addEventListener('input',event=>{
  const {id,value}=event.target;
  if(id==='product-search'||id==='product-filter'){
    if(id==='product-search')productSearch=value;else productFilter=value;
    document.getElementById('product-results').innerHTML=productRows();
  }
  if(id==='order-search'||id==='order-filter'){
    if(id==='order-search')orderSearch=value;else orderFilter=value;
    document.getElementById('order-results').innerHTML=orderRows(filteredOrders());
  }
  if(id==='date-from'||id==='date-to'){
    if(id==='date-from')from=value;else to=value;
    document.getElementById('finance-results').innerHTML=financeRows();
  }
});
dialog.addEventListener('click',event=>{if(event.target.closest('[data-close]')&&!busy)dialog.close();});
dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
init();
return {refresh:init};
}
if(document.getElementById('admin-main'))mountShopAdmin();
