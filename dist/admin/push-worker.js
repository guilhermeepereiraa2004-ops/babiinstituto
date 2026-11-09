const targets = {order:'/admin/#orders',booking:'/admin/#agenda',test:'/admin/#notifications'};

self.addEventListener('push', event => {
 let data;
 try { data=event.data?.json(); } catch {}
 const kind=Object.hasOwn(targets,data?.kind)?data.kind:'test';
 event.waitUntil(self.registration.showNotification(data?.title||'Babi Instituto',{
  body:data?.body||'Abra o painel para conferir.',
  icon:'/admin/icon-192.png',
  tag:data?.tag||'babi-panel',
  data:{kind}
 }));
});

self.addEventListener('notificationclick', event => {
 event.notification.close();
 const kind=event.notification.data?.kind;
 const target=new URL(Object.hasOwn(targets,kind)?targets[kind]:'/admin/',self.location.origin);
 event.waitUntil((async () => {
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows) {
   if(new URL(client.url).pathname!=='/admin/')continue;
   try {
    const page=await client.navigate(target.href);
    if(page)return await page.focus();
   } catch {}
  }
  return self.clients.openWindow(target.href);
 })());
});
