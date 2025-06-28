/* ===== helper ===== */
const $ = id => document.getElementById(id);

/* Sections */
const stageDoor=$('stageDoor'),stageAbout=$('stageAbout'),stageTest=$('tester');

/* Door elems */
const doorImg=$('doorImg'),doorBtn=$('doorBtn'),aboutBtn=$('startTypingBtn');

/* Sounds */
const sndDoor=$('soundDoor'),sndAmb=$('soundAmbience'),sndType=$('soundType'),
      sndOK=$('soundCorrect'),sndErr=$('soundWrong'),sndFin=$('soundFinish');

/* Modal */
const modal=$('resultModal'),closeModal=$('closeModal');

/* Play ambience */
window.addEventListener('load',()=>{sndAmb.volume=0.25;sndAmb.play().catch(()=>{})});

/* Door → About */
doorBtn.onclick=()=>{
  sndDoor.play();
  doorImg.src='media/door-open.png';
  doorImg.classList.add('doorOpen');
  doorBtn.disabled=true;
  setTimeout(()=>{stageDoor.classList.remove('active');stageAbout.classList.add('active');},1200);
};

/* About → Game */
aboutBtn.onclick=()=>{stageAbout.classList.remove('active');stageTest.classList.add('active');$('inputBox').focus();};

/* Home → Door */
$('homeBtn').onclick=()=>{
  stageTest.classList.remove('active');stageDoor.classList.add('active');
  doorImg.src='media/door-closed.png';doorImg.classList.remove('doorOpen');doorBtn.disabled=false;
};

/* ===== Typing Engine ===== */
const texts=[
 "It does not do to dwell on dreams and forget to live.",
 "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
 "Words are, in my not so humble opinion, our most inexhaustible source of magic."
];
const disp=$('textDisplay'),inp=$('inputBox'),caret=$('caret'),prog=$('progressBar'),
      live=$('liveStats'),lT=$('liveTime'),lW=$('liveWpm'),lM=$('liveMistakes'),
      wpmO=$('wpm'),accO=$('accuracy'),timeO=$('time'),best=$('bestBadge'),
      restart=$('restartBtn'),newText=$('newTextBtn'),btnRow=document.querySelector('.btnRow');

let target="",idx=0,mist=0,start=0,timer=null;

function loadText(){target=texts[Math.floor(Math.random()*texts.length)];
  disp.innerHTML=target.split('').map(c=>`<span>${c}</span>`).join('');}

function moveCaret(){
  const s=disp.children[idx]||disp,r=s.getBoundingClientRect(),b=disp.getBoundingClientRect();
  caret.style.transform=`translate(${r.left-b.left}px,${r.top-b.top}px)`;
}

function reset(){
  inp.value="";inp.disabled=false;
  idx=mist=start=0;clearInterval(timer);
  live.classList.add('hidden');prog.style.width='0%';
  disp.scrollTop=0;best.classList.add('hidden');
  Array.from(disp.children).forEach(s=>s.classList.remove('correct','wrong'));
  modal.classList.add('hidden');
  loadText();moveCaret();
}

restart.onclick=reset;newText.onclick=()=>{loadText();reset()};
closeModal.onclick=reset;

inp.addEventListener('keydown',()=>{if(!start){
  start=Date.now();
  timer=setInterval(()=>{
    const s=Math.floor((Date.now()-start)/1000),w=Math.round((idx/5)/(s/60)||0);
    lT.textContent=s;lW.textContent=w;lM.textContent=mist;
    live.classList.remove('hidden');
  },1000);
}});

inp.addEventListener('input',()=>{
  sndType.currentTime=0;sndType.play();
  const v=inp.value,sp=disp.children;
  if(v.length<idx){for(let i=v.length;i<idx;i++){sp[i].classList.remove('correct','wrong');}
    idx=v.length;moveCaret();return;}
  for(let i=idx;i<v.length;i++){
    if(!sp[i])return;
    if(v[i]===sp[i].innerText){sp[i].classList.add('correct');sndOK.currentTime=0;sndOK.play();}
    else{sp[i].classList.add('wrong');mist++;sndErr.currentTime=0;sndErr.play();}
    idx++;moveCaret();}
  prog.style.width=`${idx/target.length*100}%`;
  if(idx===target.length) finish();
});

function finish(){
  clearInterval(timer);inp.disabled=true;sndFin.play();
  const s=Math.floor((Date.now()-start)/1000),w=Math.round((idx/5)/(s/60)||0),
        a=Math.round(((idx-mist)/idx)*100);
  wpmO.textContent=w;accO.textContent=a;timeO.textContent=s;
  modal.classList.remove('hidden');            /* show modal */
  const bestW=+localStorage.getItem('bestWPM')||0;
  if(w>bestW){localStorage.setItem('bestWPM',w);best.classList.remove('hidden');}
}

/* ===== Star background ===== */
const ctx=$('starCanvas').getContext('2d');
function fit(){ctx.canvas.width=innerWidth;ctx.canvas.height=innerHeight}
fit();addEventListener('resize',fit);
const stars=Array.from({length:120},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.3,a:Math.random()*360}));
(function animate(){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.fillStyle="#ffffff25";
  stars.forEach(s=>{s.a+=0.35;s.y+=Math.sin(s.a*0.02);if(s.y>ctx.canvas.height)s.y=0;
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
  requestAnimationFrame(animate);
})();
loadText();          /* first paragraph */
