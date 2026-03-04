(function(){
  var saved=localStorage.getItem("squad-theme");
  if(saved) document.documentElement.setAttribute("data-theme",saved);
  updateThemeBtn();
})();
function toggleTheme(){
  var html=document.documentElement;
  var c=html.getAttribute("data-theme");
  var n=c==="dark"?"light":c==="light"?"auto":"dark";
  html.setAttribute("data-theme",n);
  localStorage.setItem("squad-theme",n);
  updateThemeBtn();
  // Re-render mermaid diagrams with updated theme
  if(typeof mermaid!=="undefined"){
    mermaid.initialize({startOnLoad:false,theme:n==="light"?"default":"dark"});
    mermaid.run();
  }
}
function updateThemeBtn(){
  var t=document.documentElement.getAttribute("data-theme");
  var b=document.getElementById("theme-btn");
  if(!b) return;
  b.textContent=t==="dark"?"\u2600\uFE0F":t==="light"?"\uD83C\uDF19":"\uD83D\uDCBB";
  syncHljsTheme();
}
function syncHljsTheme(){
  var t=document.documentElement.getAttribute("data-theme");
  var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches);
  var ld=document.getElementById("hljs-light");
  var dd=document.getElementById("hljs-dark");
  if(ld) ld.disabled=dark;
  if(dd) dd.disabled=!dark;
}
function toggleSidebar(){
  document.getElementById("sidebar").classList.toggle("open");
}
(function(){
  var input=document.getElementById("search");
  var results=document.getElementById("search-results");
  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  input.addEventListener("input",function(){
    var q=this.value.toLowerCase().trim();
    if(q.length<2){ results.classList.remove("visible"); return; }
    var matches=searchIndex.filter(function(e){
      return e.title.toLowerCase().indexOf(q)!==-1 || e.preview.toLowerCase().indexOf(q)!==-1;
    }).slice(0,10);
    if(!matches.length){ results.innerHTML='<div class="no-results">No results</div>'; }
    else { results.innerHTML=matches.map(function(m){
      return '<a href="'+m.href+'"><strong>'+esc(m.title)+'</strong><br><small>'+esc(m.preview.substring(0,100))+'</small></a>';
    }).join(""); }
    results.classList.add("visible");
  });
  input.addEventListener("blur",function(){ setTimeout(function(){ results.classList.remove("visible"); },200); });
  input.addEventListener("keydown",function(e){ if(e.key==="Escape"){ this.value=""; results.classList.remove("visible"); } });
})();
