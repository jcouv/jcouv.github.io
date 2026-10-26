(() => {
  'use strict';
  const root=document.getElementById('foucault-animation');
  if(!root) return;
  const q=s=>root.querySelector(s), svg=q('#fa-scene');
  const structure=q('#fa-structure'), rays=q('#fa-rays'), mirrors=q('#fa-mirrors'), labels=q('#fa-labels');
  const play=q('#fa-play'), position=q('#fa-position');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const period=8, tau=Math.PI*2, omega=tau/period, halfFlight=.095, flight=halfFlight*2;
  const alpha=2*omega*flight, aperture=.23, emissionPeriod=period/512, returnPeriod=period/2;
  let t=0, cycleStart=0, scrubTarget=null, running=!motion.matches, visible=true, lastTime=null;
  let width=640, cx=210, cy=135, radius=330, screenY=303;
  const f=x=>Number(x.toFixed(2));
  const line=(x1,y1,x2,y2,cls,extra='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}" ${extra}/>`;
  const dot=(x,y,r,cls,extra='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" class="${cls}" ${extra}/>`;
  const text=(x,y,label,anchor='start',extra='')=>`<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" ${extra}>${label}</text>`;
  const emitAngle=e=>omega*(e-.38);
  const wrapped=a=>((a+Math.PI)%tau+tau)%tau-Math.PI;
  const accepted=e=>Math.abs(wrapped(2*emitAngle(e)))<=aperture;
  const canReflect=e=>Math.abs(Math.cos(-Math.PI/4+emitAngle(e)))>1e-10;
  const endPoint=(a,length)=>[cx+length*Math.cos(a),cy+length*Math.sin(a)];
  const arrivalPoint=()=>[cx-Math.tan(alpha)*(screenY-cy),screenY];
  function arc(r,a,b,cls){return `<path d="M${f(cx+r*Math.cos(a))},${f(cy+r*Math.sin(a))} A${r},${r} 0 0 ${b>a?1:0} ${f(cx+r*Math.cos(b))},${f(cy+r*Math.sin(b))}" class="${cls}"/>`;}
  function mirrorAt(beta){
    const dx=32*Math.cos(beta),dy=32*Math.sin(beta);
    return `<g class="rotating-mirror" data-reflective-faces="2">${line(cx-dx,cy-dy,cx+dx,cy+dy,'mirror-line')}</g>`;
  }
  function controls(){play.textContent=running?'Pause':'Play';}
  function layout(){
    width=root.clientWidth-parseFloat(getComputedStyle(root).paddingLeft)-parseFloat(getComputedStyle(root).paddingRight);
    cx=Math.max(105,width*.34);radius=width*.55;
    // The mirror starts vertical, with reflective faces pointing left and
    // right. The fixed incoming ray grazes its edge at this exact instant.
    cycleStart=.38-period/8;
    svg.setAttribute('viewBox',`0 0 ${width} 370`);
    q('#fa-clip-rect').setAttribute('width',width);q('#fa-clip-rect').setAttribute('height',325);
    const [sx]=arrivalPoint(),fixedLabelY=Math.max(238,cy+radius*Math.sin(aperture)+25);
    structure.innerHTML=line(cx,cy,cx,screenY,'reference')+line(cx-78,screenY,cx+28,screenY,'structure')+dot(cx,screenY,3,'neutral')+dot(sx,screenY,3,'back-dot','opacity=".2"');
    labels.innerHTML=text(Math.max(0,cx-117),91,'Rotating mirror')+text(cx+radius,fixedLabelY,'Fixed concave','end')+text(cx+radius,fixedLabelY+19,'mirror','end')+text(cx+14,260,'Incoming','start','class="small"')+text(cx+14,278,'light','start','class="small"')+text(cx,328,'0','middle','class="small"')+text(sx,328,'Shifted','end','class="small"')+text(Math.max(0,cx-78),354,'Observation plane','start','class="small"');
    updateReturnWindow();
    controls();draw();
  }
  function updateReturnWindow(){
    const [sx,sy]=arrivalPoint(),exitTime=Math.hypot(sx-cx,sy-cy)/(radius/halfFlight);
    const halfWindow=aperture/(2*omega),arrivalCenter=.38+flight+exitTime;
    const start=((arrivalCenter-halfWindow-cycleStart)%returnPeriod+returnPeriod)%returnPeriod,end=start+2*halfWindow;
    // Match the native thumb's centre, whose travel excludes its 18px width.
    const travel=position.clientWidth-18;
    root.style.setProperty('--fa-flash-start',(9+travel*start/period)+'px');
    root.style.setProperty('--fa-flash-end',(9+travel*end/period)+'px');
    root.style.setProperty('--fa-flash-start2',(9+travel*(start+returnPeriod)/period)+'px');
    root.style.setProperty('--fa-flash-end2',(9+travel*(end+returnPeriod)/period)+'px');
    root.dataset.returnStart=String(start/period);root.dataset.returnEnd=String(end/period);
    root.dataset.returnStart2=String((start+returnPeriod)/period);root.dataset.returnEnd2=String((end+returnPeriod)/period);
  }
  function draw(){
    const at=cycleStart+t,a=emitAngle(at),beta=-Math.PI/4+a,phi=2*a;
    const speed=radius/halfFlight,spacing=speed*emissionPeriod,guideLength=2*spacing,packetLength=spacing*.55;
    const sourceTime=(screenY-cy)/speed,[sx,sy]=arrivalPoint(),exitAngle=Math.PI/2+alpha;
    const observationDistance=Math.hypot(sx-cx,sy-cy),exitTime=observationDistance/speed;
    let beam=line(cx,cy+Math.min(guideLength,screenY-cy),cx,cy,'direction-guide packet-out','data-guide="incoming"');
    if(canReflect(at)) beam+=line(cx,cy,...endPoint(phi,guideLength),'direction-guide packet-out','data-guide="outward"');
    const returning=accepted(at-flight),detectorOn=accepted(at-flight-exitTime);
    if(returning) beam+=line(...endPoint(2*emitAngle(at-flight),guideLength),cx,cy,'direction-guide packet-return','data-guide="returning"');
    const gateCenter=.38+returnPeriod*Math.round((at-flight-.38)/returnPeriod),gateHalf=aperture/(2*omega);
    const outputVisible=at>=gateCenter-gateHalf+flight && at<=gateCenter+gateHalf+flight+exitTime;
    if(outputVisible) beam+=line(cx,cy,...endPoint(exitAngle,Math.min(guideLength,observationDistance)),'direction-guide packet-return','data-guide="deviated"')+arc(61,Math.PI/2,exitAngle,'direction-guide packet-return');
    function packetPoint(e,at){
      const age=at-e,d=2*emitAngle(e);
      if(age<0) return age>=-sourceTime?{x:cx,y:cy-speed*age,back:false}:null;
      if(!canReflect(e)) return null;
      if(age<halfFlight || !accepted(e)){const p=endPoint(d,speed*age);return {x:p[0],y:p[1],back:false};}
      if(age<flight){const p=endPoint(d,speed*(flight-age));return {x:p[0],y:p[1],back:true};}
      if(age<flight+exitTime){const p=endPoint(exitAngle,speed*(age-flight));return {x:p[0],y:p[1],back:true};}
      return null;
    }
    // Fixed emission times preserve each packet's identity during playback
    // and reversible scrubbing. The emission lattice repeats after one turn.
    const first=Math.floor((at-flight-exitTime-.08)/emissionPeriod),last=Math.ceil((at+sourceTime)/emissionPeriod),packetHalfTime=packetLength/(2*speed);
    for(let n=first;n<=last;n++){
      const e=n*emissionPeriod,p=packetPoint(e,at);
      if(!p || p.x< -packetLength || p.x>width+packetLength || p.y<75-packetLength || p.y>screenY+packetLength) continue;
      // Follow the actual ray through a reflection while a capsule straddles
      // the mirror, rather than teleporting its ends to the next direction.
      let path='';
      for(let j=0;j<=8;j++){const part=packetPoint(e,at-packetHalfTime+j*packetHalfTime/4);if(part) path+=(path?' L':'M')+f(part.x)+','+f(part.y);}
      beam+=`<path d="${path}" class="light-packet ${p.back?'packet-return':'packet-out'}" data-packet="${n}" data-x="${f(p.x)}" data-y="${f(p.y)}"/>`;
    }
    if(detectorOn) beam+=dot(sx,sy,10,'back-dot','opacity=".18"')+dot(sx,sy,4.5,'back-dot');
    rays.innerHTML=beam;
    mirrors.innerHTML=arc(radius,-aperture,aperture,'mirror')+mirrorAt(beta)+dot(cx,cy,3,'neutral');
    root.dataset.returnActive=String(detectorOn);
    position.value=String((scrubTarget??t)/period*10000);
  }
  play.addEventListener('click',()=>{t=scrubTarget??t;scrubTarget=null;running=!running;lastTime=null;controls();});
  position.addEventListener('input',()=>{scrubTarget=Number(position.value)/10000*period;running=false;controls();if(motion.matches){t=scrubTarget;scrubTarget=null;draw();}});
  motion.addEventListener('change',e=>{if(e.matches){running=false;t=scrubTarget??t;scrubTarget=null;controls();draw();}});
  new ResizeObserver(layout).observe(root);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(root);
  layout();
  function frame(now){
    if(lastTime===null) lastTime=now;
    const elapsed=Math.min(.05,(now-lastTime)/1000);
    if(scrubTarget!==null){t+=(scrubTarget-t)*(1-Math.exp(-elapsed/.065));if(Math.abs(scrubTarget-t)<.000005){t=scrubTarget;scrubTarget=null;}draw();}
    else if(running && visible && !document.hidden){t=(t+elapsed*.35)%period;draw();}
    lastTime=now;requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
