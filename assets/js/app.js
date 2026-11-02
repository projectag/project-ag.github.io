'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const readPref = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const savePref = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
let motionOn = readPref('ag-motion', reducedMotion.matches ? 'off' : 'on') === 'on' && !reducedMotion.matches;
let frameId = null;
function applyMotion() {
  document.documentElement.classList.toggle('motion-off', !motionOn);
  document.documentElement.classList.toggle('js-motion', motionOn);
  $('#motion').textContent = `Motion: ${motionOn ? 'on' : 'off'}`;
  $('#motion').setAttribute('aria-pressed', String(!motionOn));
  if (!motionOn && frameId) { cancelAnimationFrame(frameId); frameId = null; }
  if (motionOn && !frameId && !document.hidden) frameId = requestAnimationFrame(drawMatrix);
}
$('#motion').addEventListener('click', () => { motionOn = !motionOn; savePref('ag-motion', motionOn ? 'on' : 'off'); applyMotion(); $('#announcement').textContent = `Animation ${motionOn ? 'enabled' : 'paused'}.`; });
reducedMotion.addEventListener('change', e => { if (e.matches) { motionOn = false; applyMotion(); } });

// Short cinematic intro; content never depends on it completing.
let bootTimers = [], focusBeforeBoot = null;
function finishBoot() {
  bootTimers.forEach(clearTimeout); bootTimers = [];
  $('#boot').classList.add('leaving');
  $('#main').inert = false; $('.header').inert = false; $('footer').inert = false;
  bootTimers.push(setTimeout(() => { $('#boot').hidden = true; if (focusBeforeBoot) focusBeforeBoot.focus({preventScroll:true}); focusBeforeBoot = null; }, motionOn ? 400 : 0));
  try { sessionStorage.setItem('ag-visited','1'); } catch {}
}
function showBoot(replay = false) {
  bootTimers.forEach(clearTimeout); bootTimers = [];
  if (replay) focusBeforeBoot = document.activeElement;
  const boot = $('#boot'); boot.hidden = false; boot.classList.remove('leaving');
  $('#main').inert = true; $('.header').inert = true; $('footer').inert = true;
  $('#boot-status').textContent = 'Initializing interface…';
  const line = $('.boot-line i'); line.style.animation = 'none'; void line.offsetWidth; line.style.animation = '';
  $('#skip-boot').focus({preventScroll:true});
  bootTimers.push(setTimeout(() => $('#boot-status').textContent = 'Connecting the collective…',650), setTimeout(() => $('#boot-status').textContent = 'Access granted. Welcome.',1400), setTimeout(finishBoot,2100));
}
$('#skip-boot').addEventListener('click',finishBoot);
$('#replay').addEventListener('click',() => showBoot(true));
document.addEventListener('keydown',e => { if(e.key === 'Escape') { if(!$('#boot').hidden) finishBoot(); closeMenu(); } });

// Mobile navigation and section tracking.
function closeMenu() { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded','false'); $('#menu').setAttribute('aria-label','Open navigation'); }
$('#menu').addEventListener('click',() => { const open = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded',String(open)); $('#menu').setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
$$('nav a').forEach(a => a.addEventListener('click',closeMenu));
const reveal = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); reveal.unobserve(e.target); } }),{threshold:.08});
$$('.reveal').forEach(el => reveal.observe(el));
const sections = $$('#main section[id]');
let scrollQueued = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  $('#progress').style.width = `${range > 0 ? scrollY / range * 100 : 0}%`;
  let active='home'; sections.forEach(el => { if(el.getBoundingClientRect().top < innerHeight*.45) active=el.id; });
  $$('nav a').forEach(a => { const current=a.hash === `#${active}`; a.classList.toggle('active',current); if(current) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
  scrollQueued=false;
}
addEventListener('scroll',() => { if(!scrollQueued) { scrollQueued=true; requestAnimationFrame(updateScroll); } },{passive:true});
updateScroll();

const missions = [
  {tag:'HUMAN CONNECTION / SHARED KNOWLEDGE',title:'Security is a community effort.',description:'Connecting and empowering people through community engagement. A place to exchange ideas, share what we learn, and grow together.'},
  {tag:'HANDS-ON LEARNING / PRACTICAL SKILLS',title:'Learn it. Test it. Understand it.',description:'Hands-on learning experiences in cybersecurity. Workshops turn complex ideas into practical skills through exploration, collaboration, and shared discovery.'},
  {tag:'SECURITY RESEARCH / REAL-WORLD SOLUTIONS',title:'Turn questions into working solutions.',description:'Real-world security solutions and research. We bring our technical curiosity to projects that explore how systems work—and how to make them more secure.'},
  {tag:'IDEAS IN MOTION / TECHNOLOGY EXPLORATION',title:'Make space for the next idea.',description:'A meeting point for cybersecurity, software development, and IT innovation. Explore possibilities, exchange perspectives, and build on each other’s ideas.'}
];
function selectMission(i,focus=false) {
  $$('[data-mission]').forEach((b,n) => { b.setAttribute('aria-selected',String(n===i)); b.tabIndex=n===i ? 0 : -1; });
  $('#mission-panel').setAttribute('aria-labelledby',`tab-${i}`);
  $('#mission-code').textContent=`AG / 0${i+1}`;
  $('#mission-tag').textContent=missions[i].tag;
  $('#mission-title').textContent=missions[i].title;
  $('#mission-description').textContent=missions[i].description;
  $('.network-core').textContent=['AG','>_','</>','✳'][i];
  if(motionOn && $('.mission-content').animate) $('.mission-content').animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350});
  if(focus) $(`#tab-${i}`).focus();
}
$$('[data-mission]').forEach((b,i) => { b.addEventListener('click',() => selectMission(i)); b.addEventListener('keydown',e => { let n=i; if(e.key==='ArrowDown'||e.key==='ArrowRight') n=(i+1)%4; else if(e.key==='ArrowUp'||e.key==='ArrowLeft') n=(i+3)%4; else if(e.key==='Home') n=0; else if(e.key==='End') n=3; else return; e.preventDefault(); selectMission(n,true); }); });

const team = [['Al','Binary Architect'],['Aifree','Neural Navigator'],['Joel','Quantum Keeper'],['Giovanni','Encryption Sage'],['Nico','Circuit Nomad'],['Bobby','Digital Phantom'],['Eugene','Chaos Architect'],['John','Shadow Guardian'],['Kevin','Cyber Sentinel'],['Kyle','Matrix Wanderer'],['Leandro','Code Alchemist'],['Marc','Void Walker'],['Michael','System Wraith'],['Rowel','Nexus Hunter'],['James','Grid Phantom'],['David','Neural Blade'],['Daniel','Cyber Spectre']];
function renderTeam(query='') {
  const filtered=team.filter(member => member.join(' ').toLowerCase().includes(query.toLowerCase().trim()));
  $('#team-grid').replaceChildren(...filtered.map(([name,alias]) => {
    const item=document.createElement('article'); item.className='member';
    const emblem=document.createElement('span'); emblem.className='member-emblem'; emblem.setAttribute('aria-hidden','true'); emblem.textContent=name.slice(0,2).toUpperCase();
    const info=document.createElement('div'); const title=document.createElement('h3'); title.textContent=name; const subtitle=document.createElement('p'); subtitle.textContent=alias;
    info.append(title,subtitle); item.append(emblem,info); return item;
  }));
  $('#team-count').textContent=`[${filtered.length}]`; $('#empty-team').hidden=filtered.length>0;
  if(query) $('#announcement').textContent=`${filtered.length} matching team members.`;
}
renderTeam(); $('#team-search').addEventListener('input',e => renderTeam(e.target.value));
$('#year').textContent=new Date().getFullYear();

// Decorative matrix canvas, throttled to 16fps and paused off-screen.
const canvas=$('#matrix'), ctx=canvas.getContext('2d'); let drops=[],width=0,height=0,lastFrame=0,heroVisible=true;
function resizeMatrix() { const r=$('.hero').getBoundingClientRect(); width=Math.ceil(r.width);height=Math.ceil(r.height); const ratio=Math.min(devicePixelRatio||1,1.5); canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);drops=Array.from({length:Math.ceil(width/35)},() => Math.random()*height/20); }
function drawMatrix(t) {
  frameId=null; if(!motionOn || document.hidden) return;
  if(heroVisible && t-lastFrame>65) { lastFrame=t;ctx.fillStyle='rgba(5,9,7,.09)';ctx.fillRect(0,0,width,height);ctx.fillStyle='#4aa65d';ctx.font='10px monospace';drops.forEach((y,i) => { ctx.fillText('01<>:{}'[Math.floor(Math.random()*7)],i*35,y*20);if(y*20>height && Math.random()>.98) drops[i]=0;else drops[i]+=.35; }); }
  frameId=requestAnimationFrame(drawMatrix);
}
new IntersectionObserver(entries => {heroVisible=entries[0].isIntersecting;},{threshold:0}).observe($('.hero'));
let resizeTimer;addEventListener('resize',() => {clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeMatrix,150);});
document.addEventListener('visibilitychange',() => { if(document.hidden && frameId) {cancelAnimationFrame(frameId);frameId=null;} else if(motionOn && !frameId) frameId=requestAnimationFrame(drawMatrix); });
if(matchMedia('(pointer:fine)').matches) {
  $('.hero').addEventListener('pointermove',e => { if(!motionOn)return;$('#hero-art').style.setProperty('--mx',`${(e.clientX/innerWidth-.5)*12}px`);$('#hero-art').style.setProperty('--my',`${(e.clientY/innerHeight-.5)*8}px`); });
  $('.hero').addEventListener('pointerleave',() => {$('#hero-art').style.setProperty('--mx','0px');$('#hero-art').style.setProperty('--my','0px');});
}
resizeMatrix();applyMotion();
try { if(motionOn && !sessionStorage.getItem('ag-visited')) showBoot(); } catch { /* The page works without browser storage. */ }
