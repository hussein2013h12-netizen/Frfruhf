const $=s=>document.querySelector(s);
let activeCategory="iraq", activeDays=3, searchTimer=null, refreshTimer=null, currentItems=[];
const names={iraq:"العراق",world:"العالم",breaking:"عاجل",football:"كرة القدم",sports:"الرياضة",politics:"السياسة",tech:"التقنية والذكاء الاصطناعي",education:"التعليم",science:"العلوم",economy:"الاقتصاد",gaming:"الألعاب",entertainment:"الترفيه"};
const icons={iraq:"✺",world:"◎",breaking:"ϟ",football:"◉",sports:"◇",politics:"⌂",tech:"⌘",education:"▤",science:"✧",economy:"↗",gaming:"▣",entertainment:"✳"};
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ago(date){if(!date)return "وقت النشر غير محدد";let d=new Date(date);if(isNaN(d))return date;let n=Math.max(0,Math.floor((Date.now()-d.getTime())/60000));if(n<1)return "قبل لحظات";if(n<60)return `قبل ${n} د`;let h=Math.floor(n/60);if(h<24)return `قبل ${h} س`;return `قبل ${Math.floor(h/24)} يوم`;}
function render(items){
 currentItems=items||[];$("#newsCount").textContent=`${items.length} خبر`;
 $("#newsGrid").innerHTML=items.map((x,i)=>`<article class="news-card" style="animation-delay:${Math.min(i,10)*.045}s">
 <div class="news-image">${x.image?`<img src="${esc(x.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>✧</div>'">`:`<div class="image-placeholder">✧</div>`}<span class="news-label">${esc(x.category||names[activeCategory])}</span></div>
 <div class="news-body"><h3>${esc(x.title)}</h3>${x.summary?`<p class="news-summary">${esc(x.summary)}</p>`:""}<div class="news-foot"><div><div class="source">${esc(x.source||"مصدر الخبر")}</div><div class="time">${esc(ago(x.published))}</div></div><div class="card-actions"><button class="mini-btn save-btn" data-id="${esc(x.id)}">☆ حفظ</button><a class="mini-btn" href="${esc(x.url)}" target="_blank" rel="noopener">اقرأ ↗</a></div></div></div></article>`).join("");
 $("#emptyState").hidden=items.length>0;
 document.querySelectorAll(".save-btn").forEach(b=>{let saved=JSON.parse(localStorage.getItem("nabaa_saved")||"[]");if(saved.includes(b.dataset.id)){b.classList.add("saved");b.textContent="★ محفوظ"}b.onclick=()=>toggleSave(b.dataset.id,b)});
}
function toggleSave(id,btn){let a=JSON.parse(localStorage.getItem("nabaa_saved")||"[]");if(a.includes(id)){a=a.filter(x=>x!==id);btn.textContent="☆ حفظ";btn.classList.remove("saved")}else{a.push(id);btn.textContent="★ محفوظ";btn.classList.add("saved")}localStorage.setItem("nabaa_saved",JSON.stringify(a))}
async function loadNews(manual=false){
 const btn=$("#refreshBtn");btn.classList.add("spinning");$("#status").textContent="جارٍ التحقق من آخر الأخبار من المصدر...";
 try{
  const q=$("#searchInput").value.trim();let url=`/api/news?category=${encodeURIComponent(activeCategory)}&days=${activeDays}`+(q?`&q=${encodeURIComponent(q)}`:"");
  const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error("network");const data=await r.json();render(data.items||[]);
  const t=new Date(data.updated_at);$("#lastUpdate").textContent=`آخر تحقق: ${t.toLocaleTimeString("ar-IQ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`;
  $("#status").textContent=data.error||`المصدر: ${data.source||"RSS"} · تم التحقق الآن · تحديث تلقائي كل 20 ثانية`;
 }catch(e){$("#status").textContent="تعذر الاتصال حالياً. سيحاول التطبيق مجدداً تلقائياً."}
 finally{btn.classList.remove("spinning")}
}
function chooseCategory(cat){activeCategory=cat;document.querySelectorAll(".cat").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));$("#sectionTitle").textContent=`آخر أخبار ${names[cat]}`;loadNews()}
document.querySelectorAll(".cat").forEach(b=>b.addEventListener("click",()=>chooseCategory(b.dataset.cat)));
$("#refreshBtn").onclick=()=>loadNews(true);
$("#daysSelect").onchange=e=>{activeDays=Number(e.target.value);loadNews()};
$("#searchInput").addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadNews(),450)});
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("nabaa_theme",document.body.classList.contains("light")?"light":"dark")};
if(localStorage.getItem("nabaa_theme")==="light")document.body.classList.add("light");
async function ask(q){if(!q.trim())return;$("#aiAnswer").hidden=false;$("#aiAnswer").textContent="يفكر مساعد الأخبار ويجمع أحدث العناوين...";$("#askBtn").disabled=true;try{let r=await fetch(`/api/ask?q=${encodeURIComponent(q)}&days=${activeDays}`);let d=await r.json();$("#aiAnswer").textContent=d.answer||"لا توجد إجابة حالياً."}catch(e){$("#aiAnswer").textContent="تعذر الاتصال بالمساعد حالياً."}finally{$("#askBtn").disabled=false}}
$("#askBtn").onclick=()=>ask($("#askInput").value);
$("#askInput").addEventListener("keydown",e=>{if(e.key==="Enter")ask(e.target.value)});
document.querySelectorAll("[data-ask]").forEach(b=>b.onclick=()=>{$("#askInput").value=b.dataset.ask;ask(b.dataset.ask)});
loadNews();refreshTimer=setInterval(loadNews,20000);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/static/sw.js").catch(()=>{}));
