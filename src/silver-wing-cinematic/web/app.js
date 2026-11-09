'use strict';
const scene=document.querySelector('#scene'),film=document.querySelector('#film'),note=document.querySelector('#note'),state=document.querySelector('#state'),reduce=document.querySelector('#reduce');
const native=window.webkit?.messageHandlers?.cinematic;
let timer,waiting,cycle=0,sent=false,lastProgress=0,progressAt=0;
reduce.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
function bridge(message){if(native)native.postMessage(message);}
function finish(){if(sent)return;sent=true;clearTimeout(timer);clearInterval(waiting);scene.classList.add('complete');state.textContent=native?'正在平滑交接至 Codex…':'预览结束 · 原画未包含人物运动';bridge('handoff');}
function mediaError(){film.pause();film.hidden=true;clearInterval(waiting);clearTimeout(timer);state.textContent='视频读取失败，保留当前画面；可重试或进入 Codex';note.textContent='未用静态图冒充人物动画';}
function replay(){cycle++;const current=cycle;sent=false;clearTimeout(timer);clearInterval(waiting);film.pause();scene.classList.remove('complete');document.body.classList.toggle('reduced',reduce.checked);document.body.classList.toggle('override',!reduce.checked);scene.getAnimations({subtree:true}).forEach(a=>{a.cancel();a.play()});state.textContent='独立镜头转场预览 · 原启动器保留';bridge('reset');
 if(reduce.checked){film.hidden=true;timer=setTimeout(finish,600);return;}
 if(window.CINEMATIC_HAS_VIDEO){film.hidden=false;note.textContent='完整本地动画播放 · 不使用参考录屏';film.currentTime=0;film.play().then(()=>{if(current!==cycle){film.pause();return;}lastProgress=film.currentTime;progressAt=performance.now();waiting=setInterval(()=>{if(film.currentTime>lastProgress+.02){lastProgress=film.currentTime;progressAt=performance.now();}if(performance.now()-progressAt>12000)mediaError();},1000);}).catch(mediaError);
 }else{film.hidden=true;note.textContent='镜头与转场预览 · 人物为原画静态，待补充动画素材';timer=setTimeout(finish,8000);}}
film.addEventListener('ended',finish);film.addEventListener('error',mediaError);if(window.CINEMATIC_HAS_VIDEO)film.src='assets/motion.mp4';
document.querySelector('#replay').addEventListener('click',replay);reduce.addEventListener('change',replay);document.querySelector('#skip').addEventListener('click',()=>{if(native)finish();else window.open('https://chatgpt.com/codex','_blank','noopener,noreferrer');});
for(let i=0;i<32;i++){const p=document.createElement('i');p.style.cssText=`left:${(i*37)%100}%;top:${(i*19)%100}%;animation-delay:-${i%6}s`;document.querySelector('.dust').append(p);}
bridge('JS_READY');
replay();
