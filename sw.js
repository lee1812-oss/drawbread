// 빵을그리다 앱 모음 · 업무 대시보드 서비스워커 v3 (2026-10-19)
// - 화면(HTML)은 늘 서버에 새 것이 있는지 먼저 확인해서, 새 화면이 바로 보이게 함 (끊기면 저장본)
// - ?t= 처럼 매번 주소가 바뀌는 자료는 저장하지 않음 (예전 v2는 5분마다 한 칸씩 쌓였음)
// - 새 버전이 켜지면 열려 있는 업무 대시보드를 한 번 새로 불러옴 (옛 화면이 계속 떠 있지 않게)
const C='drawbread-v3';
const F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./dash.html','./dash.webmanifest','./dash-icon-192.png','./brand_logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim())
  .then(()=>self.clients.matchAll({type:'window'}))
  .then(cs=>Promise.all(cs.map(c=>/\/drawbread\/dash\.html/.test(c.url)&&c.navigate?c.navigate(c.url).catch(()=>null):null))));});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/drawbread/'))return;
  const nav=r.mode==='navigate',key=u.origin+u.pathname;
  e.respondWith((nav?fetch(r,{cache:'no-cache'}):fetch(r)).then(res=>{
    if(res&&res.status===200&&res.type==='basic'&&(nav||!u.search)){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp)).catch(()=>{});}
    return res;
  }).catch(()=>caches.match(key).then(x=>x||caches.match('./index.html')).then(x=>x||Response.error())));});
