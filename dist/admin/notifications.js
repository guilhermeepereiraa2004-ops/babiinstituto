import {api,esc,icon,notify} from '/booking/shared.js';

const endpoint='/api/admin/notifications';
const bytes=key=>Uint8Array.from(atob(key.replaceAll('-','+').replaceAll('_','/')),character=>character.charCodeAt(0));

export async function mountNotifications(container){
 const post=(action,data={})=>api(endpoint,{method:'POST',body:JSON.stringify({action,...data})});
 const isAppleMobile=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
 const needsInstall=isAppleMobile&&!installed;
 let registration,subscription,publicKey,status;
 let busy=false,message='',error=false,loading=true,name='';

 const currentEndpoint=()=>({endpoint:subscription?.endpoint});
 const refresh=async()=>{status=await post('status',currentEndpoint());};
 const canActivate=()=>registration&&status&&!status.here;

 function render(){
  if(!container.isConnected)return;
  const blocked=supported&&Notification.permission==='denied';
  const full=status?.devices?.length>=status?.limit;
  let heading='Carregando…',help='Verificando a disponibilidade dos avisos.';
  if(!loading){
   if(!publicKey){heading='Avisos indisponíveis';help=message||'Abra o endereço oficial da Babi para ativar as notificações.';}
   else if(needsInstall){
    heading='Adicione esta página à Tela de Início';
    help='No Safari, toque em Compartilhar → Adicionar à Tela de Início e abra o painel pelo novo ícone.';
   }else if(!supported){heading='Navegador sem suporte';help='Abra pelo Chrome no Android ou pelo ícone da Tela de Início no iPhone.';}
   else if(blocked){heading='Permissão bloqueada';help='Libere as notificações nos ajustes do navegador ou do aparelho e abra esta tela novamente.';}
   else if(status?.here){heading='Avisos ativos neste aparelho';help='Os avisos podem chegar mesmo com esta página fechada.';}
   else if(full){heading='Limite de aparelhos atingido';help='Remova um aparelho da lista para liberar uma vaga.';}
   else{heading='Ative neste aparelho';help='Dê um nome ao aparelho para reconhecê-lo na lista e permita as notificações.';}
  }

  container.innerHTML=`<div class="page-title"><div><p class="label">AVISOS DO INSTITUTO</p><h1>Notificações</h1><p>Receba novos pedidos e agendamentos no celular.</p></div></div>
   <section class="panel push-panel"><div class="panel-header"><div class="push-heading"><span class="module-symbol">${icon('bell')}</span><div><h2>${heading}</h2><p>${esc(help)}</p></div></div></div>
   <div class="push-panel-body">
    <p>Os avisos informam quando chega um pedido ou agendamento. Os dados das clientes ficam no painel.</p>
    ${canActivate()&&!blocked&&!full?`<form data-activate class="push-form">
     <label class="field">Nome do aparelho<input name="name" value="${esc(name)}" maxlength="60" placeholder="Ex.: meu celular" required></label>
     <button class="btn" type="submit" ${busy?'disabled':''}>Ativar neste aparelho</button>
    </form>`:''}
    ${status?.here?`<div class="push-actions">
     ${!blocked?`<button class="btn" type="button" data-action="test" ${busy?'disabled':''}>Enviar notificação de teste</button>`:''}
     <button class="btn btn-secondary" type="button" data-action="disable" ${busy?'disabled':''}>Desativar neste aparelho</button>
    </div>`:''}
    ${publicKey&&message?`<p class="push-message ${error?'push-error':''}" role="status">${esc(message)}</p>`:''}
   </div></section>
   ${status?renderManagement(status):''}`;

  container.querySelector('[data-activate]')?.addEventListener('submit',event=>{
   event.preventDefault();
   name=String(new FormData(event.currentTarget).get('name')).trim();
   act('enable');
  });
  for(const button of container.querySelectorAll('[data-action]'))button.onclick=()=>act(button.dataset.action,button.dataset.id);
 }

 function renderManagement({devices,limit,currentId}){
  return `<section class="panel push-panel push-management">
   <div class="panel-header"><div><h2>Aparelhos cadastrados</h2><p>${devices.length} de ${limit} aparelhos ativos</p></div></div>
   <div class="push-panel-body">
    ${devices.length?`<ul class="push-list">${devices.map(device=>`<li>
      <div><strong>${esc(device.name)}</strong><small>${device.id===currentId?'Este aparelho':'Ativado pelo painel'}</small></div>
      <button class="btn btn-secondary" type="button" data-action="revoke" data-id="${esc(device.id)}" aria-label="Remover ${esc(device.name)}" ${busy?'disabled':''}>Remover</button>
     </li>`).join('')}</ul>`:'<p>Nenhum aparelho cadastrado.</p>'}
   </div></section>`;
 }

 async function unsubscribe(){
  await subscription?.unsubscribe().catch(()=>{});
  subscription=null;
 }

 async function act(action,id){
  busy=true;message='';error=false;render();
  try{
   if(action==='enable'){
    subscription=subscription||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(publicKey)});
    await post('enable',{subscription:subscription.toJSON(),name});
    notify('Notificações ativadas.');
   }else if(action==='disable'){
    await post('disable',currentEndpoint());
    await unsubscribe();
    notify('Notificações desativadas neste aparelho.');
   }else if(action==='revoke'){
    await post(action,{id});
    if(status.currentId===id)await unsubscribe();
    notify('Aparelho removido.');
   }else{
    await post('test',currentEndpoint());
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
  await refresh();
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
