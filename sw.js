const CACHE='adc-figueiras-v1-2-production-1';
const OFFLINE_URL='./index.html';
const ASSETS=[
  './index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/adc-figueiras-emblema.png','./assets/adc-figueiras-logo-normal.png','./assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png'
];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});

async function networkFirst(request){
 const cache=await caches.open(CACHE);
 try{
  const response=await fetch(request,{cache:'no-store'});
  if(response&&response.ok)await cache.put(request,response.clone());
  return response;
 }catch(err){
  return (await cache.match(request)) || (request.mode==='navigate' ? await cache.match(OFFLINE_URL) : Response.error());
 }
}

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;

 const core=request.mode==='navigate' || ['script','style','manifest','document'].includes(request.destination);
 if(core){
  event.respondWith(networkFirst(request));
  return;
 }

 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response&&response.ok){
   const cache=await caches.open(CACHE);
   await cache.put(request,response.clone());
  }
  return response;
 })());
});

self.addEventListener('push',event=>{
 let data={};
 try{data=event.data?event.data.json():{}}catch{data={body:event.data?event.data.text():''}}
 const title=data.title||'ADC Figueiras';
 const options={
  body:data.body||'Tens uma nova notificação.',
  icon:'./assets/icon-192.png',
  badge:'./assets/icon-192.png',
  tag:data.tag||undefined,
  renotify:false,
  data:{url:data.url||'./'}
 };
 event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'./',self.registration.scope).href;
 event.waitUntil((async()=>{
  const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   if('focus'in client){
    await client.focus();
    if('navigate'in client)await client.navigate(target);
    return;
   }
  }
  if(clients.openWindow)return clients.openWindow(target);
 })());
});
