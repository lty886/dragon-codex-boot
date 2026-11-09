import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element{constructor(){this.classes=new Set();this.classList={add:(...v)=>v.forEach(x=>this.classes.add(x)),remove:(...v)=>v.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};this.style={};this.listeners={};this.hidden=false;}addEventListener(n,f){this.listeners[n]=f}querySelectorAll(){return[]}append(){}showModal(){this.open=true}close(){this.open=false}}
const elements=Object.fromEntries(['app','character','status','home','reduce','replay','launch','enter','close','particles'].map(id=>['#'+id,new Element()]));
let now=0,id=0;const jobs=new Map(),store=new Map();
const run=ms=>{now+=ms;for(const [key,job] of [...jobs])if(job.at<=now){jobs.delete(key);job.fn()}};
vm.runInNewContext(readFileSync(new URL('web/app.js',import.meta.url),'utf8'),{document:{querySelector:s=>elements[s],body:new Element(),createElement:()=>new Element()},Image:class{set src(value){}},matchMedia:()=>({matches:false,addEventListener(){}}),localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},setTimeout:(fn,ms)=>{jobs.set(++id,{fn,at:now+ms});return id},clearTimeout:key=>jobs.delete(key)});
assert.equal(elements['#home'].hidden,true);run(6000);assert.match(elements['#status'].textContent,/准备好/);assert.equal(elements['#home'].hidden,true);run(2000);assert.equal(elements['#home'].hidden,false);
elements['#replay'].listeners.click();run(1000);elements['#replay'].listeners.click();run(7000);assert.equal(elements['#home'].hidden,true);run(1000);assert.equal(elements['#home'].hidden,false);
elements['#character'].listeners.click();assert(elements['#character'].classList.contains('greeting'));run(1400);assert(!elements['#character'].classList.contains('greeting'));
elements['#reduce'].checked=true;elements['#reduce'].listeners.change();assert.equal(elements['#home'].hidden,false);assert.equal(store.get('dragon-reduced-motion'),'true');assert.equal(jobs.size,0);
elements['#enter'].listeners.click();assert.equal(elements['#launch'].open,true);elements['#close'].listeners.click();assert.equal(elements['#launch'].open,false);
console.log('PASS: 8s transition, replay timer cleanup, greeting, reduced motion and dialog. Browser visual QA is still required.');
