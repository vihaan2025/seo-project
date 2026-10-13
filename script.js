/* ============================================================
   EDIT HERE: images and recipes
   ------------------------------------------------------------
   To use your own photos, put a file path or URL in "img".
   Example:  img: "images/pani-puri.jpg"
   Leave it as "" to show the coloured placeholder.
   ============================================================ */
const RECIPES = [
  { title:"Pani puri",    note:"Crisp shells, spicy mint water",     level:"Medium",   time:"45 min", icon:"💧", c:["#2fd3a5","#0d6b56"], img:"" },
  { title:"Vada pav",     note:"Mumbai's potato fritter burger",     level:"Easy",     time:"35 min", icon:"🍔", c:["#ffa31a","#a34d00"], img:"" },
  { title:"Pav bhaji",    note:"Buttery mashed vegetable curry",     level:"Easy",     time:"40 min", icon:"🍅", c:["#ff4f7b","#7d1236"], img:"" },
  { title:"Bhel puri",    note:"No-cook tangy puffed rice mix",      level:"Easy",     time:"15 min", icon:"🥣", c:["#8b5cf6","#3b1a8a"], img:"" },
  { title:"Aloo tikki chaat", note:"Golden patties with chutneys",   level:"Medium",   time:"50 min", icon:"🥔", c:["#e58a5b","#7a3516"], img:"" },
  { title:"Samosa",       note:"Flaky pastry, spiced potato filling",level:"Advanced", time:"75 min", icon:"🔺", c:["#e2b44f","#7a5210"], img:"" },
  { title:"Dahi puri",    note:"Puris with yogurt and sweet chutney",level:"Medium",   time:"30 min", icon:"🥄", c:["#dfe6f2","#56648a"], img:"" },
  { title:"Kachori",      note:"Lentil-stuffed fried bread",         level:"Advanced", time:"90 min", icon:"🟠", c:["#ff7a59","#8a2a12"], img:"" }
];
/* Hero slider: first 5 recipes by default. Or give your own list: */
const HERO_SLIDES = [0,1,2,3,4].map(i => RECIPES[i]);
const AUTOPLAY_MS = 5000;
/* ============================================================ */

/* placeholder image generator (used when img is empty or fails to load) */
function placeholder(r){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r.c[0]}"/><stop offset="1" stop-color="${r.c[1]}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="650" cy="110" r="180" fill="#fff" opacity=".12"/><circle cx="120" cy="520" r="220" fill="#fff" opacity=".08"/><text x="400" y="340" font-size="170" text-anchor="middle">${r.icon}</text><text x="400" y="460" font-size="34" font-family="sans-serif" fill="#fff" opacity=".85" text-anchor="middle">Replace with your photo</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function imgTag(r, eager){
  const src = r.img || placeholder(r);
  return `<img src="${src}" alt="${r.title}" ${eager?'':'loading="lazy"'} onerror="this.onerror=null;this.src='${placeholder(r).replace(/'/g,"%27")}'">`;
}
const lvlClass = l => l==="Easy" ? "easy" : l==="Medium" ? "med" : "";
const $ = s => document.querySelector(s);

/* hero slider */
const track = $('#heroTrack'), dotsEl = $('#heroDots');
track.innerHTML = HERO_SLIDES.map((r,i)=>`<div class="slide" aria-roledescription="slide" aria-label="${i+1} of ${HERO_SLIDES.length}">${imgTag(r,i===0)}<div class="cap glass"><b>${r.title}</b><span>${r.level} · ${r.time}</span></div></div>`).join('');
dotsEl.innerHTML = HERO_SLIDES.map((_,i)=>`<button aria-label="Go to slide ${i+1}"></button>`).join('');
let idx = 0, timer;
function go(n){
  idx = (n + HERO_SLIDES.length) % HERO_SLIDES.length;
  track.style.transform = `translateX(-${idx*100}%)`;
  [...dotsEl.children].forEach((d,i)=>d.classList.toggle('on', i===idx));
}
function play(){ clearInterval(timer); if(!matchMedia('(prefers-reduced-motion:reduce)').matches) timer = setInterval(()=>go(idx+1), AUTOPLAY_MS); }
$('#hero .prev').onclick = ()=>{go(idx-1);play()};
$('#hero .next').onclick = ()=>{go(idx+1);play()};
[...dotsEl.children].forEach((d,i)=>d.onclick=()=>{go(i);play()});
const hero = $('#hero');
hero.addEventListener('mouseenter',()=>clearInterval(timer));
hero.addEventListener('mouseleave',play);
let sx = null;
hero.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
hero.addEventListener('touchend',e=>{ if(sx===null) return; const d=e.changedTouches[0].clientX-sx; if(Math.abs(d)>40){go(idx+(d<0?1:-1));play()} sx=null });
document.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'){go(idx-1);play()} if(e.key==='ArrowRight'&&document.activeElement.closest&&document.activeElement.closest('#hero')){go(idx+1);play()} });
go(0); play();

/* cards */
function card(r){
  return `<article class="card glass">${imgTag(r)}<div class="body"><h3>${r.title}</h3><p>${r.note}</p><div class="tags"><span class="tag ${lvlClass(r.level)}">${r.level}</span><span class="tag">${r.time}</span></div></div></article>`;
}
$('#rail').innerHTML = RECIPES.slice(0,6).map(card).join('');
const rail = $('#rail');
$('#railPrev').onclick = ()=>rail.scrollBy({left:-320,behavior:'smooth'});
$('#railNext').onclick = ()=>rail.scrollBy({left:320,behavior:'smooth'});

/* filter + search */
let level = 'All', term = '';
const levels = ['All','Easy','Medium','Advanced'];
$('#chips').innerHTML = levels.map(l=>`<button class="chip ${l==='All'?'on':''}" data-l="${l}" aria-pressed="${l==='All'}">${l}</button>`).join('');
function render(){
  const list = RECIPES.filter(r => (level==='All'||r.level===level) && (r.title+' '+r.note).toLowerCase().includes(term));
  $('#grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No recipes match yet. Try another name or choose All.</p>';
}
$('#chips').onclick = e=>{
  const b = e.target.closest('.chip'); if(!b) return;
  level = b.dataset.l;
  document.querySelectorAll('.chip').forEach(c=>{const on=c===b;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)});
  render();
};
$('#searchForm').onsubmit = e=>{
  e.preventDefault(); term = $('#q').value.trim().toLowerCase(); render();
  document.getElementById('recipes').scrollIntoView({behavior:'smooth'});
};
render();

/* newsletter (frontend only) */
$('#newsForm').onsubmit = e=>{
  e.preventDefault();
  $('#msg').textContent = 'You are on the list. Your first recipe arrives next week.';
  e.target.reset();
};

/* theme toggle */
$('#theme').onclick = ()=>{
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme==='dark' : !matchMedia('(prefers-color-scheme:light)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
};
$('#yr').textContent = new Date().getFullYear();