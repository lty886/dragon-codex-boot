'use strict';
const app=document.querySelector('#app');
const character=document.querySelector('#character');
const statusText=document.querySelector('#status');
const home=document.querySelector('#home');
const reduce=document.querySelector('#reduce');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let timers=[];let greetingTimer;
let saved=null;try{saved=localStorage.getItem('dragon-reduced-motion')}catch{}
reduce.checked=saved===null?preference.matches:saved==='true';
function finish(){app.classList.add('ready');app.classList.remove('intro');home.hidden=false;statusText.textContent='轻点少女，打个招呼';}
function replay(){timers.forEach(clearTimeout);timers=[];clearTimeout(greetingTimer);character.classList.remove('greeting');app.classList.remove('ready');app.classList.add('intro');home.hidden=true;document.body.classList.toggle('reduced',reduce.checked);document.body.classList.toggle('motion-override',!reduce.checked);app.style.display='none';void app.offsetHeight;app.style.display='';// Restart CSS timelines without rebuilding accessible controls.
const animated=[...app.querySelectorAll('*')];animated.forEach(el=>el.getAnimations().forEach(a=>{a.cancel();a.play()}));
statusText.textContent=reduce.checked?'已减少动态效果':'正在唤醒龙翼少女…';
if(reduce.checked){finish();return;}
[[2000,'微光中的呼吸'],[4000,'展开龙翼，唤起魔法'],[6000,'准备好，一起创造']].forEach(([delay,text])=>timers.push(setTimeout(()=>{statusText.textContent=text},delay)));
timers.push(setTimeout(finish,8000));}
reduce.addEventListener('change',()=>{try{localStorage.setItem('dragon-reduced-motion',String(reduce.checked))}catch{}replay()});
preference.addEventListener('change',event=>{let value=null;try{value=localStorage.getItem('dragon-reduced-motion')}catch{}if(value===null){reduce.checked=event.matches;replay()}});
document.querySelector('#replay').addEventListener('click',replay);
character.addEventListener('click',()=>{clearTimeout(greetingTimer);character.classList.remove('greeting');void character.offsetWidth;character.classList.add('greeting');statusText.textContent=reduce.checked?'你好，今天一起创造什么？':'你好！龙翼少女向你挥手';greetingTimer=setTimeout(()=>{character.classList.remove('greeting');if(app.classList.contains('ready'))statusText.textContent='轻点少女，打个招呼'},1400)});
const dialog=document.querySelector('#launch');document.querySelector('#enter').addEventListener('click',()=>dialog.showModal());document.querySelector('#close').addEventListener('click',()=>dialog.close());
for(let i=0;i<18;i++){const dot=document.createElement('span');dot.className='particle';dot.textContent=i%3===0?'✧':'·';dot.style.cssText=`--x:${12+(i*37%78)}%;--y:${15+(i*23%70)}%;--s:${10+i%4*3}px;--d:${i%7*.23}s`;document.querySelector('#particles').append(dot)}
replay();

// Validate local art without fetching anything from an external service.
const artwork=new Image();
artwork.onerror=()=>{
  timers.forEach(clearTimeout);timers=[];finish();
  character.disabled=true;
  character.querySelector('svg').style.display='none';
  const note=document.createElement('p');note.className='missing-art';
  note.textContent='请将少女原画保存为 web/assets/dragon.jpg，再刷新页面。';
  character.append(note);statusText.textContent='需要补充本地参考图';
};
artwork.src='assets/dragon.jpg';
