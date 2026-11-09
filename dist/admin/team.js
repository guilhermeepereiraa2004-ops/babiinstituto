import {api,esc,notify} from '/booking/shared.js';

const endpoint='/api/admin/team';

export async function mountTeam(container){
 let members=[];

 function render(){
  container.innerHTML=`<div class="page-title"><div><p class="label">ADMINISTRAÇÃO</p><h1>Acessos</h1><p>Defina as senhas da equipe. Cada pessoa entra com seu próprio nome de acesso.</p></div></div>
   <section class="panel team-panel"><div class="panel-header"><div><h2>Equipe Babi</h2><p>O acesso fica disponível assim que você salvar a primeira senha.</p></div></div>
    <div class="team-list">${members.map(member=>`<article class="team-member">
      <div class="team-member-header"><div><h3>${esc(member.name)}</h3><p>Nome de acesso: <strong>${esc(member.login)}</strong></p></div>
       <span class="team-status ${member.active?'team-active':''}">${member.active?'Ativo':'Aguardando senha'}</span></div>
      <button type="button" class="btn btn-secondary" data-team-open aria-label="${member.active?'Redefinir':'Definir'} senha de ${esc(member.name)}">${member.active?'Redefinir senha':'Definir senha'}</button>
      <form data-team-form data-login="${esc(member.login)}" data-action="${member.active?'reset':'activate'}" hidden>
       <label class="field">Nova senha<input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="128" required></label>
       <label class="field">Repita a senha<input type="password" name="confirm" autocomplete="new-password" minlength="12" maxlength="128" required></label>
       <p>${member.active?'Redefinir a senha encerra as sessões desse acesso.':'Use pelo menos 12 caracteres.'}</p>
       <p class="form-error" role="alert" data-team-error></p>
       <div class="team-actions"><button class="btn" type="submit">Salvar senha</button><button class="btn btn-secondary" type="button" data-team-cancel>Cancelar</button></div>
      </form></article>`).join('')}</div></section>`;
  for(const article of container.querySelectorAll('.team-member')){
   const form=article.querySelector('[data-team-form]');
   const open=article.querySelector('[data-team-open]');
   open.onclick=()=>{
    form.hidden=false;
    open.hidden=true;
    form.elements.password.focus();
   };
   form.querySelector('[data-team-cancel]').onclick=()=>{
    form.reset();
    form.querySelector('[data-team-error]').textContent='';
    form.hidden=true;
    open.hidden=false;
    open.focus();
   };
   form.onsubmit=event=>save(event,form);
  }
 }

 async function save(event,form){
  event.preventDefault();
  const {password,confirm}=Object.fromEntries(new FormData(form));
  const error=form.querySelector('[data-team-error]');
  error.textContent='';
  if(password!==confirm){error.textContent='As senhas precisam ser iguais.';return;}
  const buttons=[...form.querySelectorAll('button')];
  for(const button of buttons)button.disabled=true;
  try{
   await api(endpoint,{method:'POST',body:JSON.stringify({login:form.dataset.login,action:form.dataset.action,password})});
   form.reset();
   const member=members.find(person=>person.login===form.dataset.login);
   member.active=true;
   if(container.isConnected){
    render();
    notify('Senha salva para '+member.name+'.');
   }
  }catch(failure){
   error.textContent=failure.message;
  }finally{
   for(const button of buttons)button.disabled=false;
  }
 }

 container.innerHTML='<div class="boot-state"><p>Carregando os acessos…</p></div>';
 try{
  ({members}=await api(endpoint));
  if(container.isConnected)render();
 }catch(error){
  if(container.isConnected)container.innerHTML=`<div class="boot-state"><p>${esc(error.message)}</p></div>`;
 }
}
