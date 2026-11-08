/* 회사 Gmail: 관리자 화면 전용. 본문·첨부·인증메일·로그인 열쇠를 게시하지 않음. */
(function(root){
'use strict';
const ACCOUNT='drawbread01@gmail.com';
const authSubject=s=>/(?:확인|인증|verification|confirmation|one[- ]?time|login|sign[- ]?in|security).{0,18}(?:코드|code)|보안 링크|magic link|password reset|비밀번호 재설정|인증번호|인증 번호|일회용 비밀번호/i.test(String(s||''));
const clean=s=>String(s||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/https?:\/\/\S+/gi,'[링크 생략]').slice(0,240);
function companyGmailSafe(src){
 if(!src||src.account!==ACCOUNT)return null;
 const rows=(Array.isArray(src.rows)?src.rows:[]).filter(x=>x.account===ACCOUNT&&!authSubject(x.subject)).map(x=>({account:ACCOUNT,id:/^thread-[fa]:\d+$/.test(x.id)?x.id:'',subject:clean(x.subject),from:clean(x.from),at:Number.isFinite(Date.parse(x.at))?new Date(x.at).toISOString():null,unread:!!x.unread,kind:['business','security','general'].includes(x.kind)?x.kind:'general'}));
 return {v:1,account:ACCOUNT,status:['ok','syncError'].includes(src.status)?src.status:'syncError',checkedAt:Number.isFinite(Date.parse(src.checkedAt))?new Date(src.checkedAt).toISOString():null,lastAttemptAt:Number.isFinite(Date.parse(src.lastAttemptAt))?new Date(src.lastAttemptAt).toISOString():null,total:Math.max(rows.length,Number(src.total)||0),unread:Math.max(0,Number(src.unread)||0),excludedAuthentication:Math.max(0,Number(src.excludedAuthentication)||0),rows,companyOnly:true};
}
root.companyGmailSafe=companyGmailSafe;
root.companyGmailAuthSubject=authSubject;
root.installCompanyGmail=function(api){
const {latest,nAct,esc,logoHtml,chev,acctLine,whenShort,render,pNaver,stat,empty,ui}=api;
const STAFF=api.isStaff(),data=()=>api.getData();
const originalScreen=api.getScreen(),originalMail=api.getMail(),originalKpis=api.getKpis();
api.setScreen(function(p){p=originalScreen(p);if(p)p.gmail=STAFF?null:companyGmailSafe(p.gmail);return p;});
const get=()=>STAFF?null:companyGmailSafe(data()&&data().gmail);
const pending=g=>(g?.rows||[]).filter(x=>x.unread&&x.kind!=='general');
const time=s=>s?new Date(s).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'확인 전';
function gRows(rows){return '<div class="rows">'+rows.map((x,i)=>'<div class="row"><span class="mk '+(x.kind==='business'?'blue':x.kind==='security'?'amber':'')+'"></span><div class="bd"><div class="t1">'+(i+1)+'. '+esc(x.from)+(x.unread?' <span class="tag amber">안 읽음</span>':' <span class="tag">읽음</span>')+' <span class="tag">'+(x.kind==='business'?'업무':x.kind==='security'?'보안':'일반')+'</span></div><div class="t2">'+esc(x.subject)+'</div><div class="meta">'+esc(time(x.at))+'</div></div></div>').join('')+'</div>';}
function gNote(g){return g&&g.status!=='ok'?'<div class="note amber">최근 동기화에 실패했습니다. 아래는 마지막 성공 자료입니다. 회사 Google 계정 로그인 상태를 확인해 주세요.</div>':'';}
api.setWide(function(){
 if(STAFF)return '';
 const n=latest(data().naver),g=get(),na=nAct(n).length,ga=pending(g).length,none=!n&&!g,count=na+ga;
 const detail=n?acctLine(n):'drawbread · qkddmfrmflek · 07:00 · 22:00 확인';
 return '<div class="kpi mailw '+(none?'':count?'alert':'ok')+'" data-open="mail" data-sub="act" role="button" tabindex="0"><div class="mw-l"><div class="top">'+logoHtml('gmail')+'<span class="lb">회사메일</span></div><div class="val"><b class="num">'+(none?'–':count)+'</b><span>건 확인 권장</span></div><div class="ft"><span class="badge b-'+(g?.status==='syncError'?'amber':none?'gray':count?'red':'green')+'">'+(g?.status==='syncError'?'Gmail 갱신 확인':none?'기록 대기':count?'확인 권장':'확인 권장 없음')+'</span><span class="go">전체 보기'+chev+'</span></div></div><div class="mw-r"><button class="msub" data-open="mail" data-sub="naver">'+logoHtml('naver')+'<div class="mi"><div class="mt">회사 네이버 메일'+(n?'<span class="src">'+esc(whenShort(n))+'</span>':'')+'</div><div class="mn"><b class="num">'+(n?n.total||0:'–')+'</b><span>건 새 메일</span></div><div class="ms">'+esc(detail)+'</div><div class="ms">회사 계정만 표시</div></div><span class="go">'+chev+'</span></button><button class="msub" data-open="mail" data-sub="gmail">'+logoHtml('gmail')+'<div class="mi"><div class="mt">회사 Gmail<span class="src">'+esc(time(g?.checkedAt))+'</span></div><div class="mn"><b class="num">'+(g?g.total:'–')+'</b><span>개 대화 · 받은메일함</span></div><div class="ms">drawbread01@gmail.com</div><div class="ms">'+(g?'안 읽음 '+g.unread+' · 업무·보안 확인 권장 '+ga:'동기화 기록 대기')+'</div></div><span class="go">'+chev+'</span></button></div></div>';
});
api.setMail(function(){const r=originalMail(),g=get(),rows=pending(g);return {s:'회사 네이버 최근 알림 + Gmail 안 읽은 업무·보안 대화',h:r.h+gNote(g)+'<div class="box"><h3>회사 Gmail · 확인 권장 <span class="c">'+rows.length+'개 대화</span></h3><div class="meta">제목과 안 읽음 상태로 분류한 목록입니다. 이미 처리한 업무인지 Gmail에서 확인해 주세요.</div>'+(rows.length?gRows(rows):'<div class="note ok">안 읽은 업무·보안 대화 없음</div>')+'</div>'};});
function pCompanyGmail(){
 const g=get();if(!g)return {s:'drawbread01@gmail.com',h:empty('회사 Gmail 동기화 기록이 없습니다.')};
 let h=gNote(g)+'<div class="note ok">관리자 전용 회사 Gmail 목록입니다. 본문·첨부·인증코드·로그인 링크는 옮기지 않습니다. 원본 메일의 읽음 상태도 바꾸지 않습니다.</div><div class="box"><h3>받은메일함 · '+ACCOUNT+'</h3><div class="stats">'+stat('전체 대화',g.total)+stat('안 읽음 대화',g.unread)+stat('표시 대화',g.rows.length)+'</div><div class="meta">마지막 성공 확인 '+esc(time(g.checkedAt))+'<br>자동 확인 07:10 · 12:10 · 17:10 · 22:10 (사무실 PC와 Aside 실행·회사 Google 로그인 필요)</div></div>';
 if(g.excludedAuthentication)h+='<div class="note gray">인증·로그인용 메일 '+g.excludedAuthentication+'개는 보안을 위해 목록에서 제외했습니다.</div>';
 h+='<div class="box"><h3>최근 받은 대화 · 최신순</h3>'+(g.rows.length?gRows(g.rows):empty('받은 대화 없음'))+'</div><a class="link" href="https://mail.google.com/mail/?authuser=drawbread01%40gmail.com" target="_blank" rel="noopener noreferrer">회사 Gmail 원본 열기</a>';
 return {s:'마지막 성공 확인 '+esc(time(g.checkedAt))+' · 받은메일함 '+g.total+'개 대화',h};
}
const all=function(){const n=latest(data().naver),g=get(),t=['naver','gmail'].includes(ui.mailTab)?ui.mailTab:'act';const seg='<div class="seg">'+[['act','확인 권장',(n?nAct(n).length:0)+pending(g).length],['naver','회사 네이버',n?n.total||0:'–'],['gmail','회사 Gmail',g?g.total:'–']].map(([k,l,c])=>'<button data-mtab="'+k+'" class="'+(t===k?'on':'')+'">'+l+' <b class="num">'+c+'</b></button>').join('')+'</div>';const r=t==='gmail'?pCompanyGmail():t==='naver'?pNaver():api.getMail()();return {s:r.s,h:seg+r.h};};
api.setKpis(function(){const rows=originalKpis(),g=get(),na=nAct(latest(data().naver)).length,ga=pending(g).length;const m=rows.find(x=>x.k==='mail');if(m&&g){m.v=na+ga;m.lb='확인할 회사메일';m.ft='회사 네이버 '+na+' · Gmail '+ga;m.cls=na+ga?'alert':'ok';m.badge=na+ga?['red','확인 권장']:['green','확인 권장 없음'];}return rows;});
api.setMailAll(all);api.panels.mail[1]=all;
if(data())render();
};
})(globalThis);
