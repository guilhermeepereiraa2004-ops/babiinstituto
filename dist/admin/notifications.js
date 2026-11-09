import {api,esc,icon,notify} from '/booking/shared.js';

const adminEndpoint='/api/admin/notifications';
const guestEndpoint='/api/notifications/invite';
const bytes=key=>Uint8Array.from(atob(key.replaceAll('-','+').replaceAll('_','/')),character=>character.charCodeAt(0));

export async function mountNotifications(container,{guest=false}={}){
 const endpoint=guest?guestEndpoint:adminEndpoint;
 const post=(action,data={})=>api(endpoint,{method:'POST',body:JSON.stringify({action,...data})});
 const isAppleMobile=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
 const needsInstall=isAppleMobile&&!installed;
 let registration,subscription,publicKey,status;
 let busy=false,message='',error=false,loading=true,name='',inviteName='',newCode='';
 let code=guest&&/^[A-Za-z0-9_-]{24}$/.test(location.hash.slice(1))?location.hash.slice(1):'';

 const proof=()=>guest?{subscription:subscription?.toJSON()}:{endpoint:subscription?.endpoint};
 const refresh=async()=>{status=await post('status',proof());};
 const canActivate=()=>registration&&status&&!status.here;

 function render(){
  if(!container.isConnected)return;
  const blocked=supported&&Notification.permission==='denied';
  const full=!guest&&status?.devices?.length>=status?.limit;
  let heading='Carregando…',help='Verificando a disponibilidade dos avisos.';
  if(!loading){
   if(!publicKey){heading='Avisos indisponíveis';help=message||'Abra o endereço oficial da Babi para ativar as notificações.';}
   else if(needsInstall){
    heading='Adicione esta página à Tela de Início';
    help=guest?'Copie o código, toque em Compartilhar → Adicionar à Tela de Início no Safari e abra o novo ícone. Cole o código se ele não aparecer.':
     'No Safari, toque em Compartilhar → Adicionar à Tela de Início e abra o painel pelo novo ícone.';
   }else if(!supported){heading='Navegador sem suporte';help='Abra pelo Chrome no Android ou pelo ícone da Tela de Início no iPhone.';}
   else if(blocked){heading='Permissão bloqueada';help='Libere as notificações nos ajustes do navegador ou do aparelho e abra esta tela novamente.';}
   else if(status?.here){heading='Avisos ativos neste aparelho';help='Os avisos podem chegar mesmo com esta página fechada.';}
   else if(full){heading='Limite de aparelhos atingido';help='Remova um aparelho da lista para liberar uma vaga.';}
   else{heading='Ative neste aparelho';help=guest?'Use o código que você recebeu e permita as notificações quando o navegador perguntar.':
    'Dê um nome ao aparelho para reconhecê-lo na lista e permita as notificações.';}
  }

  container.innerHTML=`<div class="page-title"><div><p class="label">AVISOS DO INSTITUTO</p><h1>${guest?'Avisos da Babi':'Notificações'}</h1><p>Receba novos pedidos e agendamentos no celular.</p></div></div>
   <section class="panel push-panel"><div class="panel-header"><div class="push-heading"><span class="module-symbol">${icon('bell')}</span><div><h2>${heading}</h2><p>${esc(help)}</p></div></div></div>
   <div class="push-panel-body">
    <p>Os avisos informam quando chega um pedido ou agendamento. Os dados das clientes ficam no painel.</p>
    ${guest&&needsInstall&&code?`<label class="field push-field">Código do convite<input data-copy-source="code" readonly value="${esc(code)}"></label>
     <button class="btn btn-secondary" type="button" data-copy="code">Copiar código</button>`:''}
    ${canActivate()&&!blocked&&!full?`<form data-activate class="push-form">
     ${guest?`<label class="field">Código do convite<input name="code" value="${esc(code)}" maxlength="24" autocomplete="off" autocapitalize="none" spellcheck="false" required></label>`:
      `<label class="field">Nome do aparelho<input name="name" value="${esc(name)}" maxlength="60" placeholder="Ex.: meu celular" required></label>`}
     <button class="btn" type="submit" ${busy?'disabled':''}>Ativar neste aparelho</button>
    </form>`:''}
    ${status?.here?`<div class="push-actions">
     ${!blocked?`<button class="btn" type="button" data-action="test" ${busy?'disabled':''}>Enviar notificação de teste</button>`:''}
     <button class="btn btn-secondary" type="button" data-action="disable" ${busy?'disabled':''}>Desativar neste aparelho</button>
    </div>`:''}
    ${publicKey&&message?`<p class="push-message ${error?'push-error':''}" role="status">${esc(message)}</p>`:''}
   </div></section>
   ${!guest&&status?renderManagement(status):''}`;

  container.querySelector('[data-activate]')?.addEventListener('submit',event=>{
   event.preventDefault();
   const fields=new FormData(event.currentTarget);
   if(guest)code=String(fields.get('code')).trim();
   else name=String(fields.get('name')).trim();
   act('enable');
  });
  container.querySelector('[data-create-invite]')?.addEventListener('submit',event=>{
   event.preventDefault();
   inviteName=String(new FormData(event.currentTarget).get('inviteName')).trim();
   act('invite');
  });
  for(const button of container.querySelectorAll('[data-action]'))button.onclick=()=>act(button.dataset.action,button.dataset.id);
  for(const button of container.querySelectorAll('[data-copy]'))button.onclick=()=>copy(button.dataset.copy);
 }

 function renderManagement({devices,invites,limit,currentId}){
  const inviteUrl=location.origin+'/admin/avisos/#'+newCode;
  return `<section class="panel push-panel push-management">
   <div class="panel-header"><div><h2>Aparelhos cadastrados</h2><p>${devices.length} de ${limit} aparelhos ativos</p></div></div>
   <div class="push-panel-body">
    ${devices.length?`<ul class="push-list">${devices.map(device=>`<li>
      <div><strong>${esc(device.name)}</strong><small>${device.id===currentId?'Este aparelho':device.guest?'Convidado':'Ativado pelo painel'}</small></div>
      <button class="btn btn-secondary" type="button" data-action="revoke" data-id="${esc(device.id)}" aria-label="Remover ${esc(device.name)}" ${busy?'disabled':''}>Remover</button>
     </li>`).join('')}</ul>`:'<p>Nenhum aparelho cadastrado.</p>'}
    <h3>Convidar alguém</h3><p>O convite vale por 24 horas e cadastra um aparelho. A pessoa confirma os avisos no próprio celular.</p>
    <form data-create-invite class="push-form"><label class="field">Nome para identificar o aparelho<input name="inviteName" value="${esc(inviteName)}" maxlength="60" placeholder="Ex.: celular da recepção" required></label>
     <button class="btn btn-secondary" type="submit" ${busy?'disabled':''}>Gerar convite</button></form>
    ${newCode?`<div class="push-invite-result">
     <label class="field">Link do convite<input data-copy-source="link" readonly value="${esc(inviteUrl)}"></label>
     <label class="field">Código do convite<input data-copy-source="code" readonly value="${esc(newCode)}"></label>
     <div class="push-actions"><button class="btn" type="button" data-copy="link">Copiar link</button><button class="btn btn-secondary" type="button" data-copy="code">Copiar código</button></div>
    </div>`:''}
    ${invites.length?`<h3>Convites pendentes</h3><ul class="push-list">${invites.map(invite=>`<li><strong>${esc(invite.name)}</strong>
     <button class="btn btn-secondary" type="button" data-action="cancel-invite" data-id="${esc(invite.id)}" aria-label="Cancelar convite para ${esc(invite.name)}" ${busy?'disabled':''}>Cancelar</button></li>`).join('')}</ul>`:''}
   </div></section>`;
 }

 async function copy(kind){
  const field=container.querySelector('[data-copy-source="'+kind+'"]');
  try{
   await navigator.clipboard.writeText(field.value);
   notify(kind==='link'?'Link copiado.':'Código copiado.');
  }catch{
   field.focus();field.select();
  }
 }

 async function unsubscribe(){
  await subscription?.unsubscribe().catch(()=>{});
  subscription=null;
 }

 async function act(action,id){
  busy=true;message='';error=false;render();
  try{
   if(action==='enable'){
    if(guest&&!/^[A-Za-z0-9_-]{24}$/.test(code))throw Error('Informe o código de 24 caracteres do convite.');
    subscription=subscription||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(publicKey)});
    const result=await post('enable',{subscription:subscription.toJSON(),name,code});
    status={...status,...result};
    if(guest){
     code='';
     if(location.hash)history.replaceState(null,'',location.pathname+location.search);
    }
    notify('Notificações ativadas.');
   }else if(action==='disable'){
    await post('disable',proof());
    await unsubscribe();
    notify('Notificações desativadas neste aparelho.');
   }else if(action==='revoke'){
    await post(action,{id});
    if(status.currentId===id)await unsubscribe();
    notify('Aparelho removido.');
   }else if(action==='invite'){
    ({code:newCode}=await post(action,{name:inviteName}));
    inviteName='';
    notify('Convite pronto para copiar.');
   }else if(action==='cancel-invite'){
    await post(action,{id});
    newCode='';
    notify('Convite cancelado.');
   }else{
    await post('test',proof());
    message='Teste encaminhado. Confira as notificações do aparelho.';
   }
   await refresh();
  }catch(failure){
   error=true;
   message=supported&&Notification.permission==='denied'?'A permissão foi bloqueada. Libere os avisos nos ajustes do aparelho.':
    failure.name==='NotAllowedError'?'Autorize as notificações para receber os avisos.':failure.message;
   if(action==='test'||action==='disable')await refresh().catch(()=>{});
  }finally{
   busy=false;render();
  }
 }

 render();
 try{
  ({publicKey}=await api(endpoint));
  if(!container.isConnected||!publicKey)return;
  if(!guest)await refresh();
  if(!supported||needsInstall)return;
  await navigator.serviceWorker.register('/admin/push-worker.js');
  registration=await navigator.serviceWorker.ready;
  subscription=await registration.pushManager.getSubscription();
  if(subscription?.options.applicationServerKey){
   const current=new Uint8Array(subscription.options.applicationServerKey),expected=bytes(publicKey);
   if(current.length!==expected.length||current.some((byte,index)=>byte!==expected[index]))await unsubscribe();
  }
  await refresh();
 }catch{
  error=true;
  message='Não foi possível preparar os avisos. Atualize a página e tente novamente.';
 }finally{
  loading=false;render();
 }
}
