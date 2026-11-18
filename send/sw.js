// 자료 보내기 서비스워커 v1 (2026-11-18): 화면은 늘 서버 최신본 먼저, 끊기면 저장본
const C='jaryo-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./icon-192.png','./icon-512.png','./send.webmanifest'])).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('jaryo-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/drawbread/send/')||/\.(pdf|apk)$/i.test(u.pathname))return;
 e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.status===200&&!u.search){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('./index.html'))));});