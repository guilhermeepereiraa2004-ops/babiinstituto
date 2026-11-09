const targets = {order:'/admin/#orders',booking:'/admin/#agenda',test:'/admin/#notifications'};

self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));

self.addEventListener('push', event => {
 let data;
 try { data=event.data?.json(); } catch {}
 const kind=Object.hasOwn(targets,data?.kind)?data.kind:'test';
 event.waitUntil(self.registration.showNotification(data?.title||'Babi Instituto',{
  body:data?.body||'Abra o painel para conferir.',
  icon:'/admin/icon-192.png',
  tag:data?.tag||'babi-panel',
  data:{kind,guest:data?.guest===true}
 }));
});

self.addEventListener('notificationclick', event => {
 event.notification.close();
 const kind=event.notification.data?.kind;
 const pagePath=event.notification.data?.guest?'/admin/avisos/':'/admin/';
 const target=new URL(pagePath==='/admin/'&&Object.hasOwn(targets,kind)?targets[kind]:pagePath,self.location.origin);
 event.waitUntil((async () => {
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows) {
   if(new URL(client.url).pathname!==pagePath)continue;
   try {
    const page=await client.navigate(target.href);
    if(page)return await page.focus();
   } catch {}
  }
  return self.clients.openWindow(target.href);
 })());
});
