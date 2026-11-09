import {api,esc,icon,notify} from '/booking/shared.js';

const endpoint='/api/admin/notifications';
const post=(action,data={})=>api(endpoint,{method:'POST',body:JSON.stringify({action,...data})});
const bytes=key=>Uint8Array.from(atob(key.replaceAll('-','+').replaceAll('_','/')),character=>character.charCodeAt(0));

export async function mountNotifications(container){
 const isAppleMobile=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const supported='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
 let registration,subscription,publicKey,status,busy=false,message='',error=false,loading=true;

 function render(){
  if(!container.isConnected)return;
  const blocked=supported&&Notification.permission==='denied';
  const needsInstall=isAppleMobile&&!installed;
  let heading='Carregando…',help='Verificando a disponibilidade dos avisos.';
  if(!loading){
   if(!publicKey){heading='Avisos indisponíveis';help=message||'Abra o painel publicado para ativar as notificações.';}
   else if(needsInstall){heading='Adicione o painel à Tela de Início';help='No Safari, toque em Compartilhar → Adicionar à Tela de Início. Abra o Painel Babi pelo novo ícone e volte a esta tela.';}
   else if(!supported){heading='Navegador sem suporte';help='Abra o painel pelo Chrome no Android ou pelo app da Tela de Início no iPhone.';}
   else if(blocked){heading='Permissão bloqueada';help='Libere as notificações nos ajustes do navegador ou do aparelho e abra esta tela novamente.';}
   else if(status?.here){heading='Avisos ativados neste aparelho';help='Novos pedidos e agendamentos podem chegar mesmo com o painel fechado.';}
   else if(status?.active){heading='Avisos ativados em outro aparelho';help='Se ativar aqui, os próximos avisos passarão a chegar neste aparelho.';}
   else{heading='Ative neste aparelho';help='Escolha o celular da proprietária e permita as notificações quando o navegador perguntar.';}
  }
  const controls=!!(registration&&status&&!needsInstall);
  container.innerHTML=`<div class="page-title"><div><p class="label">AVISOS DO INSTITUTO</p><h1>Notificações</h1><p>Receba novos pedidos e agendamentos no celular.</p></div></div>
   <section class="panel push-panel"><div class="panel-header"><div class="push-heading"><span class="module-symbol">${icon('bell')}</span><div><h2>${heading}</h2><p>${esc(help)}</p></div></div></div>
   <div class="push-panel-body">
    <p>Os avisos abrem a Agenda ou os Pedidos no painel. Dados de clientes ficam dentro da área administrativa.</p>
    ${controls?`<div class="push-actions">
     ${!status.here&&!blocked?`<button class="btn" type="button" data-push-action="enable" ${busy?'disabled':''}>Ativar neste aparelho</button>`:''}
     ${status.here&&!blocked?`<button class="btn" type="button" data-push-action="test" ${busy?'disabled':''}>Enviar notificação de teste</button>`:''}
     ${status.active?`<button class="btn btn-secondary" type="button" data-push-action="disable" ${busy?'disabled':''}>Desativar avisos</button>`:''}
    </div>`:''}
    ${publicKey&&message?`<p class="push-message ${error?'push-error':''}" role="status">${esc(message)}</p>`:''}
   </div></section>`;
  for(const button of container.querySelectorAll('[data-push-action]'))button.onclick=()=>act(button.dataset.pushAction);
 }

 async function act(action){
  busy=true;message='';error=false;render();
  try{
   if(action==='enable'){
    subscription=subscription||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(publicKey)});
    status=await post('enable',{subscription:subscription.toJSON()});
    notify('Notificações ativadas.');
   }else if(action==='disable'){
    status=await post('disable');
    await subscription?.unsubscribe().catch(()=>{});
    subscription=null;
    notify('Notificações desativadas.');
   }else{
    await post('test',{endpoint:subscription?.endpoint});
    message='Teste encaminhado. Confira as notificações do aparelho.';
   }
  }catch(failure){
   error=true;
   message=Notification.permission==='denied'?'A permissão foi bloqueada. Libere os avisos nos ajustes do aparelho.':
    failure.name==='NotAllowedError'?'Autorize as notificações para receber os avisos.':failure.message;
   if(action==='test')status=await post('status',{endpoint:subscription?.endpoint}).catch(()=>status);
  }finally{
   busy=false;render();
  }
 }

 render();
 try{
  ({publicKey}=await api(endpoint));
  if(!container.isConnected||!publicKey||!supported||(isAppleMobile&&!installed))return;
  await navigator.serviceWorker.register('/admin/push-worker.js');
  registration=await navigator.serviceWorker.ready;
  subscription=await registration.pushManager.getSubscription();
  if(subscription?.options.applicationServerKey){
   const current=new Uint8Array(subscription.options.applicationServerKey),expected=bytes(publicKey);
   if(current.length!==expected.length||current.some((byte,index)=>byte!==expected[index])){
    await subscription.unsubscribe();
    subscription=null;
   }
  }
  status=await post('status',{endpoint:subscription?.endpoint});
 }catch{
  error=true;
  message='Não foi possível preparar os avisos. Atualize a página e tente novamente.';
 }finally{
  loading=false;render();
 }
}
