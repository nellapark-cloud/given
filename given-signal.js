/* GIVEN MINISTRY — 참여신청 신호(붉은 점) + 신청자 목록 */
(function(){
  var API = 'https://script.google.com/macros/s/AKfycbyQrODZzk319-uZzuxugBXnGbPX753E3UMNMtCvfquwRlohTQJviv-cqn9JW-mUmOMM/exec';
  var DAYS = 30;
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v);}catch(e){return null;}}
  function load(){
    var c = ss('given_apps');
    if(c){try{var o=JSON.parse(c);if(Date.now()-o.at<120000)return Promise.resolve(o.items);}catch(e){}}
    return fetch(API).then(function(r){return r.json();}).then(function(j){
      var items=(j&&j.items)||[]; ss('given_apps',JSON.stringify({at:Date.now(),items:items})); return items;
    });
  }
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function ago(t){
    var d=Math.floor((Date.now()-t)/86400000);
    if(d<1)return '오늘'; if(d<7)return d+'일 전';
    var x=new Date(t); return x.getFullYear()+'. '+String(x.getMonth()+1).padStart(2,'0')+'. '+String(x.getDate()).padStart(2,'0');
  }
  function signal(on){
    document.querySelectorAll('.nav-cta, .mobile-drawer .d-cta, .nav-hamburger').forEach(function(el){el.classList.toggle('has-signal',on);});
  }
  window.givenRefreshApplicants = function(){ ss('given_apps',''); run(); };
  function run(){
    load().then(function(items){
      var latest = items.length ? items[0].t : 0;
      var seen = +(ls('given_seen')||0);
      var list = document.getElementById('applicantList');
      if(list){
        list.innerHTML = items.length ? items.map(function(a){
          return '<li class="ap-item'+((a.t>seen && Date.now()-a.t<DAYS*864e5)?' is-new':'')+'">'+
            '<span class="ap-name">'+esc(a.n)+'</span>'+
            '<span class="ap-role">'+esc(a.role)+'</span>'+
            '<span class="ap-talent">'+esc(a.talent||'—')+'</span>'+
            '<span class="ap-date">'+ago(a.t)+'</span></li>';
        }).join('') : '<li class="ap-empty">첫 번째 신청의 주인공이 되어 주세요.</li>';
        var cnt=document.getElementById('applicantCount'); if(cnt)cnt.textContent=items.length;
        if(latest) ls('given_seen', String(latest));
        signal(false);
      } else {
        signal(latest>seen && Date.now()-latest < DAYS*864e5);
      }
    }).catch(function(){
      var list=document.getElementById('applicantList');
      if(list) list.innerHTML='<li class="ap-empty">목록을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</li>';
    });
  }
  window.GIVEN_API = API;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
